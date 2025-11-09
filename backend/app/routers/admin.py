from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, MentorProfile, MentorStatus, UserRole, Booking, Course
from app.schemas import (
    MentorProfileResponse, MentorApproval, MessageResponse,
    UserResponse, BookingResponse, CourseResponse
)
from app.routers.auth import get_current_active_user

router = APIRouter()


# ===== Admin Authorization =====
async def get_admin_user(current_user: User = Depends(get_current_active_user)):
    """Verify that current user is an admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# ===== Mentor Approval Routes =====
@router.get("/pending-mentors", response_model=List[MentorProfileResponse])
async def list_pending_mentors(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get list of mentors pending approval (admin only)"""
    pending_mentors = db.query(MentorProfile).filter(
        MentorProfile.status == MentorStatus.PENDING
    ).offset(skip).limit(limit).all()

    return pending_mentors


@router.post("/approve-mentor", response_model=MentorProfileResponse)
async def approve_or_reject_mentor(
    approval_data: MentorApproval,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Approve or reject a mentor application (admin only)"""
    mentor_profile = db.query(MentorProfile).filter(
        MentorProfile.id == approval_data.mentor_id
    ).first()

    if not mentor_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor profile not found"
        )

    # Update mentor status
    if approval_data.approved:
        mentor_profile.status = MentorStatus.APPROVED
    else:
        mentor_profile.status = MentorStatus.REJECTED

    db.commit()
    db.refresh(mentor_profile)

    return mentor_profile


@router.get("/mentors", response_model=List[MentorProfileResponse])
async def list_all_mentors(
    skip: int = 0,
    limit: int = 100,
    status_filter: MentorStatus = None,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get list of all mentors with optional status filter (admin only)"""
    query = db.query(MentorProfile)

    if status_filter:
        query = query.filter(MentorProfile.status == status_filter)

    mentors = query.offset(skip).limit(limit).all()
    return mentors


# ===== User Management Routes =====
@router.get("/users", response_model=List[UserResponse])
async def list_all_users(
    skip: int = 0,
    limit: int = 100,
    role_filter: UserRole = None,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get list of all users (admin only)"""
    query = db.query(User)

    if role_filter:
        query = query.filter(User.role == role_filter)

    users = query.offset(skip).limit(limit).all()
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get specific user by ID (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


@router.patch("/users/{user_id}/deactivate", response_model=MessageResponse)
async def deactivate_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Deactivate a user account (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.is_active = False
    db.commit()

    return MessageResponse(message="User deactivated successfully")


@router.patch("/users/{user_id}/activate", response_model=MessageResponse)
async def activate_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Activate a user account (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.is_active = True
    db.commit()

    return MessageResponse(message="User activated successfully")


@router.patch("/users/{user_id}/role", response_model=UserResponse)
async def change_user_role(
    user_id: int,
    new_role: UserRole,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Change a user's role (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.role = new_role
    db.commit()
    db.refresh(user)

    return user


# ===== Statistics Routes =====
@router.get("/stats")
async def get_platform_statistics(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get platform statistics (admin only)"""
    total_users = db.query(User).count()
    total_mentors = db.query(MentorProfile).filter(
        MentorProfile.status == MentorStatus.APPROVED
    ).count()
    pending_mentors = db.query(MentorProfile).filter(
        MentorProfile.status == MentorStatus.PENDING
    ).count()
    total_bookings = db.query(Booking).count()
    total_courses = db.query(Course).count()
    published_courses = db.query(Course).filter(Course.is_published == True).count()

    return {
        "total_users": total_users,
        "total_mentors": total_mentors,
        "pending_mentor_applications": pending_mentors,
        "total_bookings": total_bookings,
        "total_courses": total_courses,
        "published_courses": published_courses
    }


# ===== Content Management Routes =====
@router.get("/bookings", response_model=List[BookingResponse])
async def list_all_bookings(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get list of all bookings (admin only)"""
    bookings = db.query(Booking).order_by(
        Booking.created_at.desc()
    ).offset(skip).limit(limit).all()

    return bookings


@router.get("/courses", response_model=List[CourseResponse])
async def list_all_courses(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get list of all courses (admin only)"""
    courses = db.query(Course).offset(skip).limit(limit).all()
    return courses


@router.delete("/courses/{course_id}", response_model=MessageResponse)
async def delete_course_admin(
    course_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete any course (admin only)"""
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    db.delete(course)
    db.commit()

    return MessageResponse(message="Course deleted successfully")
