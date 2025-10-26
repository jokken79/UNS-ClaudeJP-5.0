"""Verify all photo data is clean"""
import sys
sys.path.insert(0, '/app')

import base64
from app.core.database import SessionLocal
from app.models.models import Candidate

JPEG_MARKER = b'\xFF\xD8\xFF'
PNG_MARKER = b'\x89\x50\x4E\x47'

db = SessionLocal()

print("=" * 80)
print("VERIFYING ALL PHOTOS")
print("=" * 80)

# Get all candidates with photos
candidates = db.query(Candidate).filter(
    Candidate.photo_data_url.isnot(None),
    Candidate.photo_data_url != ''
).all()

total = len(candidates)
valid_jpeg = 0
valid_png = 0
corrupted = 0

corrupted_list = []

for i, candidate in enumerate(candidates, 1):
    try:
        base64_data = candidate.photo_data_url.split(',', 1)[1] if ',' in candidate.photo_data_url else candidate.photo_data_url
        image_bytes = base64.b64decode(base64_data)
        first_4 = image_bytes[:4].hex()

        if image_bytes.startswith(JPEG_MARKER):
            valid_jpeg += 1
        elif image_bytes.startswith(PNG_MARKER):
            valid_png += 1
        else:
            corrupted += 1
            corrupted_list.append((candidate.id, first_4))

        if i % 200 == 0:
            print(f"Checked: {i}/{total} | JPEG: {valid_jpeg} | PNG: {valid_png} | Corrupted: {corrupted}")

    except Exception as e:
        corrupted += 1
        corrupted_list.append((candidate.id, f"ERROR: {str(e)}"))

print("\n" + "=" * 80)
print("FINAL RESULTS")
print("=" * 80)
print(f"Total photos:       {total}")
print(f"Valid JPEG:         {valid_jpeg}")
print(f"Valid PNG:          {valid_png}")
print(f"Corrupted:          {corrupted}")
print("=" * 80)

if corrupted_list:
    print("\nCORRUPTED PHOTOS:")
    for candidate_id, header in corrupted_list[:20]:  # Show first 20
        print(f"  ID {candidate_id}: {header}")
    if len(corrupted_list) > 20:
        print(f"  ... and {len(corrupted_list) - 20} more")
else:
    print("\n✓ ALL PHOTOS ARE VALID!")

print("=" * 80)

db.close()
