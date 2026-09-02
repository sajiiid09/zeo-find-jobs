from __future__ import annotations

import enum
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Role(str, enum.Enum):
    admin = "admin"
    buyer = "buyer"
    seller = "seller"


class VerificationStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"


class JobType(str, enum.Enum):
    full_time = "full_time"
    contract = "contract"
    daily = "daily"
    project = "project"


class JobStatus(str, enum.Enum):
    open = "open"
    closed = "closed"


class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    shortlisted = "shortlisted"
    hired = "hired"
    rejected = "rejected"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    role: Mapped[Role] = mapped_column(Enum(Role, name="role"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    profile: Mapped[WorkerProfile | None] = relationship(back_populates="user", uselist=False)
    company: Mapped[Company | None] = relationship(back_populates="owner", uselist=False)
    jobs: Mapped[list[Job]] = relationship(back_populates="seller")
    applications: Mapped[list[Application]] = relationship(back_populates="buyer")


class Trade(Base):
    __tablename__ = "trades"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    name_en: Mapped[str] = mapped_column(String(120))
    name_ar: Mapped[str] = mapped_column(String(120))

    profiles: Mapped[list[WorkerProfile]] = relationship(back_populates="trade")
    jobs: Mapped[list[Job]] = relationship(back_populates="trade")


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    name_en: Mapped[str] = mapped_column(String(160))
    name_ar: Mapped[str] = mapped_column(String(160))
    city: Mapped[str] = mapped_column(String(60), index=True)
    description: Mapped[str] = mapped_column(Text, default="")

    owner: Mapped[User] = relationship(back_populates="company")
    jobs: Mapped[list[Job]] = relationship(back_populates="company")


class WorkerProfile(Base):
    __tablename__ = "worker_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    trade_id: Mapped[int] = mapped_column(ForeignKey("trades.id"), index=True)
    city: Mapped[str] = mapped_column(String(60), index=True)
    years_experience: Mapped[int] = mapped_column(Integer, default=0)
    expected_salary_sar: Mapped[int] = mapped_column(Integer, default=0)
    availability_date: Mapped[date] = mapped_column(Date)
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus, name="verification_status"),
        default=VerificationStatus.pending,
        index=True,
    )
    headline: Mapped[str] = mapped_column(String(200), default="")
    bio: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="profile")
    trade: Mapped[Trade] = relationship(back_populates="profiles")


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    requirements: Mapped[str] = mapped_column(Text, default="")
    trade_id: Mapped[int] = mapped_column(ForeignKey("trades.id"), index=True)
    city: Mapped[str] = mapped_column(String(60), index=True)
    job_type: Mapped[JobType] = mapped_column(Enum(JobType, name="job_type"), index=True)
    salary_min: Mapped[int] = mapped_column(Integer, default=0)
    salary_max: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[JobStatus] = mapped_column(
        Enum(JobStatus, name="job_status"), default=JobStatus.open, index=True
    )
    is_flagged: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    seller: Mapped[User] = relationship(back_populates="jobs")
    company: Mapped[Company] = relationship(back_populates="jobs")
    trade: Mapped[Trade] = relationship(back_populates="jobs")
    applications: Mapped[list[Application]] = relationship(
        back_populates="job", cascade="all, delete-orphan"
    )


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (UniqueConstraint("job_id", "buyer_id", name="uq_application_job_buyer"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), index=True)
    buyer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="application_status"),
        default=ApplicationStatus.applied,
        index=True,
    )
    note: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    job: Mapped[Job] = relationship(back_populates="applications")
    buyer: Mapped[User] = relationship(back_populates="applications")


CITIES = ["Riyadh", "Jeddah", "Madinah", "Dammam"]
