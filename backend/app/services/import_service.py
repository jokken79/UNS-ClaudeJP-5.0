"""
Import Service for UNS-ClaudeJP 2.0
Mass import from Excel with validation
"""
import pandas as pd
import logging
from typing import Dict, List
from datetime import datetime, time as dt_time
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.models import Employee, TimerCard, Factory

logger = logging.getLogger(__name__)


class ImportService:
    """Service for mass data import from Excel"""
    
    def import_employees_from_excel(self, file_path: str, db: Session) -> Dict:
        """
        Import employees from Excel file

        Expected columns:
        - 派遣元ID, 氏名, フリガナ, 生年月日, 性別, 国籍, 住所, 電話番号, etc.

        Args:
            file_path: Path to Excel file
            db: Database session

        Returns:
            Dict with import results
        """
        logger.info(f"Importing employees from {file_path}")
        
        results = {
            "success": [],
            "errors": [],
            "warnings": [],
            "total_rows": 0,
            "imported": 0,
            "failed": 0
        }
        
        try:
            # Read Excel file
            df = pd.read_excel(file_path)
            results["total_rows"] = len(df)
            
            logger.info(f"Found {len(df)} rows in Excel")
            
            # Process each row
            for i, (_, row) in enumerate(df.iterrows()):
                try:
                    # Validate required fields
                    validation_errors = self._validate_employee_data(row)
                    
                    if validation_errors:
                        results["errors"].append({
                            "row": i + 2,  # +2 for Excel header
                            "errors": validation_errors
                        })
                        results["failed"] += 1
                        continue
                    
                    # Prepare employee data
                    employee_data = self._prepare_employee_data(row)

                    # Insert into database
                    try:
                        # Check if employee with this hakenmoto_id already exists
                        existing = db.query(Employee).filter(
                            Employee.hakenmoto_id == employee_data.get('hakenmoto_id')
                        ).first()

                        if existing:
                            # Update existing employee
                            for key, value in employee_data.items():
                                setattr(existing, key, value)
                            db.commit()
                            db.refresh(existing)
                            logger.info(f"Row {i + 2}: Updated employee {employee_data.get('full_name_kanji')}")
                        else:
                            # Create new employee
                            employee = Employee(**employee_data)
                            db.add(employee)
                            db.commit()
                            db.refresh(employee)
                            logger.info(f"Row {i + 2}: Created employee {employee_data.get('full_name_kanji')}")

                        results["success"].append({
                            "row": i + 2,
                            "name": employee_data.get('full_name_kanji'),
                            "id": employee_data.get('hakenmoto_id')
                        })
                        results["imported"] += 1

                    except IntegrityError as e:
                        db.rollback()
                        logger.error(f"Row {i + 2}: Integrity error - {e}")
                        results["errors"].append({
                            "row": i + 2,
                            "error": f"Database integrity error: {str(e)}"
                        })
                        results["failed"] += 1
                        continue
                    
                except Exception as e:
                    logger.error(f"Error processing row {i + 2}: {e}")
                    results["errors"].append({
                        "row": i + 2,
                        "error": str(e)
                    })
                    results["failed"] += 1
            
            logger.info(f"Import complete: {results['imported']} succeeded, {results['failed']} failed")
            return results
            
        except Exception as e:
            logger.error(f"Failed to read Excel file: {e}")
            return {
                "success": [],
                "errors": [{"error": f"Failed to read file: {str(e)}"}],
                "warnings": [],
                "total_rows": 0,
                "imported": 0,
                "failed": 0
            }
    
    def _validate_employee_data(self, row: pd.Series) -> List[str]:
        """
        Validate employee data row
        
        Returns:
            List of validation error messages
        """
        errors = []
        
        # Required fields
        required_fields = {
            '派遣元ID': 'hakenmoto_id',
            '氏名': 'name',
            '生年月日': 'birthday'
        }
        
        for excel_col, field_name in required_fields.items():
            if excel_col not in row or pd.isna(row[excel_col]):
                errors.append(f"{excel_col} is required")
        
        # Validate birthday format
        if '生年月日' in row and not pd.isna(row['生年月日']):
            try:
                if isinstance(row['生年月日'], str):
                    datetime.strptime(row['生年月日'], '%Y-%m-%d')
                elif not isinstance(row['生年月日'], datetime):
                    errors.append("生年月日 must be date format")
            except ValueError:
                errors.append("生年月日 must be YYYY-MM-DD format")
        
        # Validate gender
        if '性別' in row and not pd.isna(row['性別']):
            if row['性別'] not in ['男性', '女性']:
                errors.append("性別 must be 男性 or 女性")
        
        return errors
    
    def _prepare_employee_data(self, row: pd.Series) -> Dict:
        """
        Prepare employee data from Excel row
        
        Returns:
            Dict with employee data
        """
        data = {}
        
        # Map Excel columns to database fields
        column_mapping = {
            '派遣元ID': 'hakenmoto_id',  # This must be an integer
            '氏名': 'full_name_kanji',
            'フリガナ': 'full_name_kana',
            'ローマ字': 'full_name_roman',
            '生年月日': 'date_of_birth',
            '性別': 'gender',
            '国籍': 'nationality',
            '郵便番号': 'postal_code',
            '住所': 'current_address',
            '携帯電話': 'mobile_phone',
            '電話番号': 'home_phone',
            'メール': 'email',
            '在留カード番号': 'residence_card_no',
            'ビザ種類': 'visa_status',
            'ビザ期限': 'visa_expiry',
            'パスポート番号': 'passport_no',
            'パスポート期限': 'passport_expiry',
            '運転免許証番号': 'drivers_license_no',
            '運転免許証期限': 'drivers_license_expiry',
            '緊急連絡先氏名': 'emergency_contact_name',
            '緊急連絡先続柄': 'emergency_contact_relationship',
            '緊急連絡先電話': 'emergency_contact_phone'
        }
        
        for excel_col, db_field in column_mapping.items():
            if excel_col in row and not pd.isna(row[excel_col]):
                value = row[excel_col]

                # Convert hakenmoto_id to integer
                if db_field == 'hakenmoto_id':
                    value = int(value)

                # Convert dates
                elif 'date' in db_field or 'expiry' in db_field or db_field == 'date_of_birth':
                    if isinstance(value, str):
                        value = datetime.strptime(value, '%Y-%m-%d').date()
                    elif isinstance(value, datetime):
                        value = value.date()

                data[db_field] = value
        
        return data
    
    def import_timer_cards_from_excel(
        self,
        file_path: str,
        factory_id: str,
        year: int,
        month: int,
        db: Session
    ) -> Dict:
        """
        Import timer cards from Excel

        Expected columns:
        - 日付, 社員ID, 社員名, 出勤時刻, 退勤時刻

        Args:
            file_path: Path to Excel file
            factory_id: Factory ID
            year: Year
            month: Month
            db: Database session

        Returns:
            Dict with import results
        """
        logger.info(f"Importing timer cards from {file_path}")
        
        results = {
            "success": [],
            "errors": [],
            "total_rows": 0,
            "imported": 0,
            "failed": 0
        }
        
        try:
            df = pd.read_excel(file_path)
            results["total_rows"] = len(df)
            
            for i, (_, row) in enumerate(df.iterrows()):
                try:
                    # Validate required fields
                    required = ['日付', '社員ID', '出勤時刻', '退勤時刻']
                    missing = [f for f in required if f not in row or pd.isna(row[f])]
                    
                    if missing:
                        results["errors"].append({
                            "row": i + 2,
                            "error": f"Missing fields: {', '.join(missing)}"
                        })
                        results["failed"] += 1
                        continue
                    
                    # Prepare timer card data
                    # Convert work_date to date object
                    work_date = row['日付']
                    if isinstance(work_date, str):
                        work_date = datetime.strptime(work_date, '%Y-%m-%d').date()
                    elif isinstance(work_date, datetime):
                        work_date = work_date.date()

                    # Convert clock_in and clock_out to time objects
                    def parse_time(time_value):
                        """Parse time from string or datetime.time"""
                        if isinstance(time_value, dt_time):
                            return time_value
                        if isinstance(time_value, datetime):
                            return time_value.time()
                        if isinstance(time_value, str):
                            # Handle formats like "08:30" or "08:30:00"
                            parts = time_value.split(':')
                            hour = int(parts[0])
                            minute = int(parts[1]) if len(parts) > 1 else 0
                            second = int(parts[2]) if len(parts) > 2 else 0
                            return dt_time(hour, minute, second)
                        return None

                    clock_in = parse_time(row['出勤時刻'])
                    clock_out = parse_time(row['退勤時刻'])
                    hakenmoto_id = int(row['社員ID'])

                    # Insert into database
                    try:
                        # Check if timer card already exists (same employee + date)
                        existing = db.query(TimerCard).filter(
                            TimerCard.hakenmoto_id == hakenmoto_id,
                            TimerCard.work_date == work_date
                        ).first()

                        if existing:
                            # Skip duplicate
                            logger.warning(f"Row {i + 2}: Timer card already exists for employee {hakenmoto_id} on {work_date}")
                            results["errors"].append({
                                "row": i + 2,
                                "error": f"Duplicate timer card for employee {hakenmoto_id} on {work_date}"
                            })
                            results["failed"] += 1
                            continue

                        # Create new timer card
                        timer_card = TimerCard(
                            hakenmoto_id=hakenmoto_id,
                            employee_id=hakenmoto_id,  # For easier querying
                            factory_id=factory_id,
                            work_date=work_date,
                            clock_in=clock_in,
                            clock_out=clock_out
                        )
                        db.add(timer_card)
                        db.commit()
                        db.refresh(timer_card)

                        logger.info(f"Row {i + 2}: Created timer card for employee {hakenmoto_id}")

                        results["success"].append({
                            "row": i + 2,
                            "employee_id": hakenmoto_id,
                            "date": work_date
                        })
                        results["imported"] += 1

                    except IntegrityError as e:
                        db.rollback()
                        logger.error(f"Row {i + 2}: Integrity error - {e}")
                        results["errors"].append({
                            "row": i + 2,
                            "error": f"Database integrity error: {str(e)}"
                        })
                        results["failed"] += 1
                        continue
                    
                except Exception as e:
                    logger.error(f"Error processing row {i + 2}: {e}")
                    results["errors"].append({
                        "row": i + 2,
                        "error": str(e)
                    })
                    results["failed"] += 1
            
            logger.info(f"Timer cards import: {results['imported']} succeeded, {results['failed']} failed")
            return results
            
        except Exception as e:
            logger.error(f"Failed to import timer cards: {e}")
            return {
                "success": [],
                "errors": [{"error": str(e)}],
                "total_rows": 0,
                "imported": 0,
                "failed": 0
            }
    
    def import_factory_configs_from_json(self, directory_path: str, db: Session) -> Dict:
        """
        Import factory configurations from JSON files

        Args:
            directory_path: Directory containing factory JSON files
            db: Database session

        Returns:
            Dict with import results
        """
        logger.info(f"Importing factory configs from {directory_path}")
        
        results = {
            "success": [],
            "errors": [],
            "total_files": 0,
            "imported": 0,
            "failed": 0
        }
        
        try:
            import json
            directory = Path(directory_path)
            json_files = list(directory.glob('*.json'))
            results["total_files"] = len(json_files)
            
            for json_file in json_files:
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        config = json.load(f)
                    
                    # Validate config structure
                    required = ['factory_id', 'client_company', 'plant', 'assignment', 'job']
                    missing = [f for f in required if f not in config]

                    if missing:
                        results["errors"].append({
                            "file": json_file.name,
                            "error": f"Missing fields: {', '.join(missing)}"
                        })
                        results["failed"] += 1
                        continue

                    # Insert into database
                    try:
                        # Check if factory already exists
                        existing = db.query(Factory).filter(
                            Factory.factory_id == config['factory_id']
                        ).first()

                        # Prepare factory data
                        factory_data = {
                            'factory_id': config['factory_id'],
                            'name': config.get('name', config['factory_id']),
                            'company_name': config.get('client_company'),
                            'plant_name': config.get('plant'),
                            'config': config,  # Store entire config as JSON
                            'is_active': True
                        }

                        if existing:
                            # Update existing factory
                            for key, value in factory_data.items():
                                setattr(existing, key, value)
                            db.commit()
                            db.refresh(existing)
                            logger.info(f"Updated factory config: {config['factory_id']}")
                        else:
                            # Create new factory
                            factory = Factory(**factory_data)
                            db.add(factory)
                            db.commit()
                            db.refresh(factory)
                            logger.info(f"Created factory config: {config['factory_id']}")

                        results["success"].append({
                            "file": json_file.name,
                            "factory_id": config['factory_id'],
                            "name": config.get('name', config['factory_id'])
                        })
                        results["imported"] += 1

                    except IntegrityError as e:
                        db.rollback()
                        logger.error(f"Integrity error for {json_file.name}: {e}")
                        results["errors"].append({
                            "file": json_file.name,
                            "error": f"Database integrity error: {str(e)}"
                        })
                        results["failed"] += 1
                        continue
                    
                except Exception as e:
                    logger.error(f"Error importing {json_file.name}: {e}")
                    results["errors"].append({
                        "file": json_file.name,
                        "error": str(e)
                    })
                    results["failed"] += 1
            
            logger.info(f"Factory configs import: {results['imported']} succeeded, {results['failed']} failed")
            return results
            
        except Exception as e:
            logger.error(f"Failed to import factory configs: {e}")
            return {
                "success": [],
                "errors": [{"error": str(e)}],
                "total_files": 0,
                "imported": 0,
                "failed": 0
            }


# Global instance
import_service = ImportService()
