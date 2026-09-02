"""Deterministic demo data for ZEO Find Work.

Run with:  python -m app.seed
Drops every row and rebuilds the dataset so the pitch looks identical every time.
"""

from __future__ import annotations

import random
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from alembic import command
from alembic.config import Config

from sqlalchemy import text

from app.db import Base, SessionLocal, engine
from app.models import (
    CITIES,
    Application,
    ApplicationStatus,
    Company,
    Job,
    JobStatus,
    JobType,
    Role,
    Trade,
    User,
    VerificationStatus,
    WorkerProfile,
)
from app.security import hash_password

RNG = random.Random(20260903)
PASSWORD = "zeo1234"
NOW = datetime.now(timezone.utc)

TRADES = [
    ("electrician", "Electrician", "كهربائي"),
    ("plumber", "Plumber", "سباك"),
    ("steel-fixer", "Steel Fixer", "حداد تسليح"),
    ("mason", "Mason", "بنّاء"),
    ("carpenter", "Carpenter", "نجار"),
    ("welder", "Welder", "لحّام"),
    ("heavy-equipment-operator", "Heavy Equipment Operator", "مشغل معدات ثقيلة"),
    ("site-supervisor", "Site Supervisor", "مشرف موقع"),
]

CONTRACTORS = [
    {
        "email": "contractor@zeo.sa",
        "name": "Faisal Al-Harbi",
        "phone": "+966 55 100 2001",
        "company_en": "Al-Harbi Contracting",
        "company_ar": "الحربي للمقاولات",
        "city": "Riyadh",
        "description": "Mid-sized civil contractor delivering residential towers and district cooling works across Riyadh.",
    },
    {
        "email": "nasser@binlathan.sa",
        "name": "Nasser Bin Lathan",
        "phone": "+966 55 100 2002",
        "company_en": "Bin Lathan Construction",
        "company_ar": "بن لاذان للإنشاءات",
        "city": "Jeddah",
        "description": "Coastal infrastructure and hospitality fit-out specialists operating on the Red Sea corridor.",
    },
    {
        "email": "hana@rawasi.sa",
        "name": "Hana Al-Qahtani",
        "phone": "+966 55 100 2003",
        "company_en": "Rawasi Projects",
        "company_ar": "رواسي للمشاريع",
        "city": "Madinah",
        "description": "Heritage-district renovation and mosque expansion works around Madinah.",
    },
    {
        "email": "omar@gulfsteel.sa",
        "name": "Omar Al-Dossary",
        "phone": "+966 55 100 2004",
        "company_en": "Gulf Steel Works",
        "company_ar": "أعمال الخليج للحديد",
        "city": "Dammam",
        "description": "Industrial steel fabrication and plant maintenance for the Eastern Province.",
    },
    {
        "email": "khalid@masarat.sa",
        "name": "Khalid Al-Ghamdi",
        "phone": "+966 55 100 2005",
        "company_en": "Masarat Infrastructure",
        "company_ar": "مسارات للبنية التحتية",
        "city": "Riyadh",
        "description": "Roads, utilities and metro-adjacent civil packages for public sector clients.",
    },
]

WORKERS = [
    ("Ahmed Al-Zahrani", "electrician", "Riyadh", 9, 6800, "verified"),
    ("Muhammad Iqbal", "electrician", "Jeddah", 14, 8200, "verified"),
    ("Saeed Al-Amri", "electrician", "Dammam", 4, 4200, "pending"),
    ("Rashid Karim", "plumber", "Riyadh", 7, 5400, "verified"),
    ("Bilal Hussain", "plumber", "Madinah", 3, 3600, "verified"),
    ("Yousef Al-Otaibi", "plumber", "Jeddah", 11, 7100, "pending"),
    ("Imran Sheikh", "steel-fixer", "Riyadh", 12, 6900, "verified"),
    ("Abdullah Al-Shehri", "steel-fixer", "Dammam", 6, 5100, "verified"),
    ("Tariq Mahmood", "steel-fixer", "Jeddah", 2, 3200, "rejected"),
    ("Salman Al-Malki", "mason", "Madinah", 16, 7600, "verified"),
    ("Waleed Al-Anazi", "mason", "Riyadh", 5, 4400, "verified"),
    ("Noor Alam", "mason", "Dammam", 8, 5200, "pending"),
    ("Hassan Rafiq", "carpenter", "Jeddah", 10, 6300, "verified"),
    ("Majed Al-Subaie", "carpenter", "Riyadh", 3, 3800, "verified"),
    ("Zulfiqar Ali", "welder", "Dammam", 18, 9400, "verified"),
    ("Fahad Al-Mutairi", "welder", "Riyadh", 7, 5900, "pending"),
    ("Kamran Yousaf", "welder", "Jeddah", 1, 2900, "rejected"),
    ("Ibrahim Al-Juhani", "heavy-equipment-operator", "Madinah", 13, 8800, "verified"),
    ("Sultan Al-Rasheed", "heavy-equipment-operator", "Dammam", 6, 6400, "verified"),
    ("Mansour Al-Balawi", "site-supervisor", "Riyadh", 22, 14000, "verified"),
    ("Anwar Chowdhury", "site-supervisor", "Jeddah", 15, 11500, "pending"),
    ("Turki Al-Nasser", "site-supervisor", "Dammam", 9, 9800, "verified"),
]

