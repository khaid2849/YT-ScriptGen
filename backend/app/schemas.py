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
        from_attributes = True

class ScriptWithContent(ScriptBase):
    transcript_text: Optional[str]
    formatted_script: Optional[List[Dict[str, Any]]]
    error_message: Optional[str]
    
    class Config:
        from_attributes = True

# Processing status schema
class ProcessingStatus(BaseModel):
    task_id: str
    status: str  # processing, completed, failed
    progress: int
    message: str
    script_id: Optional[int] = None

class VideoDownloadRequest(BaseModel):
    url: HttpUrl
    quality: str = "best"  # Options: "best", "720p", "480p"

class MultipleVideoDownloadRequest(BaseModel):
    urls: List[HttpUrl]
    quality: str = "best"

class VideoDownloadResponse(BaseModel):
    task_id: str
    status: str
    message: str

class VideoDownloadStatus(BaseModel):
    status: str  # "pending", "processing", "completed", "error"
    progress: int
    message: Optional[str] = None
    download_url: Optional[str] = None
    error: Optional[str] = None

class ScriptVideoDownloadRequest(BaseModel):
    quality: str = "best"  # Options: "best", "720p", "480p"

class AudioDownloadRequest(BaseModel):
    url: HttpUrl

class MultipleAudioDownloadRequest(BaseModel):
    urls: List[HttpUrl]