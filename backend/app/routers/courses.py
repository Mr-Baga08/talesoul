from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os

from app.database import get_db
from app.models import User, Course, CourseEnrollment, MentorProfile, UserRole
from app.schemas import (
    CourseCreate, CourseUpdate, CourseResponse,
    CourseEnrollmentCreate, CourseEnrollmentResponse,
    MessageResponse
)
from app.routers.auth import get_current_active_user

router = APIRouter()


# ===== Course Management Routes =====
@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new course (mentors only)"""
    # Check if user is a mentor
    if current_user.role not in [UserRole.MENTOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentors can create courses"
        )

    # Create course
    course = Course(
        instructor_id=current_user.id,
        title=course_data.title,
        description=course_data.description,
        price=course_data.price,
        duration_minutes=course_data.duration_minutes,
        is_published=False  # Default to unpublished
    )

    db.add(course)
    db.commit()
    db.refresh(course)

    return course


@router.get("/", response_model=List[CourseResponse])
async def list_courses(
    skip: int = 0,
    limit: int = 100,
    published_only: bool = True,
    db: Session = Depends(get_db)
):
    """List all published courses"""
    query = db.query(Course)

    if published_only:
        query = query.filter(Course.is_published == True)

    courses = query.offset(skip).limit(limit).all()
    return courses


@router.get("/my-courses", response_model=List[CourseResponse])
async def get_my_courses(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get courses created by current user (instructor)"""
    courses = db.query(Course).filter(
        Course.instructor_id == current_user.id
    ).all()

    return courses


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get specific course by ID"""
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Only show unpublished courses to their creators
    if not course.is_published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    return course


@router.patch("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: int,
    course_update: CourseUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a course (instructor only)"""
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Verify ownership
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this course"
        )

    # Update fields
    if course_update.title is not None:
        course.title = course_update.title
    if course_update.description is not None:
        course.description = course_update.description
    if course_update.price is not None:
        course.price = course_update.price
    if course_update.duration_minutes is not None:
        course.duration_minutes = course_update.duration_minutes
    if course_update.is_published is not None:
        course.is_published = course_update.is_published

    db.commit()
    db.refresh(course)

    return course


@router.delete("/{course_id}", response_model=MessageResponse)
async def delete_course(
    course_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a course (instructor only)"""
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Verify ownership
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this course"
        )

    db.delete(course)
    db.commit()

    return MessageResponse(message="Course deleted successfully")


# ===== Video Upload Routes =====
@router.post("/{course_id}/upload-video", response_model=MessageResponse)
async def upload_course_video(
    course_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload video for a course (instructor only)"""
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Verify ownership
    if course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to upload video for this course"
        )

    # Validate file type
    allowed_types = ["video/mp4", "video/mpeg", "video/quicktime"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only MP4, MPEG, and MOV video files are allowed"
        )

    # Save file
    upload_dir = os.getenv("UPLOAD_DIR", "/app/uploads")
    os.makedirs(f"{upload_dir}/courses", exist_ok=True)

    file_extension = file.filename.split(".")[-1]
    filename = f"course_{course_id}.{file_extension}"
    file_path = f"{upload_dir}/courses/{filename}"

    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # Update course video URL
    course.video_url = f"/uploads/courses/{filename}"
    db.commit()

    return MessageResponse(
        message="Video uploaded successfully",
        detail=course.video_url
    )


@router.post("/{course_id}/upload-thumbnail", response_model=MessageResponse)
async def upload_course_thumbnail(
    course_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload thumbnail for a course (instructor only)"""
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Verify ownership
    if course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to upload thumbnail for this course"
        )

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG and PNG images are allowed"
        )

    # Save file
    upload_dir = os.getenv("UPLOAD_DIR", "/app/uploads")
    os.makedirs(f"{upload_dir}/thumbnails", exist_ok=True)

    file_extension = file.filename.split(".")[-1]
    filename = f"course_{course_id}_thumb.{file_extension}"
    file_path = f"{upload_dir}/thumbnails/{filename}"

    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # Update course thumbnail URL
    course.thumbnail_url = f"/uploads/thumbnails/{filename}"
    db.commit()

    return MessageResponse(
        message="Thumbnail uploaded successfully",
        detail=course.thumbnail_url
    )


# ===== Enrollment Routes =====
@router.post("/enroll", response_model=CourseEnrollmentResponse, status_code=status.HTTP_201_CREATED)
async def enroll_in_course(
    enrollment_data: CourseEnrollmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Enroll in a course"""
    # Check if course exists
    course = db.query(Course).filter(
        Course.id == enrollment_data.course_id,
        Course.is_published == True
    ).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check if already enrolled
    existing_enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id,
        CourseEnrollment.course_id == enrollment_data.course_id
    ).first()

    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course"
        )

    # Create enrollment
    enrollment = CourseEnrollment(
        user_id=current_user.id,
        course_id=enrollment_data.course_id,
        payment_id=enrollment_data.payment_id
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return enrollment


@router.get("/my-enrollments", response_model=List[CourseEnrollmentResponse])
async def get_my_enrollments(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's course enrollments"""
    enrollments = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id
    ).all()

    return enrollments


@router.patch("/enrollments/{enrollment_id}/progress", response_model=CourseEnrollmentResponse)
async def update_course_progress(
    enrollment_id: int,
    progress_percentage: float,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update course progress"""
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.id == enrollment_id,
        CourseEnrollment.user_id == current_user.id
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )

    # Update progress
    enrollment.progress_percentage = min(100.0, max(0.0, progress_percentage))
    if enrollment.progress_percentage >= 100.0:
        enrollment.completed = True

    db.commit()
    db.refresh(enrollment)

    return enrollment
