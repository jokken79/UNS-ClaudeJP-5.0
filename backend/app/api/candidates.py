"""
Candidates API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
import asyncio
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
import os
import shutil
from typing import Optional, Dict, Any
from datetime import datetime, date
import re
import json

from app.core.database import get_db
from app.core.config import settings
from app.models.models import Candidate, Document, Employee, User, CandidateStatus, DocumentType, CandidateForm
from app.schemas.candidate import (
    CandidateCreate, CandidateUpdate, CandidateResponse,
    CandidateApprove, CandidateReject, DocumentUpload, OCRData,
    RirekishoFormCreate, CandidateFormResponse
)
from app.schemas.base import PaginatedResponse
from app.services.auth_service import auth_service
from app.services.azure_ocr_service import azure_ocr_service

import logging

router = APIRouter()

logger = logging.getLogger(__name__)


def _build_emergency_contact(candidate: "Candidate") -> Optional[str]:
    """Build emergency contact string combining name and relation."""
    parts = []
    if getattr(candidate, "emergency_contact_name", None):
        parts.append(candidate.emergency_contact_name)
    if getattr(candidate, "emergency_contact_relation", None):
        parts.append(f"({candidate.emergency_contact_relation})")

    contact = " ".join(parts).strip()
    return contact or None


import threading

# Lock for thread-safe Rirekisho ID generation
id_generation_lock = threading.Lock()


def _clean_string(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, str):
        cleaned = value.strip()
        return cleaned or None
    return str(value)


def _parse_int(value: Any) -> Optional[int]:
    if value is None:
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        digits = re.sub(r"[^0-9]", "", value)
        if not digits:
            return None
        try:
            return int(digits)
        except ValueError:
            return None
    return None


def _parse_date_value(value: Any) -> Optional[date]:
    if not value:
        return None
    if isinstance(value, date):
        return value
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, str):
        candidate_value = value.strip()
        if not candidate_value:
            return None
        # Remove Japanese suffixes like "まで"
        candidate_value = re.sub(r"まで$", "", candidate_value)
        # Japanese era-like format YYYY年MM月DD日
        jp_match = re.findall(r"\d+", candidate_value)
        if len(jp_match) >= 3:
            try:
                year, month, day = (int(jp_match[0]), int(jp_match[1]), int(jp_match[2]))
                if 1 <= month <= 12 and 1 <= day <= 31:
                    return date(year, month, day)
            except ValueError:
                pass
        # Try known date formats
        for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d", "%Y-%m-%dT%H:%M:%S", "%Y/%m/%d %H:%M:%S"):
            try:
                return datetime.strptime(candidate_value[:len(fmt)], fmt).date()
            except ValueError:
                continue
    return None


def _bool_to_flag(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, bool):
        return "有" if value else "無"
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"有", "あり", "true", "yes", "1"}:
            return "有"
        if lowered in {"無", "なし", "false", "no", "0"}:
            return "無"
    return None


def _map_family_entries(updates: Dict[str, Any], family_entries: Any) -> None:
    if not isinstance(family_entries, list):
        return
    for idx, member in enumerate(family_entries[:5]):
        if not isinstance(member, dict):
            continue
        base_index = idx + 1
        name = _clean_string(member.get("name"))
        relation = _clean_string(member.get("relation"))
        age = _parse_int(member.get("age"))
        residence = _clean_string(member.get("residence"))
        if not any([name, relation, age, residence]):
            continue
        updates[f"family_name_{base_index}"] = name
        updates[f"family_relation_{base_index}"] = relation
        if age is not None:
            updates[f"family_age_{base_index}"] = age
        if residence is not None:
            updates[f"family_residence_{base_index}"] = residence


def _summarize_jobs(jobs: Any) -> Optional[str]:
    if not isinstance(jobs, list) or not jobs:
        return None
    summaries = []
    for entry in jobs:
        if not isinstance(entry, dict):
            continue
        start = _clean_string(entry.get("start"))
        end = _clean_string(entry.get("end"))
        hakenmoto = _clean_string(entry.get("hakenmoto"))
        hakensaki = _clean_string(entry.get("hakensaki"))
        content = _clean_string(entry.get("content"))
        reason = _clean_string(entry.get("reason"))
        parts = []
        if start or end:
            parts.append(f"{start or ''}〜{end or ''}")
        if hakenmoto or hakensaki:
            parts.append(f"派遣元:{hakenmoto or '-'}→派遣先:{hakensaki or '-'}")
        if content:
            parts.append(f"業務:{content}")
        if reason:
            parts.append(f"備考:{reason}")
        if parts:
            summaries.append(" / ".join(parts))
    return "\n".join(summaries) if summaries else None


def _map_form_to_candidate(form_data: Dict[str, Any], applicant_id: Optional[str], photo_data_url: Optional[str]) -> Dict[str, Any]:
    updates: Dict[str, Any] = {}

    if applicant_id:
        updates["applicant_id"] = applicant_id

    updates["reception_date"] = _parse_date_value(form_data.get("receptionDate"))
    updates["full_name_kanji"] = _clean_string(form_data.get("nameKanji"))
    updates["full_name_kana"] = _clean_string(form_data.get("nameFurigana"))
    updates["date_of_birth"] = _parse_date_value(form_data.get("birthday"))
    updates["gender"] = _clean_string(form_data.get("gender"))
    updates["nationality"] = _clean_string(form_data.get("nationality"))
    updates["postal_code"] = _clean_string(form_data.get("postalCode"))
    updates["current_address"] = _clean_string(form_data.get("address"))
    updates["address"] = _clean_string(form_data.get("address"))
    updates["mobile"] = _clean_string(form_data.get("mobile"))
    updates["phone"] = _clean_string(form_data.get("phone"))
    updates["emergency_contact_name"] = _clean_string(form_data.get("emergencyName"))
    updates["emergency_contact_relation"] = _clean_string(form_data.get("emergencyRelation"))
    updates["emergency_contact_phone"] = _clean_string(form_data.get("emergencyPhone"))
    updates["residence_status"] = _clean_string(form_data.get("visaType"))
    updates["residence_expiry"] = _parse_date_value(form_data.get("visaPeriod"))
    updates["residence_card_number"] = _clean_string(form_data.get("residenceCardNo"))
    updates["passport_number"] = _clean_string(form_data.get("passportNo"))
    updates["passport_expiry"] = _parse_date_value(form_data.get("passportExpiry"))
    updates["license_number"] = _clean_string(form_data.get("licenseNo"))
    updates["license_expiry"] = _parse_date_value(form_data.get("licenseExpiry"))
    updates["car_ownership"] = _clean_string(form_data.get("carOwner"))
    updates["voluntary_insurance"] = _clean_string(form_data.get("insurance"))
    updates["speaking_level"] = _clean_string(form_data.get("speakLevel"))
    updates["listening_level"] = _clean_string(form_data.get("listenLevel"))
    updates["read_kanji"] = _clean_string(form_data.get("kanjiReadLevel"))
    updates["write_kanji"] = _clean_string(form_data.get("kanjiWriteLevel"))
    updates["read_hiragana"] = _clean_string(form_data.get("hiraganaReadLevel"))
    updates["write_hiragana"] = _clean_string(form_data.get("hiraganaWriteLevel"))
    updates["read_katakana"] = _clean_string(form_data.get("katakanaReadLevel"))
    updates["write_katakana"] = _clean_string(form_data.get("katakanaWriteLevel"))
    updates["major"] = _clean_string(form_data.get("major"))
    updates["blood_type"] = _clean_string(form_data.get("bloodType"))
    updates["dominant_hand"] = _clean_string(form_data.get("dominantArm"))
    updates["allergy_exists"] = _clean_string(form_data.get("allergy"))
    updates["safety_shoes"] = _clean_string(form_data.get("safetyShoes"))
    updates["covid_vaccine_status"] = _clean_string(form_data.get("vaccine"))
    updates["forklift_license"] = _bool_to_flag(form_data.get("forkliftLicense"))
    updates["jlpt_taken"] = _bool_to_flag(form_data.get("jlpt"))
    updates["japanese_level"] = _clean_string(form_data.get("jlptLevel"))
    updates["qualification_1"] = _clean_string(form_data.get("otherQualifications"))
    updates["lunch_preference"] = _clean_string(form_data.get("lunchPref"))
    updates["bento_lunch_dinner"] = _clean_string(form_data.get("lunchPref"))
    updates["commute_method"] = _clean_string(form_data.get("commuteMethod"))
    commute_time = _parse_int(form_data.get("commuteTimeMin"))
    if commute_time is not None:
        updates["commute_time_oneway"] = commute_time
    updates["glasses"] = _clean_string(form_data.get("glasses"))

    _map_family_entries(updates, form_data.get("family"))

    notes_payload: Dict[str, Any] = {}
    jobs = form_data.get("jobs")
    jobs_summary = _summarize_jobs(jobs)
    if jobs_summary:
        notes_payload["jobs"] = jobs
        updates["work_history_company_7"] = jobs_summary
        first_job = next((item for item in jobs if isinstance(item, dict)), None)
        if first_job:
            entry_company = _clean_string(first_job.get("hakenmoto"))
            exit_company = _clean_string(first_job.get("hakensaki"))
            updates["work_history_entry_company_7"] = entry_company or jobs_summary
            if exit_company:
                updates["work_history_exit_company_7"] = exit_company
    if form_data.get("education"):
        notes_payload["education"] = form_data.get("education")
    if form_data.get("azureRaw"):
        notes_payload["azureRaw"] = form_data.get("azureRaw")
    if form_data.get("azureAppliedFields"):
        notes_payload["azureAppliedFields"] = form_data.get("azureAppliedFields")
    if form_data.get("family"):
        notes_payload.setdefault("family", form_data.get("family"))
    if notes_payload:
        updates["ocr_notes"] = json.dumps(notes_payload, ensure_ascii=False)

    if photo_data_url:
        updates["photo_data_url"] = photo_data_url
        updates["photo_url"] = photo_data_url

    return updates


def _apply_candidate_updates(candidate: Candidate, updates: Dict[str, Any]) -> None:
    for field, value in updates.items():
        if value is not None and hasattr(candidate, field):
            setattr(candidate, field, value)

from sqlalchemy import func, cast, Integer

# ... (other imports)

# Lock for thread-safe Applicant ID generation
applicant_id_generation_lock = threading.Lock()


def generate_rirekisho_id(db: Session) -> str:
    """Generate next Rirekisho ID in a thread-safe manner."""
    with id_generation_lock:
        # Get last candidate
        last_candidate = db.query(Candidate).order_by(Candidate.id.desc()).first()

        prefix = getattr(settings, 'RIREKISHO_ID_PREFIX', 'UNS-')
        start_num = getattr(settings, 'RIREKISHO_ID_START', 1)

        if not isinstance(prefix, str) or not prefix:
            raise ValueError("RIREKISHO_ID_PREFIX must be a non-empty string.")
        if not isinstance(start_num, int) or start_num < 1:
            raise ValueError("RIREKISHO_ID_START must be a positive integer.")

        if last_candidate and hasattr(last_candidate, 'rirekisho_id') and last_candidate.rirekisho_id:
            try:
                last_num = int(last_candidate.rirekisho_id.split('-')[1])
                next_num = last_num + 1
            except (IndexError, ValueError):
                # Fallback if parsing fails
                next_num = db.query(Candidate).count() + start_num
        else:
            next_num = start_num

        return f"{prefix}{next_num}"


def generate_applicant_id(db: Session) -> str:
    """Generate next numeric Applicant ID starting from 2000."""
    with applicant_id_generation_lock:
        max_id = db.query(func.max(cast(Candidate.applicant_id, Integer))).scalar()
        
        if max_id is None or max_id < 2000:
            next_id = 2000
        else:
            next_id = max_id + 1
            
        return str(next_id)


@router.post("/", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
async def create_candidate(
    candidate: CandidateCreate,
    current_user: User = Depends(auth_service.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create new candidate from rirekisho (履歴書)
    """
    # Basic validation
    if not candidate.full_name_kanji and not candidate.full_name_roman:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Candidate name (Kanji or Roman) is required.",
        )

    # Generate Rirekisho ID
    rirekisho_id = generate_rirekisho_id(db)

    # Create candidate with all rirekisho fields
    new_candidate = Candidate(
        rirekisho_id=rirekisho_id,
        **candidate.model_dump(exclude_unset=True)
    )

    if not getattr(new_candidate, "applicant_id", None):
        new_candidate.applicant_id = rirekisho_id
    if getattr(new_candidate, "photo_data_url", None) and not getattr(new_candidate, "photo_url", None):
        new_candidate.photo_url = new_candidate.photo_data_url

    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)

    return new_candidate


