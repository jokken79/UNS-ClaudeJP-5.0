"""
Access Database Schema Analyzer

This script analyzes the structure of a Microsoft Access database (.accdb)
and extracts detailed schema information for the T_履歴書 table.

Requirements:
- pyodbc (pip install pyodbc)
- Microsoft Access Database Engine installed
- Pillow for image analysis (pip install Pillow)

Usage:
    python analyze_access_db.py

Author: Claude Code
Date: 2025-10-24
"""

import pyodbc
import json
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class AccessDatabaseAnalyzer:
    """Analyzer for Microsoft Access database schema and data"""

    def __init__(self, db_path: str, output_dir: str = None):
        """
        Initialize the analyzer

        Args:
            db_path: Full path to the .accdb file
            output_dir: Directory to save analysis results (default: .research-cache/access_analysis/)
        """
        self.db_path = db_path

        # Set output directory
        if output_dir is None:
            base_dir = Path(__file__).parent.parent.parent  # Go up to project root
            self.output_dir = base_dir / '.research-cache' / 'access_analysis'
        else:
            self.output_dir = Path(output_dir)

        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.conn = None
        self.cursor = None

        # Access type to Python/PostgreSQL type mapping
        self.TYPE_MAPPING = {
            'INTEGER': {'python': 'int', 'postgres': 'INTEGER', 'description': '32-bit integer'},
            'LONG': {'python': 'int', 'postgres': 'BIGINT', 'description': '64-bit integer'},
            'SHORT': {'python': 'int', 'postgres': 'SMALLINT', 'description': '16-bit integer'},
            'BYTE': {'python': 'int', 'postgres': 'SMALLINT', 'description': '8-bit integer'},
            'SINGLE': {'python': 'float', 'postgres': 'REAL', 'description': 'Single precision float'},
            'DOUBLE': {'python': 'float', 'postgres': 'DOUBLE PRECISION', 'description': 'Double precision float'},
            'DECIMAL': {'python': 'Decimal', 'postgres': 'NUMERIC', 'description': 'Decimal number'},
            'CURRENCY': {'python': 'Decimal', 'postgres': 'NUMERIC(19,4)', 'description': 'Currency'},
            'TEXT': {'python': 'str', 'postgres': 'VARCHAR', 'description': 'Variable length text'},
            'MEMO': {'python': 'str', 'postgres': 'TEXT', 'description': 'Long text'},
            'DATETIME': {'python': 'datetime', 'postgres': 'TIMESTAMP', 'description': 'Date and time'},
            'BIT': {'python': 'bool', 'postgres': 'BOOLEAN', 'description': 'Boolean'},
            'BINARY': {'python': 'bytes', 'postgres': 'BYTEA', 'description': 'Binary data'},
            'LONGBINARY': {'python': 'bytes', 'postgres': 'BYTEA', 'description': 'Large binary/OLE Object'},
            'VARBINARY': {'python': 'bytes', 'postgres': 'BYTEA', 'description': 'Variable binary'},
            'GUID': {'python': 'str', 'postgres': 'UUID', 'description': 'Unique identifier'},
        }

    def connect(self):
        """Establish connection to Access database"""
        logger.info(f"Connecting to Access database: {self.db_path}")

        # Check if file exists
        if not os.path.exists(self.db_path):
            raise FileNotFoundError(f"Database file not found: {self.db_path}")

        # Build connection string
        conn_str = (
            r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};"
            f"DBQ={self.db_path};"
        )

        try:
            self.conn = pyodbc.connect(conn_str)
            self.cursor = self.conn.cursor()
            logger.info("Successfully connected to Access database")
        except pyodbc.Error as e:
            logger.error(f"Failed to connect to Access database: {e}")
            logger.error("Make sure Microsoft Access Database Engine is installed")
            logger.error("Download from: https://www.microsoft.com/en-us/download/details.aspx?id=54920")
            raise

    def list_available_drivers(self) -> List[str]:
        """List all available ODBC drivers"""
        drivers = [d for d in pyodbc.drivers()]
        logger.info("Available ODBC drivers:")
        for driver in drivers:
            logger.info(f"  - {driver}")
        return drivers

    def get_all_tables(self) -> List[str]:
        """Get list of all user tables (excluding system tables)"""
        logger.info("Retrieving table list...")
        tables = []

        for table_info in self.cursor.tables(tableType='TABLE'):
            table_name = table_info.table_name
            # Skip Access system tables
            if not table_name.startswith('MSys') and not table_name.startswith('~'):
                tables.append(table_name)

        logger.info(f"Found {len(tables)} user tables")
        return tables

    def get_table_schema(self, table_name: str) -> List[Dict[str, Any]]:
        """
        Get detailed schema information for a table

        Returns:
            List of column dictionaries with metadata
        """
        logger.info(f"Analyzing schema for table: {table_name}")

        columns = []
        for col in self.cursor.columns(table=table_name):
            col_info = {
                'column_name': col.column_name,
                'type_name': col.type_name,
                'column_size': col.column_size,
                'buffer_length': col.buffer_length,
                'decimal_digits': col.decimal_digits,
                'nullable': bool(col.nullable),
                'ordinal_position': col.ordinal_position,
                'is_nullable': 'YES' if col.nullable else 'NO',
                # Add type mapping
                'python_type': self.TYPE_MAPPING.get(col.type_name.upper(), {}).get('python', 'str'),
                'postgres_type': self.TYPE_MAPPING.get(col.type_name.upper(), {}).get('postgres', 'TEXT'),
                'type_description': self.TYPE_MAPPING.get(col.type_name.upper(), {}).get('description', 'Unknown type'),
                # Flag for BLOB/OLE Object fields
                'is_blob': col.type_name.upper() in ['LONGBINARY', 'BINARY', 'VARBINARY'],
                'is_ole_object': col.type_name.upper() == 'LONGBINARY',
            }
            columns.append(col_info)

        logger.info(f"Found {len(columns)} columns in {table_name}")
        return columns

    def get_row_count(self, table_name: str) -> int:
        """Get total number of records in a table"""
        try:
            self.cursor.execute(f"SELECT COUNT(*) FROM [{table_name}]")
            count = self.cursor.fetchone()[0]
            logger.info(f"Table {table_name} contains {count} records")
            return count
        except Exception as e:
            logger.error(f"Failed to count rows in {table_name}: {e}")
            return -1

    def analyze_blob_fields(self, table_name: str, columns: List[Dict]) -> Dict[str, Any]:
        """
        Analyze BLOB/OLE Object fields in the table

        Returns:
            Dictionary with blob field analysis
        """
        blob_fields = [col for col in columns if col['is_blob']]

        if not blob_fields:
            logger.info(f"No BLOB fields found in {table_name}")
            return {}

        logger.info(f"Found {len(blob_fields)} BLOB fields: {[f['column_name'] for f in blob_fields]}")

        blob_analysis = {}

        for blob_col in blob_fields:
            col_name = blob_col['column_name']
            logger.info(f"Analyzing BLOB field: {col_name}")

            # Count non-null values
            try:
                self.cursor.execute(f"SELECT COUNT(*) FROM [{table_name}] WHERE [{col_name}] IS NOT NULL")
                non_null_count = self.cursor.fetchone()[0]

                # Sample first non-null blob to detect format
                self.cursor.execute(
                    f"SELECT TOP 1 [{col_name}] FROM [{table_name}] WHERE [{col_name}] IS NOT NULL"
                )
                sample_row = self.cursor.fetchone()

                blob_info = {
                    'column_name': col_name,
                    'type': blob_col['type_name'],
                    'is_ole_object': blob_col['is_ole_object'],
                    'non_null_count': non_null_count,
                    'sample_size': None,
                    'detected_format': None,
                    'ole_header_detected': False
                }

                if sample_row and sample_row[0]:
                    blob_data = sample_row[0]
                    blob_info['sample_size'] = len(blob_data)

                    # Try to detect image format
                    blob_info['detected_format'] = self._detect_image_format(blob_data)
                    blob_info['ole_header_detected'] = self._has_ole_header(blob_data)

                blob_analysis[col_name] = blob_info
                logger.info(f"  - {col_name}: {non_null_count} non-null values, detected: {blob_info['detected_format']}")

            except Exception as e:
                logger.error(f"Failed to analyze BLOB field {col_name}: {e}")
                blob_analysis[col_name] = {'error': str(e)}

        return blob_analysis

    def _detect_image_format(self, blob_data: bytes) -> str:
        """Detect image format from blob data"""
        if not blob_data or len(blob_data) < 10:
            return 'Unknown'

        # Check for common image signatures
        signatures = {
            b'\xFF\xD8\xFF': 'JPEG',
            b'\x89PNG\r\n\x1a\n': 'PNG',
            b'BM': 'BMP',
            b'GIF87a': 'GIF87a',
            b'GIF89a': 'GIF89a',
        }

        # Search in first 500 bytes for image signature (OLE header might be present)
        search_range = min(500, len(blob_data))
        for i in range(search_range):
            for signature, format_name in signatures.items():
                if blob_data[i:i+len(signature)] == signature:
                    if i > 0:
                        return f"{format_name} (OLE header ~{i} bytes)"
                    return format_name

        return 'Unknown binary'

    def _has_ole_header(self, blob_data: bytes) -> bool:
        """Check if blob has OLE Object header"""
        if not blob_data or len(blob_data) < 20:
            return False

        # Common OLE signature bytes
        ole_signatures = [
            b'\x15\x1C\x2F',  # Common OLE header
            b'\x50\x42\x72\x75\x73\x68',  # PBrush (Paint)
        ]

        header = blob_data[:100]
        for sig in ole_signatures:
            if sig in header:
                return True

        return False

    def generate_full_report(self, table_name: str = 'T_履歴書') -> Dict[str, Any]:
        """
        Generate comprehensive analysis report for the specified table

        Args:
            table_name: Name of the table to analyze (default: T_履歴書)

        Returns:
            Dictionary containing full analysis
        """
        logger.info(f"\n{'='*80}")
        logger.info(f"Generating full analysis report for: {table_name}")
        logger.info(f"{'='*80}\n")

        # Get schema
        schema = self.get_table_schema(table_name)

        # Get row count
        row_count = self.get_row_count(table_name)

        # Analyze BLOB fields
        blob_analysis = self.analyze_blob_fields(table_name, schema)

        # Build report
        report = {
            'metadata': {
                'database_path': self.db_path,
                'table_name': table_name,
                'analysis_date': datetime.now().isoformat(),
                'total_records': row_count,
                'total_columns': len(schema),
            },
            'schema': schema,
            'blob_fields': blob_analysis,
            'statistics': {
                'text_columns': len([c for c in schema if c['type_name'].upper() in ['TEXT', 'MEMO']]),
                'numeric_columns': len([c for c in schema if c['type_name'].upper() in ['INTEGER', 'LONG', 'SHORT', 'DOUBLE', 'SINGLE', 'DECIMAL']]),
                'date_columns': len([c for c in schema if c['type_name'].upper() == 'DATETIME']),
                'blob_columns': len([c for c in schema if c['is_blob']]),
                'nullable_columns': len([c for c in schema if c['nullable']]),
            }
        }

        return report

    def save_report(self, report: Dict[str, Any], filename: str = None):
        """Save analysis report to JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            table_name = report['metadata']['table_name']
            filename = f"access_analysis_{table_name}_{timestamp}.json"

        output_path = self.output_dir / filename

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)

        logger.info(f"\n{'='*80}")
        logger.info(f"Report saved to: {output_path}")
        logger.info(f"{'='*80}\n")

        return output_path

    def print_schema_summary(self, schema: List[Dict[str, Any]]):
        """Print formatted schema summary to console"""
        logger.info(f"\n{'='*120}")
        logger.info(f"{'COLUMN NAME':<40} {'ACCESS TYPE':<20} {'SIZE':<10} {'NULL':<8} {'POSTGRES TYPE':<25}")
        logger.info(f"{'='*120}")

        for col in schema:
            col_name = col['column_name']
            access_type = col['type_name']
            size = str(col['column_size']) if col['column_size'] else 'N/A'
            nullable = 'YES' if col['nullable'] else 'NO'
            pg_type = col['postgres_type']

            # Add size to VARCHAR
            if access_type.upper() == 'TEXT' and col['column_size']:
                pg_type = f"VARCHAR({col['column_size']})"

            # Highlight BLOB fields
            if col['is_blob']:
                col_name = f"* {col_name} (BLOB)"

            logger.info(f"{col_name:<40} {access_type:<20} {size:<10} {nullable:<8} {pg_type:<25}")

        logger.info(f"{'='*120}\n")

    def close(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        logger.info("Database connection closed")


def main():
    """Main execution function"""

    # Database configuration
    DB_PATH = r"C:\Users\JPUNS\Desktop\ユニバーサル企画㈱データベースv25.3.24.accdb"
    TABLE_NAME = "T_履歴書"

    # Initialize analyzer
    analyzer = AccessDatabaseAnalyzer(db_path=DB_PATH)

    try:
        # List available drivers first
        logger.info("\n" + "="*80)
        logger.info("CHECKING AVAILABLE ODBC DRIVERS")
        logger.info("="*80)
        analyzer.list_available_drivers()

        # Connect to database
        analyzer.connect()

        # Get all tables (optional - for reference)
        logger.info("\n" + "="*80)
        logger.info("LISTING ALL TABLES IN DATABASE")
        logger.info("="*80)
        all_tables = analyzer.get_all_tables()
        for idx, table in enumerate(all_tables, 1):
            logger.info(f"  {idx}. {table}")

        # Generate full report for T_履歴書
        report = analyzer.generate_full_report(table_name=TABLE_NAME)

        # Print schema summary to console
        analyzer.print_schema_summary(report['schema'])

        # Print statistics
        logger.info(f"\n{'='*80}")
        logger.info("STATISTICS")
        logger.info(f"{'='*80}")
        stats = report['statistics']
        logger.info(f"Total records:     {report['metadata']['total_records']:,}")
        logger.info(f"Total columns:     {report['metadata']['total_columns']}")
        logger.info(f"Text columns:      {stats['text_columns']}")
        logger.info(f"Numeric columns:   {stats['numeric_columns']}")
        logger.info(f"Date columns:      {stats['date_columns']}")
        logger.info(f"BLOB columns:      {stats['blob_columns']}")
        logger.info(f"Nullable columns:  {stats['nullable_columns']}")

        # Print BLOB field details
        if report['blob_fields']:
            logger.info(f"\n{'='*80}")
            logger.info("BLOB/OLE OBJECT FIELDS ANALYSIS")
            logger.info(f"{'='*80}")
            for field_name, field_info in report['blob_fields'].items():
                if 'error' in field_info:
                    logger.info(f"\n{field_name}: ERROR - {field_info['error']}")
                else:
                    logger.info(f"\n{field_name}:")
                    logger.info(f"  Type:              {field_info['type']}")
                    logger.info(f"  Is OLE Object:     {field_info['is_ole_object']}")
                    logger.info(f"  Non-null records:  {field_info['non_null_count']:,}")
                    if field_info['sample_size']:
                        logger.info(f"  Sample size:       {field_info['sample_size']:,} bytes")
                    if field_info['detected_format']:
                        logger.info(f"  Detected format:   {field_info['detected_format']}")
                    logger.info(f"  OLE header:        {'Yes' if field_info['ole_header_detected'] else 'No'}")

        # Save report to file
        output_file = analyzer.save_report(report)

        logger.info(f"\n{'='*80}")
        logger.info("ANALYSIS COMPLETE")
        logger.info(f"{'='*80}")
        logger.info(f"Output directory: {analyzer.output_dir}")
        logger.info(f"Report file:      {output_file.name}")

    except Exception as e:
        logger.error(f"\n{'='*80}")
        logger.error(f"ERROR: {e}")
        logger.error(f"{'='*80}")
        raise

    finally:
        analyzer.close()


if __name__ == "__main__":
    main()
