# Microsoft Access (.accdb) Database Integration with Python

**Research Date:** 2025-10-24
**Technology:** Microsoft Access, Python 3.11+, pyodbc, Docker
**Purpose:** Migration from Access database to PostgreSQL with image extraction support

---

## Table of Contents

1. [Overview](#overview)
2. [Python Libraries for Access](#python-libraries-for-access)
3. [Connection Methods](#connection-methods)
4. [Extracting Table Schema and Data](#extracting-table-schema-and-data)
5. [Handling BLOB/OLE Object Fields (Images)](#handling-blobole-object-fields-images)
6. [Migration to PostgreSQL](#migration-to-postgresql)
7. [Docker Container Considerations](#docker-container-considerations)
8. [Complete Migration Example](#complete-migration-example)
9. [References](#references)

---

## Overview

Microsoft Access databases (.accdb format) can be accessed from Python using ODBC drivers. The primary challenge is that Access runs on Windows and requires specific drivers that may not be available in Docker Linux containers.

**Key Considerations:**
- Access ODBC drivers are Windows-only
- Docker containers on Windows host can access Windows ODBC drivers through volume mounting
- OLE Object fields require special handling to extract embedded images
- Python 32-bit vs 64-bit must match the Access/Office installation

---

## Python Libraries for Access

### 1. pyodbc (Recommended)

**Best choice for Python 3.11+ on Windows**

```bash
pip install pyodbc
```

**Pros:**
- Well-maintained, active development
- DB-API 2.0 compliant
- Works with any ODBC driver
- Supports parameterized queries
- Good documentation

**Cons:**
- Requires ODBC driver installation
- Windows-only for Access (unless using mdbtools)

### 2. pypyodbc

**Pure Python alternative to pyodbc**

```bash
pip install pypyodbc
```

**Pros:**
- Pure Python implementation
- No compilation required
- Similar API to pyodbc

**Cons:**
- Less actively maintained than pyodbc
- Potentially slower performance
- Some compatibility issues reported

### 3. pandas

**For reading Access data into DataFrames**

```python
import pandas as pd

conn_str = r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=C:\path\to\database.accdb;'
df = pd.read_sql("SELECT * FROM TableName", conn_str)
```

**Pros:**
- Simple for data analysis
- Automatic DataFrame creation
- Good for bulk reads

**Cons:**
- Limited transaction control
- Not suitable for complex operations

### 4. pywin32 (Windows COM)

**For advanced Access automation**

```bash
pip install pywin32
```

**Pros:**
- Can automate entire Access application
- Access to VBA functions like DoCmd.TransferDatabase
- No ODBC driver issues

**Cons:**
- Windows-only
- Requires Access installation (not just driver)
- More complex API

---

## Connection Methods

### Standard pyodbc Connection

```python
import pyodbc

# Basic connection string
conn_str = (
    r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};"
    r"DBQ=C:\full\path\to\database.accdb;"
)
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()
```

### Connection String Variations

```python
# Without password
conn_str = r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=C:\path\to\db.accdb;"

# With password
conn_str = (
    r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};"
    r"DBQ=C:\path\to\db.accdb;"
    r"PWD=your_password;"
)

# Using DSN (Data Source Name)
conn_str = "DSN=MyAccessDSN;UID=username;PWD=password;"
```

### Verifying Available Drivers

```python
import pyodbc

# List all available ODBC drivers
drivers = [d for d in pyodbc.drivers()]
print("Available ODBC drivers:")
for driver in drivers:
    print(f"  - {driver}")
```

**Expected Access drivers:**
- `Microsoft Access Driver (*.mdb, *.accdb)` - Modern driver (Office 2010+)
- `Microsoft Access Driver (*.mdb)` - Older driver (Office 2007 and earlier)

### Installing Access Database Engine

If drivers are missing, install:

**Microsoft Access Database Engine 2016 Redistributable**
- Download: https://www.microsoft.com/en-us/download/details.aspx?id=54920
- Choose 32-bit or 64-bit version to match your Python installation
- Required even if Office is not installed

---

## Extracting Table Schema and Data

### List All Tables

```python
import pyodbc

conn_str = r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=C:\path\to\db.accdb;"
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

# Get all user tables (excludes system tables)
tables = []
for table_info in cursor.tables(tableType='TABLE'):
    table_name = table_info.table_name
    # Skip Access system tables
    if not table_name.startswith('MSys'):
        tables.append(table_name)
        print(f"Table: {table_name}")

cursor.close()
conn.close()
```

### Get Table Schema (Column Information)

```python
import pyodbc

conn_str = r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=C:\path\to\db.accdb;"
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

table_name = "Employees"

# Get column metadata
print(f"\nSchema for table: {table_name}")
print("-" * 80)
print(f"{'Column Name':<30} {'Type':<20} {'Size':<10} {'Nullable'}")
print("-" * 80)

for row in cursor.columns(table=table_name):
    col_name = row.column_name
    col_type = row.type_name
    col_size = row.column_size
    nullable = "Yes" if row.nullable else "No"
    print(f"{col_name:<30} {col_type:<20} {col_size:<10} {nullable}")

cursor.close()
conn.close()
```

### Extract All Data from a Table

```python
import pyodbc

conn_str = r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=C:\path\to\db.accdb;"
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

# Execute query
cursor.execute("SELECT * FROM Employees")

# Get column names
columns = [column[0] for column in cursor.description]
print(f"Columns: {columns}")

# Fetch all rows
rows = cursor.fetchall()
print(f"\nTotal rows: {len(rows)}")

# Process each row
for row in rows:
    # Convert pyodbc.Row to dict for easier handling
    row_dict = dict(zip(columns, row))
    print(row_dict)

cursor.close()
conn.close()
```

### Using pandas for Easier Data Extraction

```python
import pandas as pd
import pyodbc

conn_str = r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=C:\path\to\db.accdb;"
conn = pyodbc.connect(conn_str)

# Read entire table into DataFrame
df = pd.read_sql("SELECT * FROM Employees", conn)
print(df.head())
print(f"\nShape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"\nData types:\n{df.dtypes}")

conn.close()
```

---

## Handling BLOB/OLE Object Fields (Images)

### Understanding Access OLE Objects

Access stores images as OLE (Object Linking and Embedding) objects. The BLOB field contains:
1. **OLE Header** (varies by image format, typically 78-300 bytes)
2. **Image Package Header** (optional)
3. **Actual Image Data** (BMP, JPG, PNG, etc.)

**Key Challenge:** The OLE wrapper must be stripped before extracting the usable image.

### Extracting Images from OLE Object Fields

#### Method 1: Manual Header Stripping (BMP Images)

```python
import pyodbc
import io
from PIL import Image

conn_str = r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=C:\path\to\db.accdb;"
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

# Query table with OLE Object field
cursor.execute("SELECT ID, PhotoField FROM Employees WHERE ID = ?", (1,))
row = cursor.fetchone()

if row and row.PhotoField:
    ole_data = row.PhotoField  # This is bytes

    # BMP images typically have OLE header of 78 bytes
    # Try different offsets if 78 doesn't work
    header_offsets = [78, 80, 82, 300]  # Common OLE header sizes

    for offset in header_offsets:
        try:
            # Skip OLE header and extract image data
            image_data = ole_data[offset:]

            # Try to open as image
            image = Image.open(io.BytesIO(image_data))
            image.save(f"extracted_photo_{row.ID}.png")
            print(f"Successfully extracted image with offset {offset}")
            break
        except Exception as e:
            continue
    else:
        print("Could not extract image with any known offset")

cursor.close()
conn.close()
```

#### Method 2: Smart Header Detection

```python
import pyodbc
import io
from PIL import Image

def extract_image_from_ole(ole_data):
    """
    Extract image from Access OLE Object field.
    Tries to detect image format and strip OLE header.
    """
    if not ole_data:
        return None

    # Known image format signatures
    signatures = {
        b'\xFF\xD8\xFF': 'JPEG',  # JPEG
        b'\x89PNG\r\n\x1a\n': 'PNG',  # PNG
        b'BM': 'BMP',  # BMP
        b'GIF87a': 'GIF',  # GIF87a
        b'GIF89a': 'GIF',  # GIF89a
    }

    # Search for image signature in OLE data
    for i in range(min(500, len(ole_data))):  # Search first 500 bytes
        for signature, format_name in signatures.items():
            if ole_data[i:i+len(signature)] == signature:
                # Found image data, strip everything before it
                image_data = ole_data[i:]
                try:
                    image = Image.open(io.BytesIO(image_data))
                    return image
                except Exception as e:
                    continue

    return None

# Usage
conn_str = r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=C:\path\to\db.accdb;"
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

cursor.execute("SELECT ID, PhotoField FROM Employees")
for row in cursor:
    if row.PhotoField:
        image = extract_image_from_ole(row.PhotoField)
        if image:
            image.save(f"photo_{row.ID}.png")
            print(f"Saved photo_{row.ID}.png - Format: {image.format}, Size: {image.size}")
        else:
            print(f"Could not extract image for ID {row.ID}")

cursor.close()
conn.close()
```

#### Method 3: Using Apache POI (Java-based, via JPype)

For complex OLE objects, Apache POI (Java library) provides robust OLE parsing:

```python
# Install: pip install JPype1
import jpype
import jpype.imports

# Start JVM with POI JAR
jpype.startJVM(classpath=['poi-5.2.3.jar'])

from org.apache.poi.poifs.filesystem import POIFSFileSystem
from org.apache.poi.hslf.usermodel import HSLFSlideShow

# This approach is more complex but handles all OLE formats
# Implementation left as reference
```

### Batch Image Extraction

```python
import pyodbc
import io
import os
from PIL import Image
from pathlib import Path

def extract_all_images(db_path, table_name, image_column, id_column, output_dir):
    """
    Extract all images from Access database OLE Object field.

    Args:
        db_path: Path to .accdb file
        table_name: Name of table containing images
        image_column: Name of OLE Object column with images
        id_column: Name of ID column for naming files
        output_dir: Directory to save extracted images
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    conn_str = f"DRIVER={{Microsoft Access Driver (*.mdb, *.accdb)}};DBQ={db_path};"
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()

    cursor.execute(f"SELECT {id_column}, {image_column} FROM {table_name}")

    extracted = 0
    failed = 0

    for row in cursor:
        record_id = getattr(row, id_column)
        ole_data = getattr(row, image_column)

        if not ole_data:
            continue

        # Try to extract image
        image = extract_image_from_ole(ole_data)

        if image:
            output_path = os.path.join(output_dir, f"{record_id}.png")
            image.save(output_path)
            extracted += 1
            print(f"✓ Extracted: {output_path}")
        else:
            failed += 1
            print(f"✗ Failed to extract image for ID: {record_id}")

    cursor.close()
    conn.close()

    print(f"\nExtraction complete:")
    print(f"  Successfully extracted: {extracted}")
    print(f"  Failed: {failed}")

# Usage
extract_all_images(
    db_path=r"C:\path\to\database.accdb",
    table_name="Employees",
    image_column="Photo",
    id_column="EmployeeID",
    output_dir=r"C:\extracted_images"
)
```

---

## Migration to PostgreSQL

### Approach 1: Using pyodbc + psycopg2

```python
import pyodbc
import psycopg2
from psycopg2 import sql

# Access connection
access_conn_str = r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=C:\path\to\db.accdb;"
access_conn = pyodbc.connect(access_conn_str)
access_cursor = access_conn.cursor()

# PostgreSQL connection
pg_conn = psycopg2.connect(
    host="localhost",
    database="target_db",
    user="postgres",
    password="password",
    port=5432
)
pg_cursor = pg_conn.cursor()

# Map Access types to PostgreSQL types
TYPE_MAPPING = {
    'INTEGER': 'INTEGER',
    'LONG': 'BIGINT',
    'SHORT': 'SMALLINT',
    'BYTE': 'SMALLINT',
    'SINGLE': 'REAL',
    'DOUBLE': 'DOUBLE PRECISION',
    'DECIMAL': 'NUMERIC',
    'CURRENCY': 'NUMERIC(19,4)',
    'TEXT': 'VARCHAR',
    'MEMO': 'TEXT',
    'DATETIME': 'TIMESTAMP',
    'BIT': 'BOOLEAN',
    'BINARY': 'BYTEA',
    'LONGBINARY': 'BYTEA',
    'VARBINARY': 'BYTEA',
    'GUID': 'UUID',
}

def create_postgres_table_from_access(table_name):
    """Create PostgreSQL table matching Access schema"""

    # Get Access table schema
    columns_sql = []
    for col in access_cursor.columns(table=table_name):
        col_name = col.column_name.lower()
        access_type = col.type_name.upper()

        # Map Access type to PostgreSQL
        pg_type = TYPE_MAPPING.get(access_type, 'TEXT')

        # Handle VARCHAR with size
        if access_type == 'TEXT' and col.column_size:
            pg_type = f'VARCHAR({col.column_size})'

        # Handle nullable
        nullable = "" if col.nullable else " NOT NULL"

        columns_sql.append(f"{col_name} {pg_type}{nullable}")

    # Create table
    create_sql = f"CREATE TABLE IF NOT EXISTS {table_name.lower()} ({', '.join(columns_sql)})"
    pg_cursor.execute(create_sql)
    pg_conn.commit()

    print(f"Created table: {table_name}")

def migrate_table_data(table_name):
    """Migrate data from Access to PostgreSQL"""

    # Get all data from Access
    access_cursor.execute(f"SELECT * FROM {table_name}")
    rows = access_cursor.fetchall()

    if not rows:
        print(f"No data to migrate for table: {table_name}")
        return

    # Get column names
    columns = [desc[0].lower() for desc in access_cursor.description]

    # Prepare INSERT statement
    placeholders = ', '.join(['%s'] * len(columns))
    insert_sql = f"INSERT INTO {table_name.lower()} ({', '.join(columns)}) VALUES ({placeholders})"

    # Insert data in batches
    batch_size = 1000
    total_rows = len(rows)

    for i in range(0, total_rows, batch_size):
        batch = rows[i:i+batch_size]
        pg_cursor.executemany(insert_sql, batch)
        pg_conn.commit()
        print(f"Migrated {min(i+batch_size, total_rows)}/{total_rows} rows for {table_name}")

# Get all tables from Access
tables = []
for table_info in access_cursor.tables(tableType='TABLE'):
    if not table_info.table_name.startswith('MSys'):
        tables.append(table_info.table_name)

# Migrate each table
for table in tables:
    print(f"\n=== Migrating table: {table} ===")
    create_postgres_table_from_access(table)
    migrate_table_data(table)

# Close connections
access_cursor.close()
access_conn.close()
pg_cursor.close()
pg_conn.close()

print("\n✓ Migration complete!")
```

### Approach 2: Using pandas (Simpler for Small Databases)

```python
import pandas as pd
import pyodbc
from sqlalchemy import create_engine

# Access connection string
access_conn_str = r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=C:\path\to\db.accdb;"
access_conn = pyodbc.connect(access_conn_str)

# PostgreSQL connection
pg_engine = create_engine('postgresql://user:password@localhost:5432/target_db')

# Get table list
cursor = access_conn.cursor()
tables = [t.table_name for t in cursor.tables(tableType='TABLE')
          if not t.table_name.startswith('MSys')]

# Migrate each table
for table in tables:
    print(f"Migrating {table}...")

    # Read from Access
    df = pd.read_sql(f"SELECT * FROM {table}", access_conn)

    # Write to PostgreSQL
    df.to_sql(
        name=table.lower(),
        con=pg_engine,
        if_exists='replace',  # or 'append'
        index=False,
        chunksize=1000
    )

    print(f"✓ Migrated {len(df)} rows from {table}")

access_conn.close()
print("\n✓ Migration complete!")
```

### Approach 3: Using pywin32 DoCmd.TransferDatabase (Best for Complex Migrations)

```python
import win32com.client
import pyodbc
from pathlib import Path

access_db_path = r"C:\path\to\database.accdb"

# Open Access application
access_app = win32com.client.Dispatch("Access.Application")
access_app.OpenCurrentDatabase(access_db_path)

# Get table list
conn_str = f"DRIVER={{Microsoft Access Driver (*.mdb, *.accdb)}};DBQ={access_db_path};"
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

tables = [t.table_name for t in cursor.tables(tableType='TABLE')
          if not t.table_name.startswith('MSys')]

# Export each table to PostgreSQL
acExport = 1  # Export
acTable = 0   # Table object type

pg_connection_string = (
    "ODBC;"
    "DRIVER={PostgreSQL Unicode};"
    "DATABASE=target_db;"
    "UID=postgres;"
    "PWD=password;"
    "SERVER=localhost;"
    "PORT=5432;"
)

for table in tables:
    print(f"Exporting {table}...")

    access_app.DoCmd.TransferDatabase(
        TransferType=acExport,
        DatabaseType="ODBC Database",
        DatabaseName=pg_connection_string,
        ObjectType=acTable,
        Source=table,
        Destination=table.lower()
    )

    print(f"✓ Exported {table}")

# Close Access
access_app.CloseCurrentDatabase()
access_app.Quit()
conn.close()

print("\n✓ Export complete!")
```

---

## Docker Container Considerations

### Challenge: Access Drivers in Docker

Microsoft Access ODBC drivers are **Windows-only** and cannot be installed in Linux Docker containers.

### Solution 1: Windows Container (Not Recommended)

```dockerfile
# Use Windows Server Core base image
FROM mcr.microsoft.com/windows/servercore:ltsc2019

# Install Python
# Install Access Database Engine
# ... (complex setup)
```

**Issues:**
- Windows containers are much larger (~5GB+)
- Performance overhead
- Limited Linux tool compatibility

### Solution 2: Host-Based Processing (Recommended)

**Architecture:**
1. Run Access extraction script on **Windows host**
2. Export data to intermediate format (CSV, JSON, SQL dump)
3. Docker container imports data into PostgreSQL

**Example workflow:**

```python
# Step 1: Run on Windows host (extract_access.py)
import pyodbc
import pandas as pd
from pathlib import Path

access_db = r"C:\data\database.accdb"
output_dir = Path(r"C:\data\exports")
output_dir.mkdir(exist_ok=True)

conn_str = f"DRIVER={{Microsoft Access Driver (*.mdb, *.accdb)}};DBQ={access_db};"
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

# Export each table as CSV
for table_info in cursor.tables(tableType='TABLE'):
    table_name = table_info.table_name
    if table_name.startswith('MSys'):
        continue

    df = pd.read_sql(f"SELECT * FROM {table_name}", conn)
    csv_path = output_dir / f"{table_name}.csv"
    df.to_csv(csv_path, index=False)
    print(f"Exported: {csv_path}")

conn.close()
```

```python
# Step 2: Run in Docker container (import_to_postgres.py)
import pandas as pd
from sqlalchemy import create_engine
from pathlib import Path

pg_engine = create_engine('postgresql://user:password@db:5432/target_db')
csv_dir = Path('/data/exports')  # Mounted volume

for csv_file in csv_dir.glob('*.csv'):
    table_name = csv_file.stem.lower()
    df = pd.read_csv(csv_file)

    df.to_sql(
        name=table_name,
        con=pg_engine,
        if_exists='replace',
        index=False,
        chunksize=1000
    )

    print(f"Imported: {table_name} ({len(df)} rows)")
```

**Docker Compose:**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: target_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  importer:
    build: ./importer
    depends_on:
      - postgres
    volumes:
      - C:\data\exports:/data/exports:ro  # Windows host path
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/target_db

volumes:
  pgdata:
```

### Solution 3: mdbtools (Linux Alternative)

**mdbtools** is a Linux library for reading Access databases:

```dockerfile
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    mdbtools \
    mdbtools-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install mdb-export pandas psycopg2-binary
```

**Usage:**

```bash
# Export table schema
mdb-schema database.accdb postgres > schema.sql

# Export table data
mdb-export database.accdb TableName > table_data.csv
```

**Limitations:**
- Read-only (cannot write to Access)
- May not support all Access features
- OLE Object extraction is limited

---

## Complete Migration Example

### Full Migration Script with Image Extraction

```python
import pyodbc
import psycopg2
from psycopg2 import sql
import io
import os
from PIL import Image
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AccessToPostgresMigrator:
    def __init__(self, access_db_path, pg_config, image_output_dir):
        self.access_db_path = access_db_path
        self.pg_config = pg_config
        self.image_output_dir = Path(image_output_dir)
        self.image_output_dir.mkdir(parents=True, exist_ok=True)

        # Connections
        self.access_conn = None
        self.pg_conn = None

    def connect(self):
        """Establish connections"""
        # Access
        access_conn_str = (
            f"DRIVER={{Microsoft Access Driver (*.mdb, *.accdb)}};"
            f"DBQ={self.access_db_path};"
        )
        self.access_conn = pyodbc.connect(access_conn_str)
        logger.info(f"Connected to Access: {self.access_db_path}")

        # PostgreSQL
        self.pg_conn = psycopg2.connect(**self.pg_config)
        logger.info(f"Connected to PostgreSQL: {self.pg_config['database']}")

    def extract_image_from_ole(self, ole_data):
        """Extract image from OLE Object field"""
        if not ole_data:
            return None

        signatures = {
            b'\xFF\xD8\xFF': 'JPEG',
            b'\x89PNG\r\n\x1a\n': 'PNG',
            b'BM': 'BMP',
        }

        for i in range(min(500, len(ole_data))):
            for signature, format_name in signatures.items():
                if ole_data[i:i+len(signature)] == signature:
                    image_data = ole_data[i:]
                    try:
                        return Image.open(io.BytesIO(image_data))
                    except:
                        continue
        return None

    def get_tables(self):
        """Get list of user tables from Access"""
        cursor = self.access_conn.cursor()
        tables = []
        for table_info in cursor.tables(tableType='TABLE'):
            if not table_info.table_name.startswith('MSys'):
                tables.append(table_info.table_name)
        cursor.close()
        return tables

    def migrate_table(self, table_name, image_column=None, id_column=None):
        """Migrate a single table from Access to PostgreSQL"""
        logger.info(f"Migrating table: {table_name}")

        access_cursor = self.access_conn.cursor()
        pg_cursor = self.pg_conn.cursor()

        # Get schema
        columns_info = []
        for col in access_cursor.columns(table=table_name):
            columns_info.append({
                'name': col.column_name,
                'type': col.type_name,
                'size': col.column_size,
                'nullable': col.nullable
            })

        # Create PostgreSQL table (simplified)
        pg_columns = []
        for col in columns_info:
            col_name = col['name'].lower()

            # Map Access types
            if col['type'].upper() in ['TEXT', 'VARCHAR']:
                pg_type = f"VARCHAR({col['size']})" if col['size'] else "TEXT"
            elif col['type'].upper() in ['INTEGER', 'LONG']:
                pg_type = "INTEGER"
            elif col['type'].upper() == 'DATETIME':
                pg_type = "TIMESTAMP"
            elif col['type'].upper() in ['LONGBINARY', 'BINARY']:
                pg_type = "BYTEA"
            else:
                pg_type = "TEXT"

            nullable = "" if col['nullable'] else " NOT NULL"
            pg_columns.append(f"{col_name} {pg_type}{nullable}")

        create_sql = f"CREATE TABLE IF NOT EXISTS {table_name.lower()} ({', '.join(pg_columns)})"
        pg_cursor.execute(create_sql)
        self.pg_conn.commit()

        # Extract data
        access_cursor.execute(f"SELECT * FROM {table_name}")
        rows = access_cursor.fetchall()

        if not rows:
            logger.info(f"No data in table: {table_name}")
            return

        # Handle image extraction if specified
        if image_column and id_column:
            logger.info(f"Extracting images from column: {image_column}")

            for row in rows:
                row_dict = dict(zip([d[0] for d in access_cursor.description], row))
                record_id = row_dict[id_column]
                ole_data = row_dict.get(image_column)

                if ole_data:
                    image = self.extract_image_from_ole(ole_data)
                    if image:
                        image_path = self.image_output_dir / table_name / f"{record_id}.png"
                        image_path.parent.mkdir(exist_ok=True)
                        image.save(image_path)
                        logger.info(f"  Extracted image: {image_path}")

        # Insert data
        columns = [d[0].lower() for d in access_cursor.description]
        placeholders = ', '.join(['%s'] * len(columns))
        insert_sql = f"INSERT INTO {table_name.lower()} ({', '.join(columns)}) VALUES ({placeholders})"

        pg_cursor.executemany(insert_sql, rows)
        self.pg_conn.commit()

        logger.info(f"✓ Migrated {len(rows)} rows from {table_name}")

        access_cursor.close()
        pg_cursor.close()

    def migrate_all(self, image_config=None):
        """
        Migrate all tables

        image_config: dict like {'Employees': {'image_col': 'Photo', 'id_col': 'EmployeeID'}}
        """
        tables = self.get_tables()
        logger.info(f"Found {len(tables)} tables to migrate")

        for table in tables:
            img_col = None
            id_col = None

            if image_config and table in image_config:
                img_col = image_config[table]['image_col']
                id_col = image_config[table]['id_col']

            self.migrate_table(table, image_column=img_col, id_column=id_col)

    def close(self):
        """Close connections"""
        if self.access_conn:
            self.access_conn.close()
        if self.pg_conn:
            self.pg_conn.close()
        logger.info("Connections closed")

# Usage
if __name__ == "__main__":
    migrator = AccessToPostgresMigrator(
        access_db_path=r"C:\path\to\database.accdb",
        pg_config={
            'host': 'localhost',
            'database': 'target_db',
            'user': 'postgres',
            'password': 'password',
            'port': 5432
        },
        image_output_dir=r"C:\extracted_images"
    )

    try:
        migrator.connect()

        # Specify tables with images
        image_config = {
            'Employees': {
                'image_col': 'Photo',
                'id_col': 'EmployeeID'
            }
        }

        migrator.migrate_all(image_config=image_config)

    finally:
        migrator.close()
```

---

## References

### Official Documentation

1. **pyodbc Documentation**
   - https://github.com/mkleehammer/pyodbc/wiki
   - https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-Microsoft-Access

2. **Microsoft Access Database Engine**
   - Download: https://www.microsoft.com/en-us/download/details.aspx?id=54920
   - Install both 32-bit and 64-bit if needed

3. **PostgreSQL ODBC Driver**
   - https://odbc.postgresql.org/

### Tutorials and Examples

1. **Connecting to Access with Python**
   - https://stackoverflow.com/questions/28708772/how-to-connect-ms-access-to-python-using-pyodbc
   - Medium article: "Connecting and Updating an Access Database with Python"

2. **Extracting OLE Objects**
   - https://stackoverflow.com/questions/10717232/how-extract-image-from-ole-object-from-ms-access
   - https://stackoverflow.com/questions/2416497/converting-an-ole-image-object-from-ms-access-for-use-in-net

3. **Access to PostgreSQL Migration**
   - https://stackoverflow.com/questions/66614826/how-to-use-pyodbc-to-migrate-tables-from-ms-access-to-postgres

### Alternative Tools

1. **mdbtools** (Linux Access reader)
   - https://github.com/mdbtools/mdbtools
   - Command: `mdb-schema database.accdb postgres`

2. **DBeaver** (GUI database migration tool)
   - https://dbeaver.io/
   - Supports Access to PostgreSQL migration

3. **Apache POI** (Java OLE handling)
   - https://poi.apache.org/
   - For complex OLE object parsing

---

## Key Takeaways

1. **pyodbc is the recommended library** for Python 3.11+ Access connectivity
2. **32-bit vs 64-bit matters** - Python and Access driver must match
3. **OLE Object extraction requires header stripping** - Use signature detection
4. **Docker on Windows can access host ODBC** through volume mounting
5. **For production migrations**, consider exporting to CSV/JSON as intermediate format
6. **Image extraction needs special handling** - Not all OLE formats are equal
7. **Use pandas for simple migrations**, pyodbc for complex control
8. **Always test extraction with sample data** before full migration

---

**End of Research Documentation**
