import json
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime

from ...database import get_db
from ...models import Script
from ...schemas import ScriptCreate, ProcessingStatus
from ...workers.tasks import process_youtube_video
from ...core.youtube_downloader import YouTubeDownloader
from ...core.redis_client import get_redis_client

router = APIRouter()

@router.post("/", response_model=ProcessingStatus)
async def create_transcription(
    script_data: ScriptCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Start transcription process for a YouTube video - No authentication required"""
    
    # Validate YouTube URL
    downloader = YouTubeDownloader()
    try:
        video_info = downloader.extract_video_info(str(script_data.video_url))
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid YouTube URL or video not accessible: {str(e)}"
        )
    
    # Create script record
    db_script = Script(
        video_url=str(script_data.video_url),
        video_title=video_info.get('title'),
        status='pending'
    )
    db.add(db_script)
    db.commit()
    db.refresh(db_script)
    
    # Start async processing
    task = process_youtube_video.delay(
        script_id=db_script.id,
        video_url=str(script_data.video_url)
    )
    
    return ProcessingStatus(
        task_id=task.id,
        status="processing",
        progress=0,
        message="Video processing started"
    )

@router.get("/status/{task_id}", response_model=ProcessingStatus)
def get_transcription_status(task_id: str, db: Session = Depends(get_db)):
    """Get the status of a transcription task"""
    
    redis_client = get_redis_client()
    
    # First, try to get result from Redis
    task_result_str = redis_client.get(f"task_result:{task_id}")
    
    if task_result_str:
        # We have a result in Redis
        task_result = json.loads(task_result_str)
        print(f"Task {task_id} result from Redis: {task_result}")
        
        return ProcessingStatus(
            task_id=task_id,
            status='completed' if task_result.get('state') == 'SUCCESS' else 
                    'failed' if task_result.get('state') == 'FAILURE' else 'processing',
            progress=task_result.get('progress', 0),
            message=task_result.get('status', 'Processing...'),
            script_id=task_result.get('script_id')
        )
    
    # Fallback to checking task data
    task_data_str = redis_client.get(f"task:{task_id}")
    if task_data_str:
        task_data = json.loads(task_data_str)
        script_id = task_data.get('script_id')
        
        # Check if script exists and is completed
        if script_id:
            script = db.query(Script).filter(Script.id == script_id).first()
            if script:
                if script.status == 'completed':
                    return ProcessingStatus(
                        task_id=task_id,
                        status='completed',
                        progress=100,
                        message='Transcription completed!',
                        script_id=script.id
                    )
                elif script.status == 'failed':
                    return ProcessingStatus(
                        task_id=task_id,
                        status='failed',
                        progress=0,
                        message=script.error_message or 'Transcription failed',
                        script_id=script.id
                    )
    
    # Default response
    return ProcessingStatus(
        task_id=task_id,
        status='processing',
        progress=50,
        message='Processing video...'
    )