@router.post("/rirekisho/form", response_model=CandidateFormResponse, status_code=status.HTTP_201_CREATED)
async def save_rirekisho_form(
    payload: RirekishoFormCreate,
    current_user: User = Depends(auth_service.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Persist a raw rirekisho form snapshot and sync key fields into candidates."""

    if not payload.form_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="form_data is required."
        )

    # Applicant ID is now optional from the frontend
    applicant_id = _clean_string(payload.applicant_id) or _clean_string(payload.form_data.get("applicantId"))
    rirekisho_id = _clean_string(payload.rirekisho_id)

    candidate = None
    if rirekisho_id:
        candidate = db.query(Candidate).filter(Candidate.rirekisho_id == rirekisho_id).first()
    
    if not candidate and applicant_id:
        candidate = db.query(Candidate).filter(Candidate.applicant_id == applicant_id).first()

    photo_data_url = payload.photo_data_url or payload.form_data.get("photoDataUrl")
    
    # Pass applicant_id if it exists, otherwise it will be generated for new candidates
    updates = _map_form_to_candidate(payload.form_data, applicant_id, photo_data_url)

    if candidate:
        # Updating an existing candidate
        _apply_candidate_updates(candidate, updates)
        db.add(candidate)
    else:
        # Creating a new candidate
        new_applicant_id = generate_applicant_id(db)
        updates['applicant_id'] = new_applicant_id
        
        candidate_kwargs = {key: value for key, value in updates.items() if value is not None}
        
        if 'rirekisho_id' not in candidate_kwargs or not candidate_kwargs['rirekisho_id']:
            candidate_kwargs['rirekisho_id'] = generate_rirekisho_id(db)

        candidate = Candidate(**candidate_kwargs)
        db.add(candidate)

    # Ensure the applicant_id for the form entry is consistent
    final_applicant_id = candidate.applicant_id

    form_entry = CandidateForm(
        candidate=candidate,
        rirekisho_id=candidate.rirekisho_id,
        applicant_id=final_applicant_id,
        form_data=payload.form_data,
        photo_data_url=photo_data_url,
        azure_metadata=payload.azure_metadata,
    )

    db.add(form_entry)
    db.commit()
    db.refresh(candidate)
    db.refresh(form_entry)

    return form_entry


@router.get("/", response_model=PaginatedResponse)
async def list_candidates(
    skip: int = 0,
    limit: int = 50,
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[CandidateStatus] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None,
    current_user: User = Depends(auth_service.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List all candidates with pagination
    sort options: 'newest' (default), 'oldest'
    Supports both skip/limit and page/page_size pagination
    """
    # Use skip/limit if provided, otherwise use page/page_size
    if skip > 0 or limit != 50:
        actual_skip = skip
        actual_limit = min(limit, 1000)  # Max 1000 items
    else:
        actual_skip = (page - 1) * page_size
        actual_limit = page_size

    query = db.query(Candidate)

    # Apply filters
    if status_filter:
        query = query.filter(Candidate.status == status_filter)

    if search:
        query = query.filter(
            (Candidate.full_name_kanji.ilike(f"%{search}%")) |
            (Candidate.full_name_kana.ilike(f"%{search}%")) |
            (Candidate.full_name_roman.ilike(f"%{search}%")) |
            (Candidate.rirekisho_id.ilike(f"%{search}%"))
        )

    # Apply sorting
    if sort == "oldest":
        query = query.order_by(Candidate.created_at.asc())
    else:  # default to newest
        query = query.order_by(Candidate.created_at.desc())

    # Get total count
    total = query.count()

    # Apply pagination with eager loading to prevent N+1 queries
    candidates = (
        query.options(joinedload(Candidate.employee))
        .offset(actual_skip)
        .limit(actual_limit)
        .all()
    )

    # Convert SQLAlchemy objects to Pydantic models
    items = [CandidateResponse.model_validate(c) for c in candidates]

    return {
        "items": items,
        "total": total,
        "skip": actual_skip,
        "limit": actual_limit,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "has_more": (actual_skip + len(items)) < total
    }


@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(
    candidate_id: int,
    current_user: User = Depends(auth_service.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get candidate by ID with eager loaded relationships
    """
    candidate = (
        db.query(Candidate)
        .options(joinedload(Candidate.employee))
        .filter(Candidate.id == candidate_id)
        .first()
    )
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    return candidate


@router.put("/{candidate_id}", response_model=CandidateResponse)
async def update_candidate(
    candidate_id: int,
    candidate_update: CandidateUpdate,
    current_user: User = Depends(auth_service.require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Update candidate
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )

    # Update fields
    for field, value in candidate_update.model_dump(exclude_unset=True).items():
        setattr(candidate, field, value)

    db.commit()
    db.refresh(candidate)

    return candidate


@router.delete("/{candidate_id}")
async def delete_candidate(
    candidate_id: int,
    current_user: User = Depends(auth_service.require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Delete candidate
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )

    db.delete(candidate)
    db.commit()

    return {"message": "Candidate deleted successfully"}


@router.post("/{candidate_id}/upload", response_model=DocumentUpload)
async def upload_document(
    candidate_id: int,
    file: UploadFile = File(...),
    document_type: str = Form(...),
    current_user: User = Depends(auth_service.require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Upload document for candidate with OCR processing
    """
    # Verify candidate exists
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )

    # Validate file exists and has a filename
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have a filename"
        )

    # Sanitize filename - remove path traversal attempts and special characters
    import re
    safe_filename = re.sub(r'[^\w\s\-\.]', '', file.filename.replace('..', ''))
    if not safe_filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )

    # Validate file type by extension
    file_ext = os.path.splitext(safe_filename)[1].lower().replace('.', '')
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {settings.ALLOWED_EXTENSIONS}"
        )

    # Validate image file types specifically for photos/documents
    IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
    if file_ext in IMAGE_EXTENSIONS:
        # Validate content type matches extension
        if file.content_type and not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File content type does not match image extension"
            )

    # Create upload directory if not exists
    upload_dir = os.path.join(settings.UPLOAD_DIR, "candidates", str(candidate_id))
    os.makedirs(upload_dir, exist_ok=True)

    # Read file content with size limit (10 MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    file_content = await file.read()

    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE / (1024*1024):.1f} MB"
        )

    # If it's an image, validate it's actually a valid image
    if file_ext in IMAGE_EXTENSIONS:
        try:
            from PIL import Image
            import io
            image = Image.open(io.BytesIO(file_content))
            image.verify()  # Verify it's a valid image
            # Reset file pointer for saving
            file_content_io = io.BytesIO(file_content)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid or corrupted image file: {str(e)}"
            )

    # Save file
    file_path = os.path.join(upload_dir, safe_filename)
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )

    # Process with OCR
    ocr_data = None
    if document_type in ["rirekisho", "zairyu_card", "license"]:
        try:
            # Process with Azure OCR service
            ocr_result = azure_ocr_service.process_document(file_path, document_type)

            # Convert to OCRData model
            ocr_data = OCRData(
                full_name_kanji=ocr_result.get('name_kanji'),
                full_name_kana=ocr_result.get('name_kana'),
                date_of_birth=ocr_result.get('birthday'),
                gender=ocr_result.get('gender'),
                address=ocr_result.get('address'),
                phone=ocr_result.get('phone'),
                email=ocr_result.get('email'),
                raw_text=ocr_result.get('raw_text', '') or ocr_result.get('extracted_text', '')
            )
        except Exception as e:
            logger.error(f"OCR processing error: {e}")
            ocr_data = OCRData(raw_text=f"Error processing: {str(e)}")

    # Save document record
    document = Document(
        candidate_id=candidate_id,
        document_type=DocumentType[document_type.upper()],
        file_name=file.filename,
        file_path=file_path,
        file_size=os.path.getsize(file_path),
        mime_type=file.content_type,
        ocr_data=ocr_data.model_dump() if ocr_data else None,
        uploaded_by=current_user.id
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return DocumentUpload(
        document_id=document.id,
        file_name=file.filename,
        file_path=file_path,
        ocr_data=ocr_data,
        message="Document uploaded and processed successfully"
    )


@router.post("/{candidate_id}/approve", response_model=CandidateResponse)
async def approve_candidate(
    candidate_id: int,
    approve_data: CandidateApprove,
    current_user: User = Depends(auth_service.require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Approve candidate
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )

    candidate.status = CandidateStatus.APPROVED
    candidate.approved_by = current_user.id
    candidate.approved_at = func.now()

    if approve_data.promote_to_employee:
        # Avoid creating duplicate employees for the same rirekisho_id
        existing_employee = db.query(Employee).filter(Employee.rirekisho_id == candidate.rirekisho_id).first()

        if not existing_employee:
            employee_name = candidate.full_name_kanji or candidate.full_name_roman
            if not employee_name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Candidate name is required to create an employee",
                )

            last_employee = db.query(Employee).order_by(Employee.hakenmoto_id.desc()).first()
            next_hakenmoto_id = (last_employee.hakenmoto_id + 1) if last_employee else 1

            # Keep the 3-part Japanese address structure
            address_parts = [
                candidate.current_address,
                candidate.address_banchi,
                candidate.address_building,
            ]
            candidate_address = " ".join([part for part in address_parts if part]) or candidate.registered_address

            jikyu_value = approve_data.jikyu if approve_data.jikyu is not None else 0

            new_employee = Employee(
                hakenmoto_id=next_hakenmoto_id,
                rirekisho_id=candidate.rirekisho_id,
                factory_id=approve_data.factory_id,
                hakensaki_shain_id=approve_data.hakensaki_shain_id,
                full_name_kanji=employee_name,
                full_name_kana=candidate.full_name_kana,
                photo_url=candidate.photo_url,
                photo_data_url=candidate.photo_data_url,
                date_of_birth=candidate.date_of_birth,
                gender=candidate.gender,
                nationality=candidate.nationality,
                zairyu_card_number=candidate.residence_card_number,
                zairyu_expire_date=candidate.residence_expiry,
                address=candidate_address,
                current_address=candidate.current_address,  # 現住所 - Base address
                address_banchi=candidate.address_banchi,  # 番地 - Block/lot number
                address_building=candidate.address_building,  # 物件名 - Building name
                postal_code=candidate.postal_code,
                phone=candidate.mobile or candidate.phone,
                email=candidate.email,
                emergency_contact_name=candidate.emergency_contact_name,
                emergency_contact_relationship=candidate.emergency_contact_relation,
                emergency_contact_phone=candidate.emergency_contact_phone,
                hire_date=approve_data.hire_date or candidate.hire_date,
                jikyu=jikyu_value,
                position=approve_data.position,
                contract_type=approve_data.contract_type,
                notes=approve_data.notes,
            )

            db.add(new_employee)
            db.flush()

            # Copy candidate documents to the new employee profile
            candidate_documents = db.query(Document).filter(Document.candidate_id == candidate.id).all()
            for doc in candidate_documents:
                employee_document = Document(
                    employee_id=new_employee.id,
                    candidate_id=None,
                    document_type=doc.document_type,
                    file_name=doc.file_name,
                    file_path=doc.file_path,
                    file_size=doc.file_size,
                    mime_type=doc.mime_type,
                    ocr_data=doc.ocr_data,
                    uploaded_by=current_user.id,
                )
                db.add(employee_document)
        candidate.status = CandidateStatus.HIRED

    db.commit()
    db.refresh(candidate)

    return candidate


@router.post("/{candidate_id}/reject", response_model=CandidateResponse)
async def reject_candidate(
    candidate_id: int,
    reject_data: CandidateReject,
    current_user: User = Depends(auth_service.require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Reject candidate
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )

    candidate.status = CandidateStatus.REJECTED
    candidate.approved_by = current_user.id
    candidate.approved_at = func.now()

    db.commit()
    db.refresh(candidate)

    return candidate


@router.options("/ocr/process")
async def ocr_process_options():
    """Handle OPTIONS request for CORS preflight."""
    return {"success": True}


@router.post("/ocr/process")
async def process_ocr_document(
    file: UploadFile = File(...),
    document_type: str = Form(...)
):
    """
    Process document with OCR without creating candidate
    Returns extracted data including personal information

    Supported document types:
    - rirekisho: Resume/CV (履歴書)
    - zairyu_card: Residence Card (在留カード)
    - license: Driver's License (免許証)
    """
    logger.info(f"Starting OCR process for {document_type}")
    import tempfile

    # Validate file type
    logger.info(f"Validating file type for {file.filename}")
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ['.jpg', '.jpeg', '.png', '.pdf']:
        logger.error(f"Invalid file type: {file_ext}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not allowed. Allowed types: jpg, jpeg, png, pdf"
        )

    # Save to temporary file
    try:
        logger.info("Creating temporary file")
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
            logger.info(f"Temporary file created at {tmp_file.name}")
            shutil.copyfileobj(file.file, tmp_file)
            tmp_path = tmp_file.name
        logger.info("File saved to temporary location")
    except Exception as e:
        logger.error(f"Error saving temporary file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving temporary file: {str(e)}"
        )

    try:
        logger.info("Processing document with Azure OCR service")
        # Process with Azure OCR service
        ocr_result = azure_ocr_service.process_document(tmp_path, document_type)
        logger.info("OCR processing complete")

        # Add document type to the result
        ocr_result["document_type"] = document_type

        return {
            "success": True,
            "data": ocr_result,
            "message": "Document processed successfully"
        }
    except Exception as e:
        logger.error(f"OCR processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OCR processing error: {str(e)}"
        )
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            logger.info(f"Cleaning up temporary file {tmp_path}")
            os.remove(tmp_path)