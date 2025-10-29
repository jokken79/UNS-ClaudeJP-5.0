# Implementation Summary: AzureOCRUploader Integration Fix

## Date: 2025-10-24

## Problem Fixed
The `AzureOCRUploader` component was sending data with form field names (e.g., `nameKanji`, `nameFurigana`), but the `handleAzureOcrComplete` function in `rirekisho/page.tsx` expected raw OCR field names (e.g., `name_kanji`, `full_name_kanji`).

## Solution Implemented
Modified `AzureOCRUploader.tsx` to send RAW OCR data with original field names, allowing the parent component to handle the field mapping.

## Files Modified

### `/home/user/UNS-ClaudeJP-4.2/frontend-nextjs/components/AzureOCRUploader.tsx`

#### Changes Made:

1. **Removed**: `mapOCRFieldsToForm()` function (lines 52-165)
   - This function was mapping OCR fields to form fields
   - This mapping should be done by the parent component, not the uploader

2. **Added**: `combineOCRResults()` function (lines 52-102)
   - Combines raw OCR results from multiple documents (Zairyu Card + License)
   - Preserves original OCR field names (e.g., `name_kanji`, `license_number`)
   - Zairyu Card fields have priority over License fields
   - License-specific fields always added (`license_number`, `license_expiry`, etc.)
   - Common fields from License only added if not present from Zairyu Card

3. **Updated**: `uploadToAzure()` function (lines 229-240)
   - Changed from calling `mapOCRFieldsToForm()` to `combineOCRResults()`
   - Added comment explaining that raw data is sent to parent
   - Parent component handles field mapping

4. **Added**: Documentation comment at top of file (lines 17-30)
   - Explains the data flow
   - Clarifies that this component does NOT map field names

## Data Flow

```
User uploads document(s)
    ↓
Azure OCR API processes
    ↓
Raw OCR results with original field names
(e.g., name_kanji, full_name_kanji, license_number)
    ↓
combineOCRResults() combines multiple documents
(Zairyu Card priority, License supplements)
    ↓
Combined RAW data sent to onResult callback
    ↓
handleAzureOcrComplete in rirekisho/page.tsx
    ↓
Maps raw fields to form fields using applyField()
(e.g., name_kanji → nameKanji)
    ↓
Form updated with mapped data
```

## Example Data Structure

### Before (WRONG - was mapping too early):
```typescript
{
  nameKanji: "田中 太郎",
  nameFurigana: "タナカ タロウ",
  birthday: "1990-01-01",
  licenseNo: "123456789"
}
```

### After (CORRECT - raw OCR data):
```typescript
{
  name_kanji: "田中 太郎",
  full_name_kana: "タナカ タロウ",
  date_of_birth: "1990-01-01",
  license_number: "123456789",
  _sourceDocuments: ["zairyu_card", "license"]
}
```

## Field Priority Rules

1. **Zairyu Card fields have highest priority** - copied first
2. **License-specific fields always added**:
   - `license_number`, `menkyo_number`
   - `license_expiry`, `license_expire_date`
   - `license_type`
3. **Common fields from License only if not present**:
   - Name fields: `name_kanji`, `full_name_kanji`, `name_roman`, `name_kana`, etc.
   - Date fields: `birthday`, `date_of_birth`
   - Address fields: `address`, `current_address`, `postal_code`, etc.
   - Other: `gender`, `photo`, etc.

## Integration with handleAzureOcrComplete

The parent component's `handleAzureOcrComplete` function expects raw OCR field names:

```typescript
// From rirekisho/page.tsx lines 583-599
applyField("nameKanji", "氏名（漢字）", "full_name_kanji", "name_kanji", "name_roman");
applyField("nameFurigana", "フリガナ", "full_name_kana", "name_kana", "name_katakana");
applyField("birthday", "生年月日", "date_of_birth", "birthday");
applyField("licenseNo", "免許証番号", "license_number", "menkyo_number");
applyField("licenseExpiry", "免許証有効期限", "license_expiry", "license_expire_date");
// ... etc
```

The `applyField` function looks for values in multiple possible source keys, handling variations in OCR field names.

## Testing Recommendations

1. **Test with Zairyu Card only**:
   - Verify all Zairyu Card fields are extracted and mapped correctly
   - Check that `_sourceDocuments` contains `['zairyu_card']`

2. **Test with License only**:
   - Verify license fields are extracted and mapped correctly
   - Check that `_sourceDocuments` contains `['license']`

3. **Test with both documents**:
   - Verify Zairyu Card fields take priority
   - Verify License-specific fields are added
   - Verify License common fields supplement missing Zairyu Card data
   - Check that `_sourceDocuments` contains `['zairyu_card', 'license']`

4. **Test field mapping**:
   - Verify `name_kanji` → `nameKanji`
   - Verify `license_number` → `licenseNo`
   - Verify date fields are normalized
   - Verify phone numbers are formatted

## Benefits

1. **Separation of concerns**: Uploader handles OCR, parent handles mapping
2. **Flexibility**: Parent can change field mappings without modifying uploader
3. **Maintainability**: Single source of truth for field mappings
4. **Debugging**: Easier to see raw OCR data and track mapping issues

## No Breaking Changes

- The interface remains the same: `onResult: (data: Record<string, unknown>) => void`
- The parent component already expects raw OCR field names
- No changes needed to other components

---

**Implementation Status**: ✅ COMPLETE

**Files Modified**: 1 file
- `/home/user/UNS-ClaudeJP-4.2/frontend-nextjs/components/AzureOCRUploader.tsx`

**Ready for Testing**: YES
