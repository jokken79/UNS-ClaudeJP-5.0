"""Fix corrupted photo_data_url base64 data by removing metadata header - Version 2 with forced fix"""
import sys
sys.path.insert(0, '/app')

import base64
from app.core.database import SessionLocal
from app.models.models import Candidate

# Image format markers
JPEG_MARKER = b'\xFF\xD8\xFF'  # JPEG starts with FFD8FF
PNG_MARKER = b'\x89\x50\x4E\x47'  # PNG starts with 89504E47

def find_image_start(data: bytes) -> tuple[int, str]:
    """
    Find the actual start of image data by locating format markers
    Returns: (position, format_type)
    """
    # Try JPEG
    jpeg_pos = data.find(JPEG_MARKER)
    if jpeg_pos != -1:
        return jpeg_pos, 'JPEG'

    # Try PNG
    png_pos = data.find(PNG_MARKER)
    if png_pos != -1:
        return png_pos, 'PNG'

    return -1, 'UNKNOWN'

def extract_base64_data(data_url: str) -> str:
    """Extract base64 part from data URL"""
    if ',' in data_url:
        return data_url.split(',', 1)[1]
    return data_url

def fix_photo_data(photo_data_url: str) -> tuple[str, str, int]:
    """
    Fix corrupted photo data by removing metadata header
    Returns: (fixed_data_url, status_message, bytes_removed)
    """
    try:
        # Extract base64 part
        base64_data = extract_base64_data(photo_data_url)

        # Decode base64
        image_bytes = base64.b64decode(base64_data)

        # Find actual image start
        image_start, format_type = find_image_start(image_bytes)

        if image_start == -1:
            return photo_data_url, "ERROR: No image marker found", 0

        if image_start == 0:
            return photo_data_url, f"OK: Already clean {format_type}", 0

        # Remove corrupted header
        clean_image_bytes = image_bytes[image_start:]

        # Determine MIME type
        if format_type == 'JPEG':
            mime_type = "image/jpeg"
        elif format_type == 'PNG':
            mime_type = "image/png"
        else:
            mime_type = "image/jpeg"  # Default

        # Re-encode to base64
        clean_base64 = base64.b64encode(clean_image_bytes).decode('utf-8')

        # Create new data URL
        fixed_data_url = f"data:{mime_type};base64,{clean_base64}"

        return fixed_data_url, f"FIXED: Removed {image_start} bytes ({format_type})", image_start

    except Exception as e:
        return photo_data_url, f"ERROR: {str(e)}", 0

def main():
    print("=" * 80)
    print("FIXING CORRUPTED PHOTO DATA - VERSION 2")
    print("=" * 80)

    db = SessionLocal()

    try:
        # Count total candidates with photos
        total_with_photos = db.query(Candidate).filter(
            Candidate.photo_data_url.isnot(None),
            Candidate.photo_data_url != ''
        ).count()

        print(f"\nTotal candidates with photos: {total_with_photos}")
        print("\nProcessing photos...")
        print("-" * 80)

        # Process in batches
        batch_size = 100
        offset = 0
        total_fixed = 0
        total_errors = 0
        total_already_clean = 0
        bytes_removed_stats = {}

        while True:
            # Fetch batch
            candidates = db.query(Candidate).filter(
                Candidate.photo_data_url.isnot(None),
                Candidate.photo_data_url != ''
            ).offset(offset).limit(batch_size).all()

            if not candidates:
                break

            # Process each candidate in batch
            for candidate in candidates:
                fixed_data_url, status, bytes_removed = fix_photo_data(candidate.photo_data_url)

                if status.startswith("FIXED"):
                    candidate.photo_data_url = fixed_data_url
                    total_fixed += 1
                    # Track bytes removed distribution
                    bytes_removed_stats[bytes_removed] = bytes_removed_stats.get(bytes_removed, 0) + 1
                elif status.startswith("ERROR"):
                    total_errors += 1
                elif status.startswith("OK"):
                    total_already_clean += 1

                # Log progress
                processed = offset + len([c for c in candidates if candidates.index(c) < candidates.index(candidate)]) + 1
                if processed % 100 == 0:
                    print(f"Processed: {processed}/{total_with_photos} | "
                          f"Fixed: {total_fixed} | Clean: {total_already_clean} | Errors: {total_errors}")

            # Commit batch
            db.commit()
            print(f"  ✓ Committed batch {offset//batch_size + 1} ({len(candidates)} candidates)")
            offset += batch_size

        print("-" * 80)
        print("\n" + "=" * 80)
        print("RESULTS")
        print("=" * 80)
        print(f"Total processed:    {total_with_photos}")
        print(f"Fixed (corrupted):  {total_fixed}")
        print(f"Already clean:      {total_already_clean}")
        print(f"Errors:             {total_errors}")

        if bytes_removed_stats:
            print(f"\nBytes removed distribution:")
            for bytes_removed in sorted(bytes_removed_stats.keys()):
                count = bytes_removed_stats[bytes_removed]
                print(f"  {bytes_removed:3d} bytes: {count:4d} photos")

        print("=" * 80)

        # Verify samples
        print("\n" + "=" * 80)
        print("VERIFICATION - Sample of first 10 photos")
        print("=" * 80)

        sample_candidates = db.query(Candidate).filter(
            Candidate.photo_data_url.isnot(None),
            Candidate.photo_data_url != ''
        ).limit(10).all()

        for i, candidate in enumerate(sample_candidates, 1):
            base64_data = extract_base64_data(candidate.photo_data_url)
            image_bytes = base64.b64decode(base64_data)

            # Check first 4 bytes
            header_hex = image_bytes[:4].hex()

            if image_bytes.startswith(JPEG_MARKER):
                format_status = "✓ VALID JPEG"
            elif image_bytes.startswith(PNG_MARKER):
                format_status = "✓ VALID PNG"
            else:
                format_status = f"✗ INVALID (starts with {header_hex})"

            print(f"{i:2d}. ID={candidate.id:4d} | Header: {header_hex} | {format_status}")

        print("=" * 80)

    finally:
        db.close()

if __name__ == "__main__":
    main()
