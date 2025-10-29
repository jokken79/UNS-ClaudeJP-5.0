"""
Request Schemas (Yukyu, Ikkikokoku, etc.)
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from app.models.models import RequestType, RequestStatus


class RequestBase(BaseModel):
    """Base request schema"""
    employee_id: int
    request_type: RequestType
    start_date: date
    end_date: date
    total_days: Optional[Decimal] = None
    reason: Optional[str] = None
    notes: Optional[str] = None


class RequestCreate(RequestBase):
    """Create request"""
    pass


class RequestUpdate(BaseModel):
    """Update request"""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_days: Optional[Decimal] = None
    reason: Optional[str] = None
    notes: Optional[str] = None


class RequestResponse(RequestBase):
    """Request response"""
    id: int
    status: RequestStatus
    approved_by: Optional[int]
    approved_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class RequestReview(BaseModel):
    """Review request (approve/reject)"""
    status: RequestStatus  # approved or rejected
    notes: Optional[str] = None


class RequestStats(BaseModel):
    """Request statistics"""
    employee_id: int
    employee_name: str
    yukyu_total: int
    yukyu_used: int
    yukyu_remaining: int
    pending_requests: int
    approved_requests: int
    rejected_requests: int


class IkkikokokuRequest(BaseModel):
    """一時帰国 (Temporary return) request"""
    employee_id: int
    start_date: date
    end_date: date
    destination_country: str
    return_flight_date: date
    reason: str
    contact_during_absence: Optional[str] = None
    factory_notified: bool = False


class TaishaRequest(BaseModel):
    """退社報告 (Resignation) request"""
    employee_id: int
    resignation_date: date
    last_working_day: date
    reason: str
    return_to_country: bool
    forwarding_address: Optional[str] = None
    final_payment_method: Optional[str] = None
