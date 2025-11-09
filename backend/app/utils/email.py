import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List
from datetime import datetime


class EmailService:
    """Email service for sending notifications"""

    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@talesoul.com")

    def send_email(
        self,
        to_emails: List[str],
        subject: str,
        html_content: str,
        text_content: str = None
    ):
        """Send an email using SMTP"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = self.from_email
            message["To"] = ", ".join(to_emails)
            message["Subject"] = subject

            # Add text and HTML parts
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)

            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            # Connect to SMTP server and send
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                if self.smtp_username and self.smtp_password:
                    server.login(self.smtp_username, self.smtp_password)
                server.send_message(message)

            return True

        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False


# Email Templates

def get_booking_confirmation_template(booking, user, mentor):
    """Generate booking confirmation email template"""
    scheduled_date = booking.scheduled_at.strftime("%B %d, %Y at %I:%M %p")

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                       color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .booking-details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
            .detail-row {{ display: flex; justify-content: space-between; padding: 10px 0;
                          border-bottom: 1px solid #eee; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #667eea;
                      color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Booking Confirmed!</h1>
            </div>
            <div class="content">
                <p>Hi {user.full_name},</p>
                <p>Your mentorship session has been confirmed. We're excited for your upcoming session!</p>

                <div class="booking-details">
                    <h2>Session Details</h2>
                    <div class="detail-row">
                        <strong>Mentor:</strong>
                        <span>{mentor.full_name}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Date & Time:</strong>
                        <span>{scheduled_date}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Duration:</strong>
                        <span>{booking.duration_minutes} minutes</span>
                    </div>
                    <div class="detail-row">
                        <strong>Price:</strong>
                        <span>${booking.price:.2f}</span>
                    </div>
                    {f'<div class="detail-row"><strong>Meeting Link:</strong><span>{booking.meeting_link}</span></div>' if booking.meeting_link else ''}
                </div>

                <p>Your mentor will share the meeting link before the session. You can view your booking details
                   and manage your sessions in your dashboard.</p>

                <a href="http://localhost/my-bookings" class="button">View My Bookings</a>

                <p>If you need to reschedule or have any questions, please contact us.</p>

                <p>Best regards,<br>The TaleSoul Team</p>
            </div>
        </div>
    </body>
    </html>
    """

    text = f"""
    Booking Confirmed!

    Hi {user.full_name},

    Your mentorship session has been confirmed.

    Session Details:
    - Mentor: {mentor.full_name}
    - Date & Time: {scheduled_date}
    - Duration: {booking.duration_minutes} minutes
    - Price: ${booking.price:.2f}

    Your mentor will share the meeting link before the session.

    Best regards,
    The TaleSoul Team
    """

    return html, text


def get_course_enrollment_template(course, user):
    """Generate course enrollment confirmation email template"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
                       color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .course-info {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #27ae60;
                      color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Your Course!</h1>
            </div>
            <div class="content">
                <p>Hi {user.full_name},</p>
                <p>Congratulations! You've successfully enrolled in the course.</p>

                <div class="course-info">
                    <h2>{course.title}</h2>
                    <p>{course.description}</p>
                    <p><strong>Duration:</strong> {course.duration_minutes} minutes</p>
                </div>

                <p>You can now access all course materials and start learning at your own pace.</p>

                <a href="http://localhost/my-courses" class="button">Start Learning</a>

                <p>Happy learning!</p>

                <p>Best regards,<br>The TaleSoul Team</p>
            </div>
        </div>
    </body>
    </html>
    """

    text = f"""
    Welcome to Your Course!

    Hi {user.full_name},

    Congratulations! You've successfully enrolled in: {course.title}

    {course.description}

    You can now access all course materials and start learning.

    Best regards,
    The TaleSoul Team
    """

    return html, text


# Helper functions to send specific emails

def send_booking_confirmation_email(booking, user, mentor):
    """Send booking confirmation email"""
    email_service = EmailService()
    html, text = get_booking_confirmation_template(booking, user, mentor)

    return email_service.send_email(
        to_emails=[user.email],
        subject="Booking Confirmed - TaleSoul",
        html_content=html,
        text_content=text
    )


def send_course_enrollment_email(course, user):
    """Send course enrollment confirmation email"""
    email_service = EmailService()
    html, text = get_course_enrollment_template(course, user)

    return email_service.send_email(
        to_emails=[user.email],
        subject=f"Enrolled in {course.title} - TaleSoul",
        html_content=html,
        text_content=text
    )
