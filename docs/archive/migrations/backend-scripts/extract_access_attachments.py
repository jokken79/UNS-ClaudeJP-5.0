"""
Extract Attachment Data from Access Database
=============================================

This script extracts photo attachments from Access database's Attachment field type.
Access Attachments are a special field type that stores files inside the database,
NOT as BLOBs or file paths.

The extraction uses COM automation (win32com.client) to:
1. Open the Access database
2. Access the Attachment field recordset
3. Extract binary file data from each attachment
4. Convert to Base64 data URLs
5. Save mapping for import script

Features:
- Handles Access Attachment field type
- Extracts binary data using COM automation
- Converts to Base64 data URLs
- Supports multiple attachments per record (takes first photo)
- Generates JSON mapping file: rirekisho_id -> photo_data_url
- Sample mode to test first 5 records

Usage:
    python extract_access_attachments.py --sample  # Test first 5 records
    python extract_access_attachments.py --full    # Extract all photos

Requirements:
    pip install pywin32

Author: Claude Code
Date: 2025-10-24
"""

import sys
import os
import json
import logging
import base64
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    import win32com.client
    import pythoncom
    HAS_WIN32COM = True
except ImportError:
    HAS_WIN32COM = False
    print("WARNING: pywin32 not installed. COM automation will not work.")
    print("Install with: pip install pywin32")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'extract_attachments_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Access Database Configuration
ACCESS_DB_PATH = r"C:\Users\JPUNS\Desktop\ユニバーサル企画㈱データベースv25.3.24.accdb"
ACCESS_TABLE = "T_履歴書"
PHOTO_FIELD = "写真"
ID_FIELD = "履歴書ID"

# Output file for photo mappings
OUTPUT_JSON = "access_photo_mappings.json"


