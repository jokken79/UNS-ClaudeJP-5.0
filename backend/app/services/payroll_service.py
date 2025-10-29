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
    """Servicio de cálculo automático de nómina para sistema de gestión de recursos humanos.

    Implementa las reglas de cálculo de nómina japonesa incluyendo:
    - Pago base por horas trabajadas
    - Recargos por horas extras (時間外手当)
    - Recargos por trabajo nocturno (深夜手当)
    - Recargos por trabajo en días festivos (休日手当)
    - Bonificaciones (手当)
    - Deducciones (控除): apartamento, seguro social, impuestos

    Attributes:
        overtime_rate (Decimal): Tasa de recargo por horas extras (1.25 = 25%)
        night_rate (Decimal): Tasa de recargo nocturno (0.25 = 25% adicional)
        holiday_rate (Decimal): Tasa de recargo por festivos (1.35 = 35%)

    Note:
        - Usa Decimal para evitar errores de precisión en cálculos monetarios
        - Cumple con regulaciones laborales japonesas
        - Horario nocturno definido: 22:00 - 05:00
        - Horas extras: más de 8 horas al día
        - Fin de semana: Sábado y Domingo

    Examples:
        >>> service = PayrollService()
        >>> payroll = service.calculate_monthly_payroll(
        ...     employee_id=123,
        ...     year=2025,
        ...     month=10,
        ...     timer_cards=[...],
        ...     factory_config={'jikyu_tanka': 1500}
        ... )
        >>> print(f"Pago neto: ¥{payroll['net_pay']:,.0f}")
    """

    def __init__(self):
        """Inicializa el servicio con las tasas estándar de recargo."""
        self.overtime_rate = Decimal('1.25')  # 25% premium
        self.night_rate = Decimal('0.25')     # 25% night premium
        self.holiday_rate = Decimal('1.35')   # 35% holiday premium
    
    def calculate_monthly_payroll(
        self,
        employee_id: int,
        year: int,
        month: int,
        timer_cards: List[Dict],
        factory_config: Dict
    ) -> Dict:
        """Calcula la nómina completa mensual de un empleado.

        Proceso de cálculo:
        1. Calcula horas trabajadas (normales, extras, nocturnas, festivas)
        2. Obtiene tarifa base (jikyu_tanka) de configuración de fábrica
        3. Calcula pagos base con recargos aplicados
        4. Calcula bonificaciones (gasolina, asistencia, desempeño)
        5. Calcula deducciones (apartamento, seguro social, impuestos)
        6. Calcula totales (bruto y neto)

        Args:
            employee_id (int): ID del empleado
            year (int): Año de la nómina (ej. 2025)
            month (int): Mes de la nómina (1-12)
            timer_cards (List[Dict]): Lista de registros de tarjetas de tiempo.
                Cada registro debe tener:
                {
                    'work_date': str | datetime,  # Fecha de trabajo
                    'clock_in': str,  # Hora entrada (HH:MM)
                    'clock_out': str,  # Hora salida (HH:MM)
                }
            factory_config (Dict): Configuración de la fábrica con:
                {
                    'jikyu_tanka': float,  # Tarifa por hora (ej. 1500)
                    'gasoline_allowance': bool,  # Si aplica bono gasolina
                    'gasoline_amount': float,  # Monto del bono
                    'attendance_bonus': float,  # Bono asistencia perfecta
                    'performance_bonus': bool,  # Si aplica bono desempeño
                    'performance_amount': float,  # Monto del bono
                }

        Returns:
            Dict: Diccionario completo con desglose de nómina:
                {
                    "employee_id": int,
                    "year": int,
                    "month": int,
                    "hours": {
                        "total_hours": float,
                        "normal_hours": float,
                        "overtime_hours": float,  # Horas extras (>8h/día)
                        "night_hours": float,  # Horas nocturnas (22:00-05:00)
                        "holiday_hours": float,  # Horas en fin de semana
                        "work_days": int
                    },
                    "payments": {
                        "jikyu_tanka": float,  # Tarifa base por hora
                        "base_pay": float,  # Pago base
                        "overtime_pay": float,  # Pago horas extras (+25%)
                        "night_pay": float,  # Pago nocturno (+25%)
                        "holiday_pay": float  # Pago festivo (+35%)
                    },
                    "bonuses": {
                        "gasoline": float,
                        "attendance": float,  # Asistencia perfecta
                        "performance": float,
                        "total": float
                    },
                    "deductions": {
                        "apartment": float,  # Renta apartamento
                        "insurance": float,  # Seguro social
                        "tax": float,  # Impuesto sobre renta
                        "other": float,
                        "total": float
                    },
                    "gross_pay": float,  # Total bruto
                    "net_pay": float,  # Total neto (bruto - deducciones)
                    "calculation_date": str,  # ISO timestamp
                    "status": "CALCULATED"
                }

        Examples:
            >>> timer_cards = [
            ...     {'work_date': '2025-10-01', 'clock_in': '08:00', 'clock_out': '17:00'},
            ...     {'work_date': '2025-10-02', 'clock_in': '08:00', 'clock_out': '19:00'},  # 1h extra
            ... ]
            >>> factory_config = {
            ...     'jikyu_tanka': 1500,
            ...     'gasoline_allowance': True,
            ...     'gasoline_amount': 5000
            ... }
            >>> payroll = service.calculate_monthly_payroll(
            ...     employee_id=123,
            ...     year=2025,
            ...     month=10,
            ...     timer_cards=timer_cards,
            ...     factory_config=factory_config
            ... )

        Note:
            - Horas extras se calculan por DÍA (no mensual)
            - Trabajo nocturno (22:00-05:00) tiene recargo del 25%
            - Fin de semana completo es considerado festivo (recargo 35%)
            - Usa Decimal para evitar errores de redondeo
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
            month
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
        """Calcula el desglose detallado de horas trabajadas.

        Procesa todas las tarjetas de tiempo del mes y categoriza las horas
        en: normales, extras, nocturnas, festivas.

        Args:
            timer_cards (List[Dict]): Lista de registros de tiempo con:
                - work_date: Fecha de trabajo
                - clock_in: Hora de entrada (HH:MM)
                - clock_out: Hora de salida (HH:MM)

        Returns:
            Dict: Desglose de horas:
                {
                    'total_hours': Decimal,  # Total horas trabajadas
                    'normal_hours': Decimal,  # Horas normales (hasta 8h/día)
                    'overtime_hours': Decimal,  # Horas extras (>8h/día)
                    'night_hours': Decimal,  # Horas nocturnas (22:00-05:00)
                    'holiday_hours': Decimal,  # Horas en fin de semana
                    'work_days': int  # Días trabajados
                }

        Note:
            - Maneja turnos nocturnos (si clock_out < clock_in, añade 1 día)
            - Fin de semana: Sábado (5) y Domingo (6)
            - Horas extras: solo en días laborables cuando >8h
            - Horas nocturnas se calculan independientemente
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
        """Calcula las horas trabajadas en horario nocturno.

        Horario nocturno japonés: 22:00 - 05:00 (siguiente día)

        Args:
            start (datetime): Hora de inicio del turno
            end (datetime): Hora de fin del turno (puede ser día siguiente)

        Returns:
            float: Horas trabajadas en período nocturno

        Examples:
            >>> # Turno 08:00 - 17:00 (sin horario nocturno)
            >>> night_hours = service._calculate_night_hours(
            ...     datetime(2025, 10, 1, 8, 0),
            ...     datetime(2025, 10, 1, 17, 0)
            ... )
            >>> assert night_hours == 0.0

            >>> # Turno 22:00 - 05:00 (7 horas nocturnas)
            >>> night_hours = service._calculate_night_hours(
            ...     datetime(2025, 10, 1, 22, 0),
            ...     datetime(2025, 10, 2, 5, 0)
            ... )
            >>> assert night_hours == 7.0

        Note:
            - Calcula solapamiento entre período de trabajo y 22:00-05:00
            - Retorna 0.0 si no hay solapamiento
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
        """Calcula las bonificaciones mensuales del empleado.

        Tipos de bonificaciones:
        - Gasolina (gasoline): Si está configurado en la fábrica
        - Asistencia perfecta (attendance): Si trabajó todos los días esperados
        - Desempeño (performance): Según configuración de fábrica

        Args:
            employee_id (int): ID del empleado
            factory_config (Dict): Configuración de fábrica con montos de bonos
            hours_data (Dict): Datos de horas trabajadas (para verificar asistencia)
            year (int): Año de cálculo
            month (int): Mes de cálculo

        Returns:
            Dict: Desglose de bonificaciones:
                {
                    'gasoline': Decimal,  # Bono de gasolina
                    'attendance': Decimal,  # Bono asistencia perfecta
                    'performance': Decimal,  # Bono de desempeño
                    'total': Decimal  # Suma total de bonos
                }

        Note:
            - Bono de asistencia requiere trabajar todos los días laborables del mes
            - Los montos se obtienen de factory_config
            - Retorna 0 para bonos no configurados
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
        month: int
    ) -> Dict:
        """Calcula las deducciones mensuales del empleado.

        Tipos de deducciones:
        - Apartamento (apartment): Renta prorrateada si aplica
        - Seguro social (insurance): ~15% del ingreso bruto
        - Impuesto (tax): Retención simplificada del 5% sobre excedente
        - Otros (other): Otras deducciones configuradas

        Args:
            employee_id (int): ID del empleado
            gross_income (Decimal): Ingreso bruto mensual
            year (int): Año de cálculo
            month (int): Mes de cálculo

        Returns:
            Dict: Desglose de deducciones:
                {
                    'apartment': Decimal,  # Renta de apartamento
                    'insurance': Decimal,  # Seguro social (salud + pensión)
                    'tax': Decimal,  # Impuesto sobre la renta
                    'other': Decimal,  # Otras deducciones
                    'total': Decimal  # Suma total de deducciones
                }

        Note:
            - TODO: Obtener deducciones específicas del empleado desde DB
            - Cálculo de seguro social es simplificado (~15%)
            - Impuesto se aplica solo sobre ingresos >¥88,000
            - Los valores actuales son placeholders
        """
        deductions = {
            'apartment': Decimal('0'),
            'insurance': Decimal('0'),
            'tax': Decimal('0'),
            'other': Decimal('0'),
            'total': Decimal('0')
        }
        
        # TODO: Get employee-specific deductions from database
        # For now, using placeholder values
        
        # Apartment rent (prorated if moved in/out during month)
        deductions['apartment'] = Decimal('30000')
        
        # Social insurance (simplified calculation)
        # Real calculation would use official tables
        if gross_income > 0:
            insurance_rate = Decimal('0.15')  # ~15% for health + pension
            deductions['insurance'] = gross_income * insurance_rate
        
        # Income tax (simplified withholding)
        if gross_income > 88000:  # Tax threshold
            tax_rate = Decimal('0.05')  # 5% simplified
            deductions['tax'] = (gross_income - Decimal('88000')) * tax_rate
        
        deductions['total'] = sum([
            deductions['apartment'],
            deductions['insurance'],
            deductions['tax'],
            deductions['other']
        ])
        
        return deductions
    
    def _get_expected_work_days(self, year: int, month: int) -> int:
        """Calcula los días laborables esperados en un mes.

        Cuenta los días de lunes a viernes (excluyendo fines de semana).
        No considera festivos nacionales japoneses.

        Args:
            year (int): Año (ej. 2025)
            month (int): Mes (1-12)

        Returns:
            int: Número de días laborables (lunes-viernes) en el mes

        Examples:
            >>> # Octubre 2025
            >>> work_days = service._get_expected_work_days(2025, 10)
            >>> assert work_days == 23  # Días laborables en octubre 2025

        Note:
            - Solo excluye sábados y domingos
            - No considera festivos nacionales (implementar en futuro)
            - Usa calendario gregoriano estándar
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
        """Compara costo de empleado vs ingreso por fábrica (análisis de rentabilidad).

        Calcula métricas clave de rentabilidad comparando el costo real del empleado
        (jikyu) contra el ingreso facturado a la fábrica (jikyu_tanka * horas).

        Args:
            payroll_data (Dict): Datos de nómina calculados (de calculate_monthly_payroll)
            actual_revenue (Decimal): Ingreso real facturado a la fábrica cliente

        Returns:
            Dict: Análisis de rentabilidad con estructura:
                {
                    "cost_per_hour": float,  # Costo por hora del empleado
                    "revenue_per_hour": float,  # Ingreso por hora facturado
                    "total_cost": float,  # Costo total (gross_pay)
                    "total_revenue": float,  # Ingreso total facturado
                    "profit": float,  # Ganancia (revenue - cost)
                    "profit_margin_percent": float,  # Margen de ganancia %
                    "is_profitable": bool  # True si hay ganancia
                }

        Examples:
            >>> payroll = {
            ...     'gross_pay': 250000,
            ...     'hours': {'total_hours': 160}
            ... }
            >>> revenue = Decimal('300000')
            >>> analysis = service.compare_jikyu_vs_tanka(payroll, revenue)
            >>> print(f"Margen: {analysis['profit_margin_percent']:.1f}%")
            >>> print(f"Ganancia: ¥{analysis['profit']:,.0f}")

        Note:
            - Usa gross_pay (pago bruto) como costo total
            - Margen de ganancia = (ganancia / ingreso) * 100
            - Valores negativos indican pérdida
            - Útil para evaluar rentabilidad por empleado/fábrica
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
