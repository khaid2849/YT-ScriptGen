from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime
from enum import Enum

# Enums
class ScriptStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"

# Script Schemas
class ScriptBase(BaseModel):
    video_url: HttpUrl

class ScriptCreate(ScriptBase):
    pass

class ScriptUpdate(BaseModel):
    status: Optional[str] = None
    transcript_text: Optional[str] = None
    formatted_script: Optional[str] = None
    error_message: Optional[str] = None

class Script(ScriptBase):
    id: int
    user_id: Optional[int]
    video_title: Optional[str]
    video_duration: Optional[int]
    status: str
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class ScriptWithContent(Script):
    transcript_text: Optional[str]
    formatted_script: Optional[str]
    error_message: Optional[str]

# Response Schemas
class ProcessingStatus(BaseModel):
    task_id: str
    status: str
    progress: int
    message: str
    script_id: Optional[int] = None