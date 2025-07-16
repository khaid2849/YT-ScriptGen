from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from .database import Base

class Script(Base):
    __tablename__ = "scripts"
    
    id = Column(Integer, primary_key=True, index=True)
    video_url = Column(String, nullable=False)
    video_title = Column(String)
    video_duration = Column(Integer)
    status = Column(String, default="pending")
    transcript_text = Column(Text)
    formatted_script = Column(JSON)  # Stores list of timestamp-text pairs
    error_message = Column(Text)
    file_path = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))