HEADLINES = {
    "electrician": "Low-current and power distribution electrician",
    "plumber": "HVAC and sanitary pipework plumber",
    "steel-fixer": "Rebar detailing and steel fixing",
    "mason": "Blockwork, plaster and finishing mason",
    "carpenter": "Formwork and joinery carpenter",
    "welder": "Certified MIG/TIG structural welder",
    "heavy-equipment-operator": "Excavator, loader and crawler crane operator",
    "site-supervisor": "Site supervision, QA/QC and safety",
}

BIOS = {
    "electrician": "Experienced on tower and villa projects covering containment, cable pulling, panel termination and testing. Comfortable working to Saudi Building Code and utility inspection requirements.",
    "plumber": "Handles first and second fix sanitary works, chilled water pipework, pressure testing and commissioning support on residential and hospitality projects.",
    "steel-fixer": "Reads bar bending schedules, fixes rebar for rafts, columns and slabs, and coordinates with the survey team ahead of concrete pours.",
    "mason": "Blockwork, rendering, screed and tiling with an eye for finish quality on handover-critical areas.",
    "carpenter": "Builds and strikes formwork for columns, walls and slabs, plus site joinery for doors and built-in units.",
    "welder": "Structural and pipe welding to approved WPS, with experience in fabrication yards and live plant shutdowns.",
    "heavy-equipment-operator": "Operates excavators, wheel loaders and telehandlers on earthworks and infrastructure packages, with a valid Saudi operator licence.",
    "site-supervisor": "Runs day-to-day site delivery: manpower planning, subcontractor coordination, daily reports, QA/QC records and toolbox talks.",
}

