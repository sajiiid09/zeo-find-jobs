from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import ApplicationStatus, JobStatus, JobType, Role, VerificationStatus


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- auth ----------


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(ORMModel):
    id: int
    email: str
    full_name: str
    phone: str | None = None
    role: Role


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- reference data ----------


class TradeOut(ORMModel):
    id: int
    slug: str
    name_en: str
    name_ar: str


class MetaOut(BaseModel):
    cities: list[str]
    job_types: list[str]
    job_statuses: list[str]
    application_statuses: list[str]
    verification_statuses: list[str]


class CompanyOut(ORMModel):
    id: int
    name_en: str
    name_ar: str
    city: str
    description: str = ""


# ---------- jobs ----------


class JobOut(ORMModel):
    id: int
    seller_id: int
    title: str
    description: str
    requirements: str
    city: str
    job_type: JobType
    salary_min: int
    salary_max: int
    status: JobStatus
    is_flagged: bool
    created_at: datetime
    trade: TradeOut
    company: CompanyOut
    applicant_count: int = 0
    has_applied: bool = False


class JobCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = ""
    requirements: str = ""
    trade_id: int
    city: str
    job_type: JobType
    salary_min: int = Field(ge=0)
    salary_max: int = Field(ge=0)


class JobUpdate(BaseModel):
    status: JobStatus | None = None
    is_flagged: bool | None = None


# ---------- workers ----------


class WorkerOut(ORMModel):
    id: int
    user_id: int
    full_name: str
    email: str
    phone: str | None = None
    city: str
    years_experience: int
    expected_salary_sar: int
    availability_date: date
    verification_status: VerificationStatus
    headline: str
    bio: str
    trade: TradeOut


# ---------- public (unauthenticated) ----------


class PublicWorkerOut(ORMModel):
    """Worker profile as an anonymous visitor sees it: no email, no phone, masked name."""

    id: int
    full_name: str  # masked, e.g. "Ahmed A."
    city: str
    years_experience: int
    expected_salary_sar: int
    availability_date: date
    verification_status: VerificationStatus
    headline: str
    bio: str
    trade: TradeOut


class PublicStats(BaseModel):
    workers: int
    verified_workers: int
    open_jobs: int
    contractors: int
    cities: int
    trades: int


class TradeTile(BaseModel):
    id: int
    slug: str
    name_en: str
    name_ar: str
    open_jobs: int
    workers: int


# ---------- applications ----------


class ApplicationCreate(BaseModel):
    job_id: int
    note: str = ""


class ApplicationUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationOut(ORMModel):
    id: int
    status: ApplicationStatus
    note: str
    created_at: datetime
    updated_at: datetime
    job: JobOut | None = None
    worker: WorkerOut | None = None


class VerificationAction(BaseModel):
    action: str  # approve | reject


# ---------- dashboards ----------


class BuyerDashboard(BaseModel):
    profile: WorkerOut | None
    stats: dict[str, int]
    applications: list[ApplicationOut]
    recommended_jobs: list[JobOut]


class SellerJobSummary(BaseModel):
    job: JobOut
    applicant_count: int
    shortlisted_count: int
    hired_count: int


class SellerDashboard(BaseModel):
    company: CompanyOut | None
    stats: dict[str, int]
    jobs: list[SellerJobSummary]
    shortlisted_workers: list[WorkerOut]


class TradeBreakdown(BaseModel):
    trade: str
    trade_ar: str
    jobs: int
    workers: int


class AdminDashboard(BaseModel):
    stats: dict[str, int]
    pending_workers: list[WorkerOut]
    recent_jobs: list[JobOut]
    trade_breakdown: list[TradeBreakdown]
    applications_by_status: dict[str, int]
