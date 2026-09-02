from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import admin, applications, auth, dashboard, jobs, meta, workers

app = FastAPI(
    title="ZEO Find Work API",
    description="Demo API for the ZEO Find Work construction recruitment marketplace.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (auth.router, meta.router, jobs.router, workers.router, applications.router, dashboard.router, admin.router):
    app.include_router(router)


@app.get("/api/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}
