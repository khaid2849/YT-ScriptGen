from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from ...database import get_db
from ...models import Script
from ...schemas import VideoDownloadRequest, MultipleVideoDownloadRequest, VideoDownloadResponse
from ...core.youtube_downloader import YouTubeDownloader
from ...workers.tasks import download_video_task, download_multiple_videos_task
from ...core.redis_client import get_redis_client

router = APIRouter()

@router.post("/video", response_model=VideoDownloadResponse)
async def download_single_video(
    request: VideoDownloadRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Download a single YouTube video"""
    downloader = YouTubeDownloader()
    
    try:
        # Validate URL - convert HttpUrl to string
        video_info = downloader.extract_video_info(str(request.url))
        
        # Start download task
        task = download_video_task.delay(
            video_url=str(request.url),
            quality=request.quality
        )
        
        return VideoDownloadResponse(
            task_id=task.id,
            status="processing",
            message="Video download started"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid YouTube URL or video not accessible: {str(e)}"
        )

@router.post("/video/direct")
async def download_video_direct(
    request: VideoDownloadRequest
):
    """Download a single YouTube video directly (sync)"""
    downloader = YouTubeDownloader()
    
    try:
        # Download video
        video_path = downloader.download_video(str(request.url), request.quality)
        
        # Get filename
        filename = os.path.basename(video_path)
        
        # Return file response
        return FileResponse(
            path=video_path,
            filename=filename,
            media_type='video/mp4',
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to download video: {str(e)}"
        )

@router.post("/videos", response_model=VideoDownloadResponse)
async def download_multiple_videos(
    request: MultipleVideoDownloadRequest,
    background_tasks: BackgroundTasks
):
    """Download multiple YouTube videos as a zip file"""
    
    if not request.urls:
        raise HTTPException(
            status_code=400,
            detail="No URLs provided"
        )
    
    if len(request.urls) > 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 videos can be downloaded at once"
        )
    
    # Validate all URLs
    downloader = YouTubeDownloader()
    for url in request.urls:
        try:
            downloader.extract_video_info(str(url))
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid URL {url}: {str(e)}"
            )
    
    # Start download task
    task = download_multiple_videos_task.delay(
        video_urls=[str(url) for url in request.urls],
        quality=request.quality
    )
    
    return VideoDownloadResponse(
        task_id=task.id,
        status="processing",
        message=f"Starting download of {len(request.urls)} videos"
    )

@router.get("/status/{task_id}")
def get_download_status(task_id: str):
    """Get the status of a video download task"""
    redis_client = get_redis_client()
    
    # Get task result from Redis
    import json
    task_result_str = redis_client.get(f"download_task:{task_id}")
    
    if task_result_str:
        task_result = json.loads(task_result_str)
        
        if task_result.get("state") == "SUCCESS":
            file_path = task_result.get("file_path")
            
            if file_path and os.path.exists(file_path):
                return {
                    "status": "completed",
                    "progress": 100,
                    "download_url": f"/api/v1/download/file/{task_id}"
                }
            else:
                return {
                    "status": "error",
                    "progress": 0,
                    "error": "File not found"
                }
        
        elif task_result.get("state") == "FAILURE":
            return {
                "status": "error",
                "progress": 0,
                "error": task_result.get("error", "Download failed")
            }
        
        else:
            return {
                "status": "processing",
                "progress": task_result.get("progress", 0),
                "message": task_result.get("status", "Processing...")
            }
    
    # Check Celery task status
    from ...workers.celery_app import celery_app
    result = celery_app.AsyncResult(task_id)
    
    if result.state == 'PENDING':
        return {
            "status": "pending",
            "progress": 0,
            "message": "Task is waiting to start"
        }
    elif result.state == 'PROGRESS':
        return {
            "status": "processing",
            "progress": result.info.get('current', 0),
            "message": result.info.get('status', 'Processing...')
        }
    elif result.state == 'SUCCESS':
        return {
            "status": "completed",
            "progress": 100,
            "download_url": f"/api/v1/download/file/{task_id}"
        }
    elif result.state == 'FAILURE':
        return {
            "status": "error",
            "progress": 0,
            "error": str(result.info)
        }
    else:
        return {
            "status": "unknown",
            "progress": 0,
            "message": f"Unknown task state: {result.state}"
        }

@router.get("/file/{task_id}")
async def download_file(task_id: str):
    """Download the completed video file"""
    redis_client = get_redis_client()
    
    # Get file path from Redis
    import json
    task_result_str = redis_client.get(f"download_task:{task_id}")
    
    if not task_result_str:
        raise HTTPException(
            status_code=404,
            detail="Download not found or expired"
        )
    
    task_result = json.loads(task_result_str)
    file_path = task_result.get("file_path")
    
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )
    
    # Get filename
    filename = os.path.basename(file_path)
    
    # Determine media type
    if file_path.endswith('.zip'):
        media_type = 'application/zip'
    else:
        media_type = 'video/mp4'
    
    # Return file
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@router.post("/script/{script_id}/video")
async def download_script_video(
    script_id: int,
    db: Session = Depends(get_db)
):
    """Download the video for a specific script"""
    # Get script
    script = db.query(Script).filter(Script.id == script_id).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    
    # Download video
    downloader = YouTubeDownloader()
    try:
        video_path = downloader.download_video(script.video_url, "best")
        
        # Get filename
        filename = f"{script.video_title or 'video'}.mp4"
        
        # Return file response
        return FileResponse(
            path=video_path,
            filename=filename,
            media_type='video/mp4',
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to download video: {str(e)}"
        )