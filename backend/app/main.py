from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import init_db
from app.routers import auth, bookings, courses, community, admin

# Initialize FastAPI app
app = FastAPI(
    title="TaleSoul API",
    description="MVP Backend for TaleSoul - Mentorship & Learning Platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for static file serving
uploads_dir = os.getenv("UPLOAD_DIR", "/app/uploads")
if os.path.exists(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["Bookings"])
app.include_router(courses.router, prefix="/api/v1/courses", tags=["Courses"])
app.include_router(community.router, prefix="/api/v1/community", tags=["Community"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    print("Database initialized successfully!")


@app.get("/")
async def root():
    return {
        "message": "Welcome to TaleSoul API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "ok",
        "service": "talesoul-backend",
        "version": "1.0.0"
    }
