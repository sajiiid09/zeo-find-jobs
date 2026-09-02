# ZEO Find Work — Demo MVP

A construction recruitment marketplace for the Saudi market, built as a clickable demo for a
client pitch. Three roles — **worker** (buyer), **contractor** (seller) and **admin** — each with
their own dashboard, sharing one marketplace of jobs and worker profiles.

> This is a demo, not production software. Auth is a JWT in `localStorage`, all data is seeded,
> and there are no tests.

---

## Stack

| Layer | Choice |
|---|---|
| API | FastAPI, sync SQLAlchemy 2.0, Alembic, PostgreSQL 16 |
| Web | Next.js 16 (App Router, JavaScript), Tailwind CSS 4, lucide-react |
| Auth | JWT issued by the API, stored in `localStorage`, client-side route guards |
| Database | PostgreSQL in Docker Compose (db service only) |
| i18n | English / Arabic with full RTL mirroring |

---

## Prerequisites

- Docker Desktop (for PostgreSQL)
- Python 3.11+
- Node.js 20+

---

## Setup

### 1. Database

```bash
docker compose up -d db
```

Postgres listens on **localhost:5433** (5432 is left free for any local Postgres you already run).

### 2. API

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

alembic upgrade head     # create the schema
python -m app.seed       # wipe and load the demo dataset

uvicorn app.main:app --reload --port 8000
```

Interactive API docs: <http://localhost:8000/docs>

### 3. Web

```bash
cd web
npm install
cp .env.local.example .env.local
npm run dev
```

Open <http://localhost:3000> — it redirects to the login screen.

---

## Demo accounts

Password for every account is **`zeo1234`**. The login screen has one-click buttons for all three.

| Role | Email | Sees |
|---|---|---|
| Worker | `worker@zeo.sa` | Own profile, applications, recommended jobs, job search |
| Contractor | `contractor@zeo.sa` | Own job posts, applicants, worker directory, post a job |
| Admin | `admin@zeo.sa` | Platform stats, verification queue, job moderation |

The other 21 workers and 4 contractors use predictable addresses (`rashid3@zeo.sa`,
`nasser@binlathan.sa`, …) — the seed script prints the headline three on every run.

---

## Seeded data

`python -m app.seed` drops every table, recreates the schema, stamps Alembic at head and loads a
deterministic dataset:

- 8 trades (Electrician, Plumber, Steel Fixer, Mason, Carpenter, Welder, Heavy Equipment Operator,
  Site Supervisor), each with an Arabic name
- 5 contractors with company profiles
- 22 worker profiles — 15 verified, 5 pending (this feeds the admin queue), 2 rejected
- 20 jobs across 4 cities (Riyadh, Jeddah, Madinah, Dammam), 17 open / 3 closed, 1 flagged
- ~41 applications spread across applied / shortlisted / hired / rejected

Re-run it any time to reset the demo to a clean state.

---

## Three-minute demo script

1. **Login** → click **Worker** → **Sign in**. Buyer dashboard: profile with verification badge,
   application history, jobs recommended from their trade and city.
2. **Find jobs** → filter by trade + city + job type → open a job → write a note → **Apply now**.
   The applicant count increments and the application appears under **My applications**.
3. Toggle **العربية** in the top bar. The whole shell mirrors to RTL and stays Arabic as you
   navigate. Toggle back.
4. **Sign out** → click **Contractor** → **Sign in**. Contractor desk: job posts with applicant,
   shortlist and hire counts, plus a shortlist of workers.
5. Open a job post → **Shortlist** then **Hire** an applicant. The badge flips immediately.
6. **Post a job** → fill the form → **Publish**. You land on the new post's applicant page, and the
   job is live in the marketplace.
7. **Sign out** → click **Administrator** → **Sign in**. Platform overview: user/job/application
   counts, applications by status, jobs and workers by trade.
8. **Approve** a pending worker from the queue — the pending count drops and their badge turns
   verified across the marketplace.
9. **Job moderation** → **Close** or **Flag** any post.

---

## Roles and permissions

| Capability | Worker | Contractor | Admin |
|---|:--:|:--:|:--:|
| Browse jobs | ✅ | ✅ | ✅ |
| Apply to a job | ✅ | — | — |
| Browse worker directory | — | ✅ | ✅ |
| Post / close own jobs | — | ✅ | ✅ (any job) |
| Move applicants through statuses | — | ✅ (own jobs) | ✅ |
| Approve / reject verifications | — | — | ✅ |
| Flag jobs | — | — | ✅ |

Role checks live in `api/app/deps.py` (`require_role`); ownership checks are inline in each router.

---

## Project layout

```
docker-compose.yml     postgres:16 on port 5433
public/                brand logo + design references

api/
  app/
    main.py            FastAPI app, CORS, router mounts
    config.py          settings from .env
    db.py              engine, session, declarative base
    models.py          6 tables
    schemas.py         Pydantic v2 request/response models
    security.py        bcrypt hashing, JWT encode/decode
    deps.py            get_current_user, require_role
    serializers.py     shared row -> schema helpers
    routers/           auth, meta, jobs, workers, applications, dashboard, admin
    seed.py            deterministic demo dataset
  alembic/             one initial migration

web/src/
  app/                 routes: /login, /dashboard, /jobs, /workers, /applications,
                       /my-jobs, /post-job, /admin/*
  components/          ui primitives, layout shell, job/worker/dashboard pieces
  lib/                 api client, auth context, useAsync, formatters
  i18n/                en + ar dictionaries, locale context
```

---

## Data model

- **users** — email, password hash, name, phone, role (`admin` / `buyer` / `seller`)
- **trades** — slug plus English and Arabic names
- **companies** — one per contractor
- **worker_profiles** — trade, city, experience, expected salary, availability,
  verification status (`pending` / `verified` / `rejected`), headline, bio
- **jobs** — title, description, requirements, trade, city, job type, salary range,
  status (`open` / `closed`), flag
- **applications** — job + worker, status (`applied` / `shortlisted` / `hired` / `rejected`),
  note; unique per (job, worker)

---

## Known demo limitations

- The JWT lives in `localStorage`, so every page is a client component — no SSR of protected
  routes and a brief loading state on first paint.
- Workers cannot edit their own profile; the verification queue is fed by seeded pending rows.
- No registration, file uploads, messaging, or search ranking.
- Arabic is a stub: all UI chrome, trades and cities are translated, but seeded job titles and
  descriptions stay in English.
