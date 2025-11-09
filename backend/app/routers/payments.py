from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import stripe
import os

from app.database import get_db
from app.models import User, Booking, Course, CourseEnrollment, BookingStatus
from app.schemas import (
    PaymentIntentCreate, PaymentIntentResponse,
    PaymentConfirm, MessageResponse
)
from app.routers.auth import get_current_active_user

router = APIRouter()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_your_stripe_secret_key")


@router.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(
    payment_data: PaymentIntentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe payment intent for booking or course purchase"""
    try:
        amount_cents = 0
        description = ""

        # Determine payment type and calculate amount
        if payment_data.booking_id:
            # Payment for booking
            booking = db.query(Booking).filter(
                Booking.id == payment_data.booking_id,
                Booking.user_id == current_user.id
            ).first()

            if not booking:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Booking not found"
                )

            amount_cents = int(booking.price * 100)  # Convert to cents
            description = f"Booking #{booking.id} - Session with mentor"

        elif payment_data.course_id:
            # Payment for course
            course = db.query(Course).filter(
                Course.id == payment_data.course_id,
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
                CourseEnrollment.course_id == payment_data.course_id
            ).first()

            if existing_enrollment:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Already enrolled in this course"
                )

            amount_cents = int(course.price * 100)
            description = f"Course: {course.title}"

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must provide either booking_id or course_id"
            )

        # Create Stripe payment intent
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            description=description,
            metadata={
                "user_id": current_user.id,
                "booking_id": payment_data.booking_id or "",
                "course_id": payment_data.course_id or ""
            }
        )

        return PaymentIntentResponse(
            client_secret=payment_intent.client_secret,
            payment_intent_id=payment_intent.id,
            amount=amount_cents / 100
        )

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )


@router.post("/confirm-payment", response_model=MessageResponse)
async def confirm_payment(
    payment_confirm: PaymentConfirm,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Confirm payment and update booking/enrollment status"""
    try:
        # Retrieve payment intent from Stripe
        payment_intent = stripe.PaymentIntent.retrieve(payment_confirm.payment_intent_id)

        if payment_intent.status != "succeeded":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment not successful"
            )

        # Update booking or enrollment
        if payment_confirm.booking_id:
            booking = db.query(Booking).filter(
                Booking.id == payment_confirm.booking_id,
                Booking.user_id == current_user.id
            ).first()

            if not booking:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Booking not found"
                )

            booking.payment_id = payment_confirm.payment_intent_id
            booking.status = BookingStatus.CONFIRMED

            # TODO: Send email notification
            # send_booking_confirmation_email(booking, current_user)

        elif payment_confirm.course_id:
            # Create enrollment
            enrollment = CourseEnrollment(
                user_id=current_user.id,
                course_id=payment_confirm.course_id,
                payment_id=payment_confirm.payment_intent_id
            )

            db.add(enrollment)

            # TODO: Send email notification
            # send_course_enrollment_email(enrollment, current_user)

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must provide either booking_id or course_id"
            )

        db.commit()

        return MessageResponse(
            message="Payment confirmed successfully",
            detail=f"Payment ID: {payment_confirm.payment_intent_id}"
        )

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )


@router.post("/razorpay/create-order", response_model=dict)
async def create_razorpay_order(
    payment_data: PaymentIntentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a Razorpay order (alternative to Stripe for Indian market)"""
    # Note: Razorpay implementation would be similar to Stripe
    # This is a placeholder for Razorpay integration
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Razorpay integration coming soon"
    )