JOBS = [
    ("Site Electrician - Residential Towers", "electrician", "Riyadh", 0, JobType.full_time, 5000, 7500,
     "Install and terminate power and lighting circuits across three residential towers in north Riyadh.",
     "Minimum 5 years on high-rise projects. Able to read single-line diagrams. Saudi Building Code familiarity."),
    ("Low Current Technician", "electrician", "Jeddah", 1, JobType.contract, 6000, 8500,
     "Fire alarm, CCTV and data containment installation for a 180-key hotel fit-out on the corniche.",
     "Experience with structured cabling and fire alarm commissioning. Certification preferred."),
    ("Electrician - Plant Maintenance", "electrician", "Dammam", 3, JobType.full_time, 5500, 8000,
     "Preventive and breakdown maintenance on motor control centres inside an operating fabrication plant.",
     "Industrial background required. LOTO awareness and confined-space induction."),
    ("Plumber - Villa Compound", "plumber", "Riyadh", 4, JobType.project, 4500, 6500,
     "Complete first and second fix sanitary works across a 24-villa compound in Al Narjis.",
     "5+ years residential experience. Own hand tools. Pressure testing knowledge."),
    ("HVAC Pipefitter", "plumber", "Jeddah", 1, JobType.contract, 6000, 9000,
     "Chilled water pipework installation and insulation for a mixed-use development.",
     "Welding and brazing on copper and carbon steel. Ability to read isometric drawings."),
    ("Plumber - Mosque Expansion", "plumber", "Madinah", 2, JobType.project, 4200, 6000,
     "Ablution area and drainage works as part of a mosque expansion package.",
     "Attention to finish quality. Experience on public-use buildings."),
    ("Steel Fixer - Raft Foundation", "steel-fixer", "Riyadh", 0, JobType.daily, 250, 400,
     "Rebar fixing for raft and pile caps on a fast-track commercial basement.",
     "Able to read bar bending schedules. Daily rate paid weekly."),
    ("Senior Steel Fixer", "steel-fixer", "Dammam", 3, JobType.full_time, 6000, 8000,
     "Lead a crew of eight fixers across columns, cores and post-tension slabs.",
     "10+ years experience with at least 2 years leading a crew."),
    ("Steel Fixer - Infrastructure", "steel-fixer", "Jeddah", 1, JobType.contract, 5000, 7000,
     "Rebar works for stormwater culverts and retaining structures.",
     "Infrastructure experience preferred. Valid safety induction."),
    ("Mason - Finishing Works", "mason", "Madinah", 2, JobType.project, 4000, 5800,
     "Blockwork, plaster and screed for a heritage-district renovation.",
     "High finish standard required. Experience with lime-based renders is a plus."),
    ("Blockwork Mason", "mason", "Riyadh", 4, JobType.daily, 220, 350,
     "Internal and external blockwork for a school building package.",
     "3+ years experience. Daily rate with transport provided."),
    ("Carpenter - Formwork", "carpenter", "Riyadh", 0, JobType.full_time, 4800, 6800,
     "Erect and strike wall, column and slab formwork on a 22-floor residential tower.",
     "Experience with aluminium and traditional timber systems."),
    ("Joinery Carpenter", "carpenter", "Jeddah", 1, JobType.contract, 5200, 7400,
     "Site joinery for doors, wardrobes and reception millwork in a hotel fit-out.",
     "Fine finish carpentry background. Portfolio of previous fit-out work."),
    ("Structural Welder", "welder", "Dammam", 3, JobType.full_time, 7000, 10500,
     "Structural steel welding in the fabrication yard and on site for an industrial warehouse.",
     "Valid 6G or 3G certification. Ability to weld to approved WPS."),
    ("Pipe Welder - Shutdown", "welder", "Dammam", 3, JobType.contract, 8000, 12000,
     "Pipe welding support during a scheduled plant shutdown. Rotating shifts.",
     "TIG root and fill experience. Shutdown experience essential."),
    ("Excavator Operator", "heavy-equipment-operator", "Madinah", 2, JobType.full_time, 6500, 9000,
     "Bulk earthworks and trenching for a utilities corridor.",
     "Valid Saudi heavy equipment licence. 5+ years operating experience."),
    ("Telehandler Operator", "heavy-equipment-operator", "Riyadh", 4, JobType.daily, 300, 450,
     "Material handling and lifting support across an active infrastructure site.",
     "Valid licence and lifting awareness training."),
    ("Site Supervisor - Civil", "site-supervisor", "Riyadh", 0, JobType.full_time, 11000, 15000,
     "Own daily delivery of the civil package: manpower, subcontractors, QA/QC records and progress reporting.",
     "10+ years site experience, at least 3 as supervisor. English and Arabic reporting."),
    ("QA/QC Site Supervisor", "site-supervisor", "Jeddah", 1, JobType.contract, 10000, 13500,
     "Inspection and test plan execution, snagging and handover documentation for a hospitality project.",
     "Familiarity with ITPs, NCRs and handover dossiers."),
    ("Night Shift Supervisor", "site-supervisor", "Dammam", 3, JobType.full_time, 9500, 12500,
     "Supervise night concrete pours and logistics for an industrial expansion.",
     "Night shift experience and strong safety record."),
]

# job index -> status / flag overrides
CLOSED_JOBS = {8, 13, 17}
FLAGGED_JOBS = {16}


def reset_schema() -> None:
    Base.metadata.drop_all(bind=engine)
    with engine.begin() as conn:
        # Alembic-created enums survive drop_all in some orders; clear them explicitly.
        for enum_name in (
            "role",
            "verification_status",
            "job_type",
            "job_status",
            "application_status",
        ):
            conn.execute(text(f"DROP TYPE IF EXISTS {enum_name} CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS alembic_version"))
    Base.metadata.create_all(bind=engine)
    # Keep Alembic in sync so `alembic upgrade head` stays a no-op after reseeding.
    alembic_ini = Path(__file__).resolve().parents[1] / "alembic.ini"
    if alembic_ini.exists():
        cfg = Config(str(alembic_ini))
        cfg.set_main_option("script_location", str(alembic_ini.parent / "alembic"))
        command.stamp(cfg, "head")


