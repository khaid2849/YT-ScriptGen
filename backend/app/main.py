import os
import time

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import settings
from .database import engine, Base
from .api.endpoints import transcription, scripts, contact, download
from .middleware.security import RateLimitMiddleware, SecurityHeadersMiddleware
from .core.logger import logger, log_request

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.DEBUG else None,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Add security middleware
app.add_middleware(SecurityHeadersMiddleware)

# Add rate limiting in production
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        RateLimitMiddleware,
        per_minute=settings.RATE_LIMIT_PER_MINUTE,
        per_hour=settings.RATE_LIMIT_PER_HOUR
    )

# Set up CORS - Use configured origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # Get client IP
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")

    response = await call_next(request)

    process_time = time.time() - start_time
    log_request(request.method, request.url.path, client_ip, process_time)

    return response

# Mount static files
if os.path.exists(settings.GENERATED_SCRIPTS_PATH):
    app.mount(
        "/scripts",
        StaticFiles(directory=settings.GENERATED_SCRIPTS_PATH),
        name="scripts",
    )

# Include routers
app.include_router(
    transcription.router,
    prefix=f"{settings.API_V1_STR}/transcribe",
    tags=["transcription"],
)

app.include_router(
    scripts.router, 
    prefix=f"{settings.API_V1_STR}/scripts", 
    tags=["scripts"]
)

app.include_router(
    contact.router, 
    prefix=f"{settings.API_V1_STR}/contact", 
    tags=["contact"]
)

app.include_router(
    download.router,
    prefix=f"{settings.API_V1_STR}/download",
    tags=["download"]
)

@app.get("/")
def root():
    return {
        "message": "YouTube Script Generator API - Free & Open",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}