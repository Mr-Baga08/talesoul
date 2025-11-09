from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, MentorStatus, BookingStatus


# ===== User Schemas =====
class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    profile_picture: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[UserRole] = None


# ===== Mentor Schemas =====
class MentorProfileCreate(BaseModel):
    bio: str
    expertise: str
    years_of_experience: int
    hourly_rate: float
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None


class MentorProfileUpdate(BaseModel):
    bio: Optional[str] = None
    expertise: Optional[str] = None
    years_of_experience: Optional[int] = None
    hourly_rate: Optional[float] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None


class MentorProfileResponse(BaseModel):
    id: int
    user_id: int
    bio: Optional[str]
    expertise: Optional[str]
    years_of_experience: Optional[int]
    hourly_rate: Optional[float]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    status: MentorStatus
    created_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True


class MentorApproval(BaseModel):
    mentor_id: int
    approved: bool


# ===== Availability Schemas =====
class AvailabilitySlotCreate(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    start_time: str = Field(..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: str = Field(..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")


class AvailabilitySlotResponse(AvailabilitySlotCreate):
    id: int
    mentor_id: int
    is_available: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Booking Schemas =====
class BookingCreate(BaseModel):
    mentor_id: int
    scheduled_at: datetime
    duration_minutes: int = 60
    notes: Optional[str] = None


class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    meeting_link: Optional[str] = None
    notes: Optional[str] = None


class BookingResponse(BaseModel):
    id: int
    user_id: int
    mentor_id: int
    scheduled_at: datetime
    duration_minutes: int
    status: BookingStatus
    meeting_link: Optional[str]
    notes: Optional[str]
    price: float
    payment_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Course Schemas =====
class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    duration_minutes: Optional[int] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    is_published: Optional[bool] = None


class CourseResponse(BaseModel):
    id: int
    instructor_id: int
    title: str
    description: Optional[str]
    video_url: Optional[str]
    thumbnail_url: Optional[str]
    price: float
    duration_minutes: Optional[int]
    is_published: bool
    created_at: datetime
    instructor: UserResponse

    class Config:
        from_attributes = True


class CourseEnrollmentCreate(BaseModel):
    course_id: int
    payment_id: Optional[str] = None


class CourseEnrollmentResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    enrolled_at: datetime
    completed: bool
    progress_percentage: float

    class Config:
        from_attributes = True


# ===== Community Schemas =====
class CommunityGroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_private: bool = False


class CommunityGroupResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_private: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CommunityPostCreate(BaseModel):
    group_id: int
    title: str
    content: str


class CommunityPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class CommunityPostResponse(BaseModel):
    id: int
    group_id: int
    author_id: int
    title: str
    content: str
    created_at: datetime
    updated_at: Optional[datetime]
    author: UserResponse

    class Config:
        from_attributes = True


class CommunityReplyCreate(BaseModel):
    post_id: int
    content: str


class CommunityReplyResponse(BaseModel):
    id: int
    post_id: int
    author_id: int
    content: str
    created_at: datetime
    author: UserResponse

    class Config:
        from_attributes = True


# ===== Payment Schemas =====
class PaymentIntentCreate(BaseModel):
    booking_id: Optional[int] = None
    course_id: Optional[int] = None


class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount: float


class PaymentConfirm(BaseModel):
    payment_intent_id: str
    booking_id: Optional[int] = None
    course_id: Optional[int] = None


# ===== Generic Responses =====
class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None
