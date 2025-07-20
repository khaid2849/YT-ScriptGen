import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import settings
from .database import engine, Base
from .api.endpoints import transcription, scripts, contact, download

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set up CORS - Allow all origins for public access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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