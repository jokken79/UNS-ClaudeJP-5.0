"""
Payroll Service for UNS-ClaudeJP 2.0
Automatic payroll calculation with all rules
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, List
from decimal import Decimal

from app.core.config import settings

logger = logging.getLogger(__name__)


class PayrollService:
    """Service for automatic payroll calculation"""
    
    def __init__(self):
        self.overtime_rate = Decimal('1.25')  # 25% premium
        self.night_rate = Decimal('0.25')     # 25% night premium  
        self.holiday_rate = Decimal('1.35')   # 35% holiday premium
    
    def calculate_monthly_payroll(
        self,
        employee_id: int,
        year: int,
        month: int,
        timer_cards: List[Dict],
        factory_config: Dict,
        db_session=None
    ) -> Dict:
        """
        Calculate complete monthly payroll

        Args:
            employee_id: Employee ID
            year: Year
            month: Month
            timer_cards: List of timer card records
            factory_config: Factory configuration with jikyu_tanka, etc.
            db_session: Optional database session for querying employee data

        Returns:
            Dict with complete payroll breakdown
        """
        logger.info(f"Calculating payroll for employee {employee_id} - {year}/{month}")
        
        # 1. Calculate hours breakdown
        hours_data = self._calculate_hours(timer_cards)
        
        # 2. Get base rate from factory
        jikyu_tanka = Decimal(str(factory_config.get('jikyu_tanka', 1500)))
        
        # 3. Calculate base payments
        base_pay = hours_data['normal_hours'] * jikyu_tanka
        overtime_pay = hours_data['overtime_hours'] * jikyu_tanka * self.overtime_rate
        night_pay = hours_data['night_hours'] * jikyu_tanka * self.night_rate
        holiday_pay = hours_data['holiday_hours'] * jikyu_tanka * self.holiday_rate
        
        # 4. Calculate bonuses
        bonuses = self._calculate_bonuses(
            employee_id, 
            factory_config, 
            hours_data,
            year,
            month
        )
        
        # 5. Calculate deductions
        deductions = self._calculate_deductions(
            employee_id,
            base_pay + overtime_pay + night_pay + holiday_pay,
            year,
            month,
            db_session=db_session
        )
        
        # 6. Calculate totals
        gross_pay = base_pay + overtime_pay + night_pay + holiday_pay + bonuses['total']
        net_pay = gross_pay - deductions['total']
        
        result = {
            "employee_id": employee_id,
            "year": year,
            "month": month,
            "hours": {
                "total_hours": float(hours_data['total_hours']),
                "normal_hours": float(hours_data['normal_hours']),
                "overtime_hours": float(hours_data['overtime_hours']),
                "night_hours": float(hours_data['night_hours']),
                "holiday_hours": float(hours_data['holiday_hours']),
                "work_days": hours_data['work_days']
            },
            "payments": {
                "jikyu_tanka": float(jikyu_tanka),
                "base_pay": float(base_pay),
                "overtime_pay": float(overtime_pay),
                "night_pay": float(night_pay),
                "holiday_pay": float(holiday_pay)
            },
            "bonuses": {
                "gasoline": float(bonuses.get('gasoline', 0)),
                "attendance": float(bonuses.get('attendance', 0)),
                "performance": float(bonuses.get('performance', 0)),
                "total": float(bonuses['total'])
            },
            "deductions": {
                "apartment": float(deductions.get('apartment', 0)),
                "insurance": float(deductions.get('insurance', 0)),
                "tax": float(deductions.get('tax', 0)),
                "other": float(deductions.get('other', 0)),
                "total": float(deductions['total'])
            },
            "gross_pay": float(gross_pay),
            "net_pay": float(net_pay),
            "calculation_date": datetime.now().isoformat(),
            "status": "CALCULATED"
        }
        
        logger.info(f"Payroll calculated: Gross={gross_pay}, Net={net_pay}")
        return result
    
    def _calculate_hours(self, timer_cards: List[Dict]) -> Dict:
        """
        Calculate hours breakdown from timer cards
        
        Returns:
            Dict with hours breakdown
        """
        total_hours = Decimal('0')
        normal_hours = Decimal('0')
        overtime_hours = Decimal('0')
        night_hours = Decimal('0')
        holiday_hours = Decimal('0')
        work_days = 0
        
        for card in timer_cards:
            try:
                # Parse times
                work_date = card.get('work_date')
                clock_in = card.get('clock_in')
                clock_out = card.get('clock_out')
                
                if not all([work_date, clock_in, clock_out]):
                    continue
                
                # Convert to datetime objects
                date_obj = datetime.strptime(str(work_date), '%Y-%m-%d')
                start = datetime.strptime(clock_in, '%H:%M')
                end = datetime.strptime(clock_out, '%H:%M')
                
                # Handle overnight shifts
                if end < start:
                    end += timedelta(days=1)
                
                # Calculate total hours for this day
                hours = Decimal(str((end - start).total_seconds() / 3600))
                total_hours += hours
                work_days += 1
                
                # Check if weekend/holiday
                is_weekend = date_obj.weekday() >= 5  # Saturday or Sunday
                
                if is_weekend:
                    # All hours on weekend are holiday hours
                    holiday_hours += hours
                else:
                    # Normal weekday
                    if hours > 8:
                        normal_hours += Decimal('8')
                        overtime_hours += (hours - Decimal('8'))
                    else:
                        normal_hours += hours
                
                # Calculate night hours (22:00 - 05:00)
                night_hrs = self._calculate_night_hours(start, end)
                if night_hrs > 0:
                    night_hours += Decimal(str(night_hrs))
                
            except Exception as e:
                logger.error(f"Error processing timer card: {e}")
                continue
        
        return {
            'total_hours': total_hours,
            'normal_hours': normal_hours,
            'overtime_hours': overtime_hours,
            'night_hours': night_hours,
            'holiday_hours': holiday_hours,
            'work_days': work_days
        }
    
    def _calculate_night_hours(self, start: datetime, end: datetime) -> float:
        """
        Calculate night hours (22:00 - 05:00)
        
        Args:
            start: Shift start time
            end: Shift end time
            
        Returns:
            float: Night hours worked
        """
        night_start = start.replace(hour=22, minute=0, second=0)
        night_end = (start + timedelta(days=1)).replace(hour=5, minute=0, second=0)
        
        # Find overlap between work period and night period
        work_start = start
        work_end = end
        
        overlap_start = max(work_start, night_start)
        overlap_end = min(work_end, night_end)
        
        if overlap_start < overlap_end:
            return (overlap_end - overlap_start).total_seconds() / 3600
        return 0.0
    
    def _calculate_bonuses(
        self,
        employee_id: int,
        factory_config: Dict,
        hours_data: Dict,
        year: int,
        month: int
    ) -> Dict:
        """
        Calculate bonuses (gasoline, attendance, performance, etc.)
        
        Returns:
            Dict with bonus breakdown
        """
        bonuses = {
            'gasoline': Decimal('0'),
            'attendance': Decimal('0'),
            'performance': Decimal('0'),
            'total': Decimal('0')
        }
        
        # Gasoline allowance (if configured)
        if factory_config.get('gasoline_allowance'):
            bonuses['gasoline'] = Decimal(str(factory_config.get('gasoline_amount', 5000)))
        
        # Perfect attendance bonus (if worked full month)
        expected_work_days = self._get_expected_work_days(year, month)
        if hours_data['work_days'] >= expected_work_days:
            bonuses['attendance'] = Decimal(str(factory_config.get('attendance_bonus', 10000)))
        
        # Performance bonus (if configured)
        if factory_config.get('performance_bonus'):
            bonuses['performance'] = Decimal(str(factory_config.get('performance_amount', 0)))
        
        bonuses['total'] = sum([
            bonuses['gasoline'],
            bonuses['attendance'],
            bonuses['performance']
        ])
        
        return bonuses
    
    def _calculate_deductions(
        self,
        employee_id: int,
        gross_income: Decimal,
        year: int,
        month: int,
        db_session=None,
        employee_data=None
    ) -> Dict:
        """
        Calculate deductions (apartment, insurance, tax, etc.)

        Args:
            employee_id: Employee ID
            gross_income: Gross income for the month
            year: Year
            month: Month
            db_session: Optional database session for querying employee data
            employee_data: Optional pre-loaded employee data dict

        Returns:
            Dict with deduction breakdown
        """
        deductions = {
            'apartment': Decimal('0'),
            'insurance': Decimal('0'),
            'tax': Decimal('0'),
            'other': Decimal('0'),
            'total': Decimal('0')
        }

        # Get employee data if not provided
        employee = employee_data
        if not employee and db_session:
            try:
                from sqlalchemy.orm import joinedload
                from app.models.models import Employee

                employee_obj = db_session.query(Employee).options(
                    joinedload(Employee.apartment)
                ).filter(Employee.id == employee_id).first()

                if employee_obj:
                    employee = {
                        'apartment': employee_obj.apartment,
                        'apartment_rent': employee_obj.apartment_rent,
                        'health_insurance': employee_obj.health_insurance,
                        'nursing_insurance': employee_obj.nursing_insurance,
                        'pension_insurance': employee_obj.pension_insurance,
                    }
            except Exception as e:
                logger.warning(f"Could not load employee data for deductions: {e}")
                employee = None

        # 1. APARTMENT DEDUCTION - Use actual apartment rent
        if employee:
            # First priority: apartment relationship (monthly_rent from Apartment table)
            if employee.get('apartment') and hasattr(employee['apartment'], 'monthly_rent'):
                deductions['apartment'] = Decimal(str(employee['apartment'].monthly_rent or 0))
            # Second priority: apartment_rent stored directly on Employee
            elif employee.get('apartment_rent'):
                deductions['apartment'] = Decimal(str(employee['apartment_rent']))

            # TODO: Prorate if employee moved in/out during month
            # (Would need apartment_start_date and apartment_move_out_date)
        else:
            # Fallback: No apartment deduction if no employee data
            logger.warning(f"No employee data available for apartment deduction (employee_id={employee_id})")

        # 2. SOCIAL INSURANCE DEDUCTION - Use actual insurance amounts
        # Employee model stores health_insurance, nursing_insurance, pension_insurance as amounts
        if employee:
            health_ins = employee.get('health_insurance') or 0
            nursing_ins = employee.get('nursing_insurance') or 0
            pension_ins = employee.get('pension_insurance') or 0

            # Sum all insurance deductions
            deductions['insurance'] = Decimal(str(health_ins + nursing_ins + pension_ins))
        else:
            # Fallback: Calculate using default rate if no employee data
            if gross_income > 0:
                # Use configurable default rate (15% = health + pension combined)
                default_rate = Decimal('0.15')
                deductions['insurance'] = gross_income * default_rate
                logger.warning(
                    f"Using default insurance rate {default_rate} for employee_id={employee_id}. "
                    "Consider setting health_insurance, nursing_insurance, and pension_insurance in Employee record."
                )

        # 3. INCOME TAX DEDUCTION - Simplified withholding calculation
        # Note: Employee model doesn't have a tax_rate field, so we use simplified calculation
        # Real calculation would use official tax tables and withholding rates
        if gross_income > 88000:  # Tax threshold (¥88,000)
            # 5% simplified withholding rate
            # TODO: Use actual progressive tax rates from official tax tables
            tax_rate = Decimal('0.05')
            deductions['tax'] = (gross_income - Decimal('88000')) * tax_rate

        # Calculate total deductions
        deductions['total'] = sum([
            deductions['apartment'],
            deductions['insurance'],
            deductions['tax'],
            deductions['other']
        ])

        return deductions
    
    def _get_expected_work_days(self, year: int, month: int) -> int:
        """
        Calculate expected work days in month (excluding weekends)
        
        Returns:
            int: Expected work days
        """
        from calendar import monthrange
        
        # Get number of days in month
        _, num_days = monthrange(year, month)
        
        work_days = 0
        for day in range(1, num_days + 1):
            date = datetime(year, month, day)
            # Count weekdays only (Monday=0, Sunday=6)
            if date.weekday() < 5:
                work_days += 1
        
        return work_days
    
    def compare_jikyu_vs_tanka(
        self,
        payroll_data: Dict,
        actual_revenue: Decimal
    ) -> Dict:
        """
        Compare jikyu (employee cost) vs jikyu_tanka (revenue rate)
        Calculate profit margin
        
        Args:
            payroll_data: Calculated payroll data
            actual_revenue: Actual revenue received from factory
            
        Returns:
            Dict with comparison and profit analysis
        """
        total_cost = Decimal(str(payroll_data['gross_pay']))
        total_hours = Decimal(str(payroll_data['hours']['total_hours']))
        
        # Calculate effective rates
        cost_per_hour = total_cost / total_hours if total_hours > 0 else Decimal('0')
        revenue_per_hour = actual_revenue / total_hours if total_hours > 0 else Decimal('0')
        
        # Calculate profit
        profit = actual_revenue - total_cost
        profit_margin = (profit / actual_revenue * 100) if actual_revenue > 0 else Decimal('0')
        
        return {
            "cost_per_hour": float(cost_per_hour),
            "revenue_per_hour": float(revenue_per_hour),
            "total_cost": float(total_cost),
            "total_revenue": float(actual_revenue),
            "profit": float(profit),
            "profit_margin_percent": float(profit_margin),
            "is_profitable": profit > 0
        }


# Global instance
payroll_service = PayrollService()
