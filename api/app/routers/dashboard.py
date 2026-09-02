from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.deps import require_role
from app.models import (
    Application,
    ApplicationStatus,
    Company,
    Job,
    JobStatus,
    Role,
    Trade,
    User,
    VerificationStatus,
    WorkerProfile,
)
from app.schemas import (
    AdminDashboard,
    BuyerDashboard,
    CompanyOut,
    SellerDashboard,
    SellerJobSummary,
    TradeBreakdown,
    ApplicationOut,
)
from app.serializers import applicant_counts, job_out, jobs_out, worker_out

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

JOB_LOADERS = (selectinload(Job.trade), selectinload(Job.company))
PROFILE_LOADERS = (selectinload(WorkerProfile.user), selectinload(WorkerProfile.trade))


@router.get("/buyer", response_model=BuyerDashboard)
def buyer_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.buyer)),
) -> BuyerDashboard:
    profile = db.scalar(
        select(WorkerProfile).options(*PROFILE_LOADERS).where(WorkerProfile.user_id == user.id)
    )
    applications = list(
        db.scalars(
            select(Application)
            .options(selectinload(Application.job).options(*JOB_LOADERS))
            .where(Application.buyer_id == user.id)
            .order_by(Application.created_at.desc())
        ).all()
    )
    applied_ids = {a.job_id for a in applications}

    stmt = select(Job).options(*JOB_LOADERS).where(Job.status == JobStatus.open)
    if applied_ids:
        stmt = stmt.where(Job.id.notin_(applied_ids))
    if profile:
        matches = list(
            db.scalars(
                stmt.where(Job.trade_id == profile.trade_id)
                .order_by((Job.city == profile.city).desc(), Job.created_at.desc())
                .limit(6)
            ).all()
        )
    else:
        matches = []
    if len(matches) < 4:
        found = {j.id for j in matches}
        filler = db.scalars(stmt.order_by(Job.created_at.desc()).limit(8)).all()
        for job in filler:
            if job.id not in found:
                matches.append(job)
                found.add(job.id)
            if len(matches) >= 6:
                break

    stats = {
        "applications": len(applications),
        "shortlisted": sum(1 for a in applications if a.status == ApplicationStatus.shortlisted),
        "hired": sum(1 for a in applications if a.status == ApplicationStatus.hired),
        "open_jobs": db.scalar(
            select(func.count(Job.id)).where(Job.status == JobStatus.open)
        )
        or 0,
    }
    return BuyerDashboard(
        profile=worker_out(profile) if profile else None,
        stats=stats,
        applications=[
            ApplicationOut(
                id=a.id,
                status=a.status,
                note=a.note,
                created_at=a.created_at,
                updated_at=a.updated_at,
                job=job_out(a.job),
                worker=None,
            )
            for a in applications
        ],
        recommended_jobs=[job_out(j) for j in matches[:6]],
    )


@router.get("/seller", response_model=SellerDashboard)
def seller_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.seller)),
) -> SellerDashboard:
    company = db.scalar(select(Company).where(Company.owner_id == user.id))
    jobs = list(
        db.scalars(
            select(Job)
            .options(*JOB_LOADERS)
            .where(Job.seller_id == user.id)
            .order_by(Job.created_at.desc())
        ).all()
    )
    job_ids = [j.id for j in jobs]
    counts = applicant_counts(db, job_ids)

    per_status: dict[tuple[int, ApplicationStatus], int] = {}
    if job_ids:
        rows = db.execute(
            select(Application.job_id, Application.status, func.count(Application.id))
            .where(Application.job_id.in_(job_ids))
            .group_by(Application.job_id, Application.status)
        ).all()
        per_status = {(jid, st): c for jid, st, c in rows}

    summaries = [
        SellerJobSummary(
            job=job_out(j, applicant_count=counts.get(j.id, 0)),
            applicant_count=counts.get(j.id, 0),
            shortlisted_count=per_status.get((j.id, ApplicationStatus.shortlisted), 0),
            hired_count=per_status.get((j.id, ApplicationStatus.hired), 0),
        )
        for j in jobs
    ]

    shortlisted_profiles: list[WorkerProfile] = []
    if job_ids:
        shortlisted_profiles = list(
            db.scalars(
                select(WorkerProfile)
                .options(*PROFILE_LOADERS)
                .join(User, User.id == WorkerProfile.user_id)
                .join(Application, Application.buyer_id == User.id)
                .where(
                    Application.job_id.in_(job_ids),
                    Application.status.in_(
                        [ApplicationStatus.shortlisted, ApplicationStatus.hired]
                    ),
                )
                .distinct()
                .limit(6)
            ).all()
        )

    stats = {
        "jobs": len(jobs),
        "open_jobs": sum(1 for j in jobs if j.status == JobStatus.open),
        "applicants": sum(counts.values()),
        "shortlisted": sum(v for (_, st), v in per_status.items() if st == ApplicationStatus.shortlisted),
        "hired": sum(v for (_, st), v in per_status.items() if st == ApplicationStatus.hired),
    }
    return SellerDashboard(
        company=CompanyOut.model_validate(company) if company else None,
        stats=stats,
        jobs=summaries,
        shortlisted_workers=[worker_out(p) for p in shortlisted_profiles],
    )


@router.get("/admin", response_model=AdminDashboard)
def admin_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.admin)),
) -> AdminDashboard:
    def count(stmt) -> int:
        return db.scalar(stmt) or 0

    stats = {
        "users": count(select(func.count(User.id))),
        "workers": count(select(func.count(User.id)).where(User.role == Role.buyer)),
        "contractors": count(select(func.count(User.id)).where(User.role == Role.seller)),
        "jobs": count(select(func.count(Job.id))),
        "open_jobs": count(select(func.count(Job.id)).where(Job.status == JobStatus.open)),
        "flagged_jobs": count(select(func.count(Job.id)).where(Job.is_flagged.is_(True))),
        "applications": count(select(func.count(Application.id))),
        "pending_verifications": count(
            select(func.count(WorkerProfile.id)).where(
                WorkerProfile.verification_status == VerificationStatus.pending
            )
        ),
    }

    pending = list(
        db.scalars(
            select(WorkerProfile)
            .options(*PROFILE_LOADERS)
            .where(WorkerProfile.verification_status == VerificationStatus.pending)
            .order_by(WorkerProfile.created_at)
        ).all()
    )
    recent_jobs = list(
        db.scalars(
            select(Job).options(*JOB_LOADERS).order_by(Job.created_at.desc(), Job.id.desc()).limit(6)
        ).all()
    )

    job_rows = dict(
        db.execute(select(Job.trade_id, func.count(Job.id)).group_by(Job.trade_id)).all()
    )
    worker_rows = dict(
        db.execute(
            select(WorkerProfile.trade_id, func.count(WorkerProfile.id)).group_by(
                WorkerProfile.trade_id
            )
        ).all()
    )
    trades = list(db.scalars(select(Trade).order_by(Trade.name_en)).all())
    breakdown = [
        TradeBreakdown(
            trade=t.name_en,
            trade_ar=t.name_ar,
            jobs=job_rows.get(t.id, 0),
            workers=worker_rows.get(t.id, 0),
        )
        for t in trades
    ]

    by_status = {
        st.value: count(select(func.count(Application.id)).where(Application.status == st))
        for st in ApplicationStatus
    }

    return AdminDashboard(
        stats=stats,
        pending_workers=[worker_out(p) for p in pending],
        recent_jobs=jobs_out(db, recent_jobs),
        trade_breakdown=breakdown,
        applications_by_status=by_status,
    )
