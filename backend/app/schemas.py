from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime

# Script related schemas
class ScriptCreate(BaseModel):
    video_url: HttpUrl
    
class ScriptBase(BaseModel):
    id: int
    video_url: str
    video_title: Optional[str]
    video_duration: Optional[int]
    status: str
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        orm_mode = True

class ScriptWithContent(ScriptBase):
    transcript_text: Optional[str]
    formatted_script: Optional[List[Dict[str, Any]]]
    error_message: Optional[str]
    
    class Config:
        orm_mode = True

# Processing status schema
class ProcessingStatus(BaseModel):
    task_id: str
    status: str  # processing, completed, failed
    progress: int
    message: str
    script_id: Optional[int] = None