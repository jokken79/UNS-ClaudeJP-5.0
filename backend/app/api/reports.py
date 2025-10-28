"""
Reports API Endpoints for UNS-ClaudeJP 2.0
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
import logging
from pathlib import Path

from app.services.report_service import report_service
from app.core.database import get_db
from app.models.models import SalaryCalculation, TimerCard, Employee, Factory, Candidate

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/monthly-factory")
async def generate_monthly_factory_report(
    factory_id: str = Query(...),
    year: int = Query(...),
    month: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Generate monthly factory report

    Args:
        factory_id: Factory ID
        year: Year
        month: Month

    Returns:
        Report metadata and download link
    """
    try:
        # Get factory information
        factory = db.query(Factory).filter(Factory.factory_id == factory_id).first()
        if not factory:
            raise HTTPException(status_code=404, detail=f"Factory {factory_id} not found")

        # Get salary calculations for this factory, year, and month
        salary_calcs = (
            db.query(SalaryCalculation, Employee)
            .join(Employee, SalaryCalculation.employee_id == Employee.id)
            .filter(
                Employee.factory_id == factory_id,
                SalaryCalculation.year == year,
                SalaryCalculation.month == month
            )
            .all()
        )

        # Build payrolls array from database data
        payrolls = []
        for salary, employee in salary_calcs:
            payroll = {
                "employee_id": employee.hakenmoto_id,
                "employee_name": employee.full_name_kanji or "Unknown",
                "hours": {
                    "total_hours": float(salary.total_regular_hours or 0) +
                                   float(salary.total_overtime_hours or 0) +
                                   float(salary.total_night_hours or 0) +
                                   float(salary.total_holiday_hours or 0),
                    "normal_hours": float(salary.total_regular_hours or 0),
                    "overtime_hours": float(salary.total_overtime_hours or 0),
                    "night_hours": float(salary.total_night_hours or 0),
                    "holiday_hours": float(salary.total_holiday_hours or 0)
                },
                "payments": {
                    "base_pay": salary.base_salary or 0,
                    "overtime_pay": salary.overtime_pay or 0,
                    "night_pay": salary.night_pay or 0,
                    "holiday_pay": salary.holiday_pay or 0
                },
                "bonuses": {
                    "total": (salary.bonus or 0) + (salary.gasoline_allowance or 0)
                },
                "gross_pay": salary.gross_salary or 0
            }
            payrolls.append(payroll)

        # Extract factory configuration
        factory_config = {
            "name": factory.name or "Unknown Factory",
            "jikyu_tanka": 1500,  # Default, can be extracted from factory.config if available
            "gasoline_allowance": False,
            "gasoline_amount": 0
        }

        # Extract from factory.config JSON if available
        if factory.config:
            if "working_hours" in factory.config and "shifts" in factory.config["working_hours"]:
                shifts = factory.config["working_hours"]["shifts"]
                if shifts and len(shifts) > 0:
                    factory_config["jikyu_tanka"] = shifts[0].get("jikyu_tanka", 1500)

            if "bonuses" in factory.config:
                bonuses = factory.config["bonuses"]
                if "gasoline_allowance" in bonuses:
                    gasoline_config = bonuses["gasoline_allowance"]
                    factory_config["gasoline_allowance"] = gasoline_config.get("enabled", False)
                    factory_config["gasoline_amount"] = gasoline_config.get("amount_per_day", 0)
        
        result = report_service.generate_monthly_factory_report(
            factory_id,
            year,
            month,
            payrolls,
            factory_config
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error generating monthly report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/payslip")
async def generate_payslip_pdf(
    employee_id: int = Query(...),
    year: int = Query(...),
    month: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Generate individual payslip PDF

    Args:
        employee_id: Employee ID
        year: Year
        month: Month

    Returns:
        PDF file path
    """
    try:
        # Get employee information
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail=f"Employee {employee_id} not found")

        # Get salary calculation for this employee, year, and month
        salary = (
            db.query(SalaryCalculation)
            .filter(
                SalaryCalculation.employee_id == employee_id,
                SalaryCalculation.year == year,
                SalaryCalculation.month == month
            )
            .first()
        )

        if not salary:
            raise HTTPException(
                status_code=404,
                detail=f"No salary calculation found for employee {employee_id} in {year}/{month}"
            )

        # Build payroll data from database
        payroll_data = {
            "employee_id": employee_id,
            "employee_name": employee.full_name_kanji or "Unknown",
            "year": year,
            "month": month,
            "hours": {
                "normal_hours": float(salary.total_regular_hours or 0),
                "overtime_hours": float(salary.total_overtime_hours or 0),
                "night_hours": float(salary.total_night_hours or 0),
                "holiday_hours": float(salary.total_holiday_hours or 0)
            },
            "payments": {
                "base_pay": salary.base_salary or 0,
                "overtime_pay": salary.overtime_pay or 0,
                "night_pay": salary.night_pay or 0,
                "holiday_pay": salary.holiday_pay or 0
            },
            "bonuses": {
                "total": (salary.bonus or 0) + (salary.gasoline_allowance or 0)
            },
            "deductions": {
                "insurance": (employee.health_insurance or 0) +
                             (employee.nursing_insurance or 0) +
                             (employee.pension_insurance or 0),
                "tax": 0,  # Tax calculation not implemented yet
                "apartment": salary.apartment_deduction or 0
            },
            "gross_pay": salary.gross_salary or 0,
            "net_pay": salary.net_salary or 0
        }
        
        pdf_path = report_service.generate_employee_payslip_pdf(payroll_data)
        
        if not pdf_path or not Path(pdf_path).exists():
            raise HTTPException(status_code=500, detail="Failed to generate payslip")
        
        return {"success": True, "pdf_path": pdf_path}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating payslip: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/{filename}")
async def download_report(filename: str):
    """
    Download generated report
    
    Args:
        filename: Report filename
        
    Returns:
        File download
    """
    try:
        file_path = Path("reports") / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Report not found")
        
        return FileResponse(
            path=file_path,
            media_type='application/octet-stream',
            filename=filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/annual-summary")
async def generate_annual_summary(
    factory_id: str = Query(...),
    year: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Generate annual summary report

    Args:
        factory_id: Factory ID
        year: Year

    Returns:
        Report metadata
    """
    try:
        # Verify factory exists
        factory = db.query(Factory).filter(Factory.factory_id == factory_id).first()
        if not factory:
            raise HTTPException(status_code=404, detail=f"Factory {factory_id} not found")

        # Get monthly data from database - aggregate salary calculations by month
        monthly_data = []
        for month in range(1, 13):
            # Query salary calculations for this factory and month
            salary_calcs = (
                db.query(SalaryCalculation)
                .join(Employee, SalaryCalculation.employee_id == Employee.id)
                .filter(
                    Employee.factory_id == factory_id,
                    SalaryCalculation.year == year,
                    SalaryCalculation.month == month
                )
                .all()
            )

            # Calculate totals for the month
            if salary_calcs:
                total_hours = sum(
                    float(s.total_regular_hours or 0) +
                    float(s.total_overtime_hours or 0) +
                    float(s.total_night_hours or 0) +
                    float(s.total_holiday_hours or 0)
                    for s in salary_calcs
                )
                total_cost = sum(s.gross_salary or 0 for s in salary_calcs)
                total_revenue = sum(s.factory_payment or 0 for s in salary_calcs)
                profit = sum(s.company_profit or 0 for s in salary_calcs)
            else:
                # No data for this month
                total_hours = 0
                total_cost = 0
                total_revenue = 0
                profit = 0

            monthly_data.append({
                "month": month,
                "total_hours": total_hours,
                "total_cost": total_cost,
                "total_revenue": total_revenue,
                "profit": profit
            })
        
        result = report_service.generate_annual_summary_report(
            factory_id,
            year,
            monthly_data
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error generating annual summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))