class AccessAttachmentExtractor:
    """Extracts attachment data from Access database using COM automation"""

    def __init__(self):
        """Initialize extractor"""
        self.access_app = None
        self.db = None

        # Statistics
        self.stats = {
            'total_records': 0,
            'processed': 0,
            'with_attachments': 0,
            'without_attachments': 0,
            'extraction_successful': 0,
            'extraction_failed': 0,
            'errors': 0
        }

        # Photo mappings: rirekisho_id -> photo_data_url
        self.photo_mappings = {}

        # Error log
        self.errors = []

    def connect_access(self) -> bool:
        """
        Connect to Access database using COM automation

        Returns:
            True if connection successful
        """
        if not HAS_WIN32COM:
            logger.error("pywin32 not installed. Cannot use COM automation.")
            return False

        try:
            # Initialize COM
            pythoncom.CoInitialize()

            # Create Access application instance
            logger.info("Creating Access application instance...")
            self.access_app = win32com.client.Dispatch("Access.Application")

            # Close any currently open database first
            try:
                self.access_app.CloseCurrentDatabase()
            except:
                pass  # Ignore if no database is open

            # Open database
            logger.info(f"Opening Access database: {ACCESS_DB_PATH}")
            self.access_app.OpenCurrentDatabase(ACCESS_DB_PATH)

            # Get database object
            self.db = self.access_app.CurrentDb()

            logger.info("Successfully connected to Access database")
            return True

        except Exception as e:
            logger.error(f"Failed to connect to Access database: {e}")
            return False

    def close_access(self):
        """Close Access database and release COM objects"""
        try:
            if self.access_app:
                logger.info("Closing Access database...")
                self.access_app.CloseCurrentDatabase()
                self.access_app.Quit()
                self.access_app = None
                self.db = None

            # Uninitialize COM
            pythoncom.CoUninitialize()

        except Exception as e:
            logger.warning(f"Error closing Access: {e}")

    def extract_attachment_data(self, attachment_field) -> Optional[str]:
        """
        Extract binary data from Attachment field and convert to Base64 data URL

        Args:
            attachment_field: Access Attachment field object

        Returns:
            Base64 data URL string or None
        """
        try:
            # Check if attachment field has value
            if not attachment_field.Value:
                return None

            # Get attachment recordset
            # Access Attachment fields are actually recordsets with multiple files
            attachment_rs = attachment_field.Value

            # Check if there are any attachments
            if attachment_rs.RecordCount == 0:
                return None

            # Move to first attachment
            attachment_rs.MoveFirst()

            # Get file information
            filename = attachment_rs.Fields("FileName").Value
            file_type = attachment_rs.Fields("FileType").Value
            file_data = attachment_rs.Fields("FileData").Value

            logger.debug(f"Found attachment: {filename} (type: {file_type})")

            # Convert binary data to bytes if needed
            if isinstance(file_data, (bytes, bytearray)):
                photo_bytes = bytes(file_data)
            else:
                # Some COM objects return data differently
                photo_bytes = bytes(file_data)

            # Determine MIME type from filename
            ext = os.path.splitext(filename)[1].lower() if filename else ''
            mime_map = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.bmp': 'image/bmp'
            }
            mime_type = mime_map.get(ext, 'image/jpeg')

            # Create Base64 data URL
            photo_base64 = base64.b64encode(photo_bytes).decode('utf-8')
            photo_data_url = f"data:{mime_type};base64,{photo_base64}"

            logger.debug(f"Converted to data URL (length: {len(photo_data_url)})")

            return photo_data_url

        except Exception as e:
            logger.error(f"Error extracting attachment data: {e}")
            raise

    def extract_photos(self, limit: Optional[int] = None, sample: bool = False) -> Dict[str, Any]:
        """
        Extract photos from all records

        Args:
            limit: Maximum number of records to process (None = all)
            sample: If True, only process first 5 records

        Returns:
            Dictionary with extraction statistics
        """
        if not self.connect_access():
            logger.error("Cannot proceed without Access connection")
            return self.stats

        try:
            # Build SQL query
            sql = f"SELECT [{ID_FIELD}], [{PHOTO_FIELD}] FROM [{ACCESS_TABLE}]"

            if sample:
                limit = 5

            if limit:
                sql = f"SELECT TOP {limit} [{ID_FIELD}], [{PHOTO_FIELD}] FROM [{ACCESS_TABLE}]"

            logger.info(f"Executing query: {sql}")

            # Open recordset
            recordset = self.db.OpenRecordset(sql)

            # Get total count (approximate)
            recordset.MoveLast()
            self.stats['total_records'] = recordset.RecordCount
            recordset.MoveFirst()

            logger.info(f"Total records to process: {self.stats['total_records']}")

            # Process each record
            record_num = 0

            while not recordset.EOF:
                record_num += 1
                self.stats['processed'] += 1

                try:
                    # Get rirekisho_id
                    rirekisho_id = recordset.Fields(ID_FIELD).Value

                    if not rirekisho_id:
                        logger.warning(f"Record #{record_num} has no ID, skipping")
                        recordset.MoveNext()
                        continue

                    rirekisho_id = str(rirekisho_id).strip()

                    # Get attachment field
                    attachment_field = recordset.Fields(PHOTO_FIELD)

                    # Check if field has attachments
                    if not attachment_field.Value or attachment_field.Value.RecordCount == 0:
                        self.stats['without_attachments'] += 1
                        logger.debug(f"Record #{record_num} ({rirekisho_id}): No attachments")
                        recordset.MoveNext()
                        continue

                    self.stats['with_attachments'] += 1

                    # Extract attachment data
                    logger.info(f"Processing record #{record_num} ({rirekisho_id})...")
                    photo_data_url = self.extract_attachment_data(attachment_field)

                    if photo_data_url:
                        self.stats['extraction_successful'] += 1
                        self.photo_mappings[rirekisho_id] = photo_data_url

                        if sample:
                            logger.info(f"  SUCCESS: Extracted photo (size: {len(photo_data_url)} chars)")
                        else:
                            logger.info(f"  SUCCESS: Extracted photo for {rirekisho_id}")
                    else:
                        self.stats['extraction_failed'] += 1
                        logger.warning(f"  FAILED: Could not extract photo data")

                except Exception as e:
                    self.stats['errors'] += 1
                    error_msg = f"Error processing record #{record_num}: {e}"
                    logger.error(error_msg)
                    self.errors.append({
                        'record_num': record_num,
                        'rirekisho_id': rirekisho_id if 'rirekisho_id' in locals() else 'Unknown',
                        'error': str(e)
                    })

                finally:
                    recordset.MoveNext()

            # Close recordset
            recordset.Close()

            # Print summary
            logger.info("\n" + "="*80)
            logger.info("Extraction Summary:")
            logger.info("="*80)
            logger.info(f"Total records: {self.stats['total_records']}")
            logger.info(f"Records processed: {self.stats['processed']}")
            logger.info(f"With attachments: {self.stats['with_attachments']}")
            logger.info(f"Without attachments: {self.stats['without_attachments']}")
            logger.info(f"Extraction successful: {self.stats['extraction_successful']}")
            logger.info(f"Extraction failed: {self.stats['extraction_failed']}")
            logger.info(f"Errors: {self.stats['errors']}")

            if self.errors:
                logger.warning(f"\nErrors encountered: {len(self.errors)}")
                for err in self.errors[:10]:
                    logger.warning(f"  Record #{err['record_num']} ({err['rirekisho_id']}): {err['error']}")
                if len(self.errors) > 10:
                    logger.warning(f"  ... and {len(self.errors) - 10} more errors")

            # Sample mode: show first few mappings
            if sample and self.photo_mappings:
                logger.info("\nSample photo mappings:")
                for rid, data_url in list(self.photo_mappings.items())[:5]:
                    logger.info(f"  {rid}: {data_url[:100]}... (length: {len(data_url)})")

            return self.stats

        except Exception as e:
            logger.error(f"Fatal error during extraction: {e}")
            raise

        finally:
            self.close_access()

    def save_mappings(self, output_file: str):
        """
        Save photo mappings to JSON file

        Args:
            output_file: Output JSON file path
        """
        if not self.photo_mappings:
            logger.warning("No photo mappings to save")
            return

        output_data = {
            'timestamp': datetime.now().isoformat(),
            'access_database': ACCESS_DB_PATH,
            'table': ACCESS_TABLE,
            'photo_field': PHOTO_FIELD,
            'statistics': self.stats,
            'mappings': self.photo_mappings
        }

        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)

            logger.info(f"\nPhoto mappings saved to: {output_file}")
            logger.info(f"Total mappings: {len(self.photo_mappings)}")

        except Exception as e:
            logger.error(f"Failed to save mappings: {e}")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Extract photo attachments from Access database')
    parser.add_argument('--sample', action='store_true', help='Test with first 5 records')
    parser.add_argument('--full', action='store_true', help='Extract all photos')
    parser.add_argument('--limit', type=int, help='Limit number of records to process')
    parser.add_argument('--output', default=OUTPUT_JSON, help='Output JSON file')

    args = parser.parse_args()

    if not args.sample and not args.full and not args.limit:
        parser.print_help()
        print("\nPlease specify --sample, --full, or --limit <number>")
        sys.exit(1)

    if not HAS_WIN32COM:
        logger.error("pywin32 is required for COM automation")
        logger.error("Install with: pip install pywin32")
        sys.exit(1)

    # Check if Access database exists
    if not os.path.exists(ACCESS_DB_PATH):
        logger.error(f"Access database not found: {ACCESS_DB_PATH}")
        sys.exit(1)

    # Create extractor
    extractor = AccessAttachmentExtractor()

    # Run extraction
    if args.sample:
        logger.info("Running in SAMPLE mode (first 5 records)")
        extractor.extract_photos(sample=True)
    else:
        limit = args.limit if args.limit else None
        logger.info(f"Running FULL extraction (limit: {limit if limit else 'all records'})")
        extractor.extract_photos(limit=limit)

    # Save mappings
    if extractor.photo_mappings:
        extractor.save_mappings(args.output)
    else:
        logger.warning("No photos extracted, nothing to save")

    logger.info("\nExtraction completed!")


if __name__ == '__main__':
    main()
