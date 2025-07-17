from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os

router = APIRouter()


class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


class ContactResponse(BaseModel):
    success: bool
    message: str


def send_email_notification(contact_data: ContactMessage):
    """Send email notification (configure with your SMTP settings)"""
    try:
        # Email configuration from environment variables
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER", "")
        smtp_pass = os.getenv("SMTP_PASS", "")
        admin_email = os.getenv("ADMIN_EMAIL", "")

        if not all([smtp_user, smtp_pass, admin_email]):
            print("Email configuration not complete. Skipping email notification.")
            return

        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"ScriptGen Contact: {contact_data.subject}"
        msg["From"] = smtp_user
        msg["To"] = admin_email

        # Create the HTML content
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                New Contact Form Submission
              </h2>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> {contact_data.name}</p>
                <p><strong>Email:</strong> <a href="mailto:{contact_data.email}">{contact_data.email}</a></p>
                <p><strong>Subject:</strong> {contact_data.subject}</p>
                <p><strong>Date:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
              </div>
              
              <div style="background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h3 style="color: #1f2937; margin-top: 0;">Message:</h3>
                <p style="white-space: pre-wrap;">{contact_data.message}</p>
              </div>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                <p>This message was sent from the ScriptGen contact form.</p>
              </div>
            </div>
          </body>
        </html>
        """

        # Also create plain text version
        text = f"""
        New Contact Form Submission
        
        Name: {contact_data.name}
        Email: {contact_data.email}
        Subject: {contact_data.subject}
        Date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        
        Message:
        {contact_data.message}
        
        ---
        This message was sent from the ScriptGen contact form.
        """

        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")

        msg.attach(part1)
        msg.attach(part2)

        # Send email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)

        print(f"Email notification sent successfully to {admin_email}")

    except Exception as e:
        print(f"Failed to send email notification: {str(e)}")


def save_to_file(contact_data: ContactMessage):
    """Save contact messages to a file as backup"""
    try:
        os.makedirs("contact_messages", exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"contact_messages/message_{timestamp}.txt"

        with open(filename, "w") as f:
            f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Name: {contact_data.name}\n")
            f.write(f"Email: {contact_data.email}\n")
            f.write(f"Subject: {contact_data.subject}\n")
            f.write(f"Message:\n{contact_data.message}\n")

        print(f"Contact message saved to {filename}")

    except Exception as e:
        print(f"Failed to save contact message to file: {str(e)}")


@router.post("/", response_model=ContactResponse)
async def send_message(contact_data: ContactMessage, background_tasks: BackgroundTasks):
    """
    Send a contact message

    This endpoint receives contact form submissions and:
    1. Saves the message to a file
    2. Sends an email notification (if configured)
    """

    # Validate message length
    if len(contact_data.message) < 10:
        raise HTTPException(
            status_code=400, detail="Message must be at least 10 characters long"
        )

    if len(contact_data.message) > 5000:
        raise HTTPException(
            status_code=400, detail="Message must not exceed 5000 characters"
        )

    # Process the message in the background
    background_tasks.add_task(save_to_file, contact_data)
    background_tasks.add_task(send_email_notification, contact_data)

    return ContactResponse(
        success=True,
        message="Your message has been sent successfully! We'll get back to you within 24 hours.",
    )