def run() -> None:
    reset_schema()
    db = SessionLocal()
    pw = hash_password(PASSWORD)

    trades = {}
    for slug, name_en, name_ar in TRADES:
        trade = Trade(slug=slug, name_en=name_en, name_ar=name_ar)
        db.add(trade)
        trades[slug] = trade
    db.flush()

    admin = User(
        email="admin@zeo.sa",
        password_hash=pw,
        full_name="Layla Al-Sudairi",
        phone="+966 55 100 1000",
        role=Role.admin,
    )
    db.add(admin)

    sellers: list[User] = []
    companies: list[Company] = []
    for spec in CONTRACTORS:
        seller = User(
            email=spec["email"],
            password_hash=pw,
            full_name=spec["name"],
            phone=spec["phone"],
            role=Role.seller,
        )
        db.add(seller)
        db.flush()
        company = Company(
            owner_id=seller.id,
            name_en=spec["company_en"],
            name_ar=spec["company_ar"],
            city=spec["city"],
            description=spec["description"],
        )
        db.add(company)
        sellers.append(seller)
        companies.append(company)
    db.flush()

    buyers: list[User] = []
    profiles: list[WorkerProfile] = []
    for index, (name, trade_slug, city, years, salary, status) in enumerate(WORKERS):
        handle = name.split()[0].lower()
        email = "worker@zeo.sa" if index == 0 else f"{handle}{index}@zeo.sa"
        buyer = User(
            email=email,
            password_hash=pw,
            full_name=name,
            phone=f"+966 55 200 {3000 + index}",
            role=Role.buyer,
        )
        db.add(buyer)
        db.flush()
        profile = WorkerProfile(
            user_id=buyer.id,
            trade_id=trades[trade_slug].id,
            city=city,
            years_experience=years,
            expected_salary_sar=salary,
            availability_date=date.today() + timedelta(days=RNG.randint(3, 90)),
            verification_status=VerificationStatus(status),
            headline=HEADLINES[trade_slug],
            bio=BIOS[trade_slug],
            created_at=NOW - timedelta(days=RNG.randint(1, 120)),
        )
        db.add(profile)
        buyers.append(buyer)
        profiles.append(profile)
    db.flush()

    jobs: list[Job] = []
    for index, (title, trade_slug, city, seller_idx, job_type, smin, smax, desc, reqs) in enumerate(
        JOBS
    ):
        job = Job(
            seller_id=sellers[seller_idx].id,
            company_id=companies[seller_idx].id,
            title=title,
            description=desc,
            requirements=reqs,
            trade_id=trades[trade_slug].id,
            city=city,
            job_type=job_type,
            salary_min=smin,
            salary_max=smax,
            status=JobStatus.closed if index in CLOSED_JOBS else JobStatus.open,
            is_flagged=index in FLAGGED_JOBS,
            created_at=NOW - timedelta(days=RNG.randint(0, 28), hours=RNG.randint(0, 23)),
        )
        db.add(job)
        jobs.append(job)
    db.flush()

    # Applications: each job draws applicants from the matching trade, same-city first.
    statuses = [
        ApplicationStatus.applied,
        ApplicationStatus.applied,
        ApplicationStatus.applied,
        ApplicationStatus.shortlisted,
        ApplicationStatus.shortlisted,
        ApplicationStatus.hired,
        ApplicationStatus.rejected,
    ]
    created = 0
    for job in jobs:
        candidates = [
            (buyer, profile)
            for buyer, profile in zip(buyers, profiles)
            if profile.trade_id == job.trade_id
        ]
        RNG.shuffle(candidates)
        candidates.sort(key=lambda pair: pair[1].city != job.city)
        take = RNG.randint(1, min(3, len(candidates))) if candidates else 0
        for buyer, _profile in candidates[:take]:
            application = Application(
                job_id=job.id,
                buyer_id=buyer.id,
                status=RNG.choice(statuses),
                note="Available to start immediately and can provide references on request.",
                created_at=job.created_at + timedelta(days=RNG.randint(0, 5)),
            )
            db.add(application)
            created += 1

    db.flush()

    # Guarantee the headline worker account has a demo-ready history: at least one
    # application in each of applied / shortlisted / hired.
    demo_buyer = buyers[0]
    demo_profile = profiles[0]
    demo_jobs = [
        j for j in jobs if j.trade_id == demo_profile.trade_id and j.status == JobStatus.open
    ]
    wanted = [
        ApplicationStatus.shortlisted,
        ApplicationStatus.hired,
        ApplicationStatus.applied,
    ]
    for job, wanted_status in zip(demo_jobs, wanted):
        existing = (
            db.query(Application)
            .filter(Application.job_id == job.id, Application.buyer_id == demo_buyer.id)
            .one_or_none()
        )
        if existing is None:
            db.add(
                Application(
                    job_id=job.id,
                    buyer_id=demo_buyer.id,
                    status=wanted_status,
                    note="Available to start immediately and can provide references on request.",
                    created_at=job.created_at + timedelta(days=1),
                )
            )
            created += 1
        else:
            existing.status = wanted_status

    db.commit()

    counts = {
        "trades": db.query(Trade).count(),
        "users": db.query(User).count(),
        "companies": db.query(Company).count(),
        "worker_profiles": db.query(WorkerProfile).count(),
        "jobs": db.query(Job).count(),
        "applications": db.query(Application).count(),
    }
    db.close()

    print("Seeded ZEO Find Work demo data")
    for key, value in counts.items():
        print(f"  {key:18} {value}")
    print("\nDemo accounts (password: zeo1234)")
    print("  worker      worker@zeo.sa")
    print("  contractor  contractor@zeo.sa")
    print("  admin       admin@zeo.sa")


if __name__ == "__main__":
    run()
