from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import (
    User, MentorProfile, MentorAvailability, Booking,
    BookingStatus, MentorStatus, UserRole
)
from app.schemas import (
    BookingCreate, BookingResponse, BookingUpdate,
    AvailabilitySlotCreate, AvailabilitySlotResponse,
    MentorProfileResponse, MessageResponse
)
from app.routers.auth import get_current_active_user

router = APIRouter()


# ===== Mentor Routes =====
@router.get("/mentors", response_model=List[MentorProfileResponse])
async def list_approved_mentors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get list of approved mentors"""
    mentors = db.query(MentorProfile).filter(
        MentorProfile.status == MentorStatus.APPROVED
    ).offset(skip).limit(limit).all()

    return mentors


@router.get("/mentors/{mentor_id}", response_model=MentorProfileResponse)
async def get_mentor_profile(mentor_id: int, db: Session = Depends(get_db)):
    """Get specific mentor profile by ID"""
    mentor = db.query(MentorProfile).filter(
        MentorProfile.id == mentor_id,
        MentorProfile.status == MentorStatus.APPROVED
    ).first()

    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found or not approved"
        )

    return mentor


# ===== Availability Routes =====
@router.post("/availability", response_model=AvailabilitySlotResponse, status_code=status.HTTP_201_CREATED)
async def create_availability_slot(
    slot_data: AvailabilitySlotCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create availability slot (mentors only)"""
    # Check if user is a mentor
    mentor_profile = db.query(MentorProfile).filter(
        MentorProfile.user_id == current_user.id,
        MentorProfile.status == MentorStatus.APPROVED
    ).first()

    if not mentor_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only approved mentors can set availability"
        )

    # Create availability slot
    availability = MentorAvailability(
        mentor_id=mentor_profile.id,
        day_of_week=slot_data.day_of_week,
        start_time=slot_data.start_time,
        end_time=slot_data.end_time
    )

    db.add(availability)
    db.commit()
    db.refresh(availability)

    return availability


@router.get("/availability/{mentor_id}", response_model=List[AvailabilitySlotResponse])
async def get_mentor_availability(mentor_id: int, db: Session = Depends(get_db)):
    """Get mentor's availability slots"""
    mentor = db.query(MentorProfile).filter(MentorProfile.id == mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )

    availability = db.query(MentorAvailability).filter(
        MentorAvailability.mentor_id == mentor_id,
        MentorAvailability.is_available == True
    ).all()

    return availability


@router.delete("/availability/{slot_id}", response_model=MessageResponse)
async def delete_availability_slot(
    slot_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an availability slot (mentors only)"""
    # Get mentor profile
    mentor_profile = db.query(MentorProfile).filter(
        MentorProfile.user_id == current_user.id
    ).first()

    if not mentor_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentors can delete availability slots"
        )

    # Get and verify slot ownership
    slot = db.query(MentorAvailability).filter(
        MentorAvailability.id == slot_id,
        MentorAvailability.mentor_id == mentor_profile.id
    ).first()

    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability slot not found"
        )

    db.delete(slot)
    db.commit()

    return MessageResponse(message="Availability slot deleted successfully")


# ===== Booking Routes =====
@router.post("/book", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new booking with a mentor"""
    # Get mentor user
    mentor_user = db.query(User).filter(User.id == booking_data.mentor_id).first()
    if not mentor_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )

    # Get mentor profile
    mentor_profile = db.query(MentorProfile).filter(
        MentorProfile.user_id == mentor_user.id,
        MentorProfile.status == MentorStatus.APPROVED
    ).first()

    if not mentor_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This mentor is not approved yet"
        )

    # Calculate price
    price = mentor_profile.hourly_rate * (booking_data.duration_minutes / 60)

    # Create booking
    booking = Booking(
        user_id=current_user.id,
        mentor_id=mentor_user.id,
        scheduled_at=booking_data.scheduled_at,
        duration_minutes=booking_data.duration_minutes,
        notes=booking_data.notes,
        price=price,
        status=BookingStatus.PENDING
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking


@router.get("/my-bookings", response_model=List[BookingResponse])
async def get_my_bookings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's bookings (as a user)"""
    bookings = db.query(Booking).filter(
        Booking.user_id == current_user.id
    ).order_by(Booking.scheduled_at.desc()).all()

    return bookings


@router.get("/mentor-bookings", response_model=List[BookingResponse])
async def get_mentor_bookings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get bookings for current mentor"""
    # Verify user is a mentor
    mentor_profile = db.query(MentorProfile).filter(
        MentorProfile.user_id == current_user.id
    ).first()

    if not mentor_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentors can access this endpoint"
        )

    bookings = db.query(Booking).filter(
        Booking.mentor_id == current_user.id
    ).order_by(Booking.scheduled_at.desc()).all()

    return bookings


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific booking details"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Verify user has access to this booking
    if booking.user_id != current_user.id and booking.mentor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this booking"
        )

    return booking


@router.patch("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: int,
    booking_update: BookingUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update booking (for mentors to add meeting link or change status)"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Only mentor can update booking
    if booking.mentor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the mentor can update this booking"
        )

    # Update fields
    if booking_update.status:
        booking.status = booking_update.status
    if booking_update.meeting_link:
        booking.meeting_link = booking_update.meeting_link
    if booking_update.notes:
        booking.notes = booking_update.notes

    db.commit()
    db.refresh(booking)

    return booking


@router.delete("/{booking_id}", response_model=MessageResponse)
async def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancel a booking"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Only user or mentor can cancel
    if booking.user_id != current_user.id and booking.mentor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to cancel this booking"
        )

    booking.status = BookingStatus.CANCELLED
    db.commit()

    return MessageResponse(message="Booking cancelled successfully")
