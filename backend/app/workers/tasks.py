import os
import traceback
import json

from .celery_app import celery_app
from datetime import datetime
from typing import List

@celery_app.task(bind=True, name="process_youtube_video")
def process_youtube_video(self, script_id: int, video_url: str):
    """Main task to process YouTube video - No user authentication"""

    # Import here to avoid circular imports
    from ..database import SessionLocal
    from ..models import Script
    from ..core.youtube_downloader import YouTubeDownloader
    from ..core.transcriber import WhisperTranscriber
    from ..core.formatter import ScriptFormatter
    from ..core.redis_client import get_redis_client

    db = SessionLocal()
    downloader = YouTubeDownloader()
    transcriber = WhisperTranscriber()
    formatter = ScriptFormatter()
    audio_path = None
    redis_client = get_redis_client()

    # Store task progress in Redis
    def update_task_status(progress, status, extra_data=None):
        task_data = {
            "task_id": self.request.id,
            "script_id": script_id,
            "progress": progress,
            "status": status,
            "state": "PROGRESS" if progress < 100 else "SUCCESS",
            "timestamp": datetime.utcnow().isoformat(),
        }
        if extra_data:
            task_data.update(extra_data)

        # Store in Redis with task ID as key
        redis_client.set(
            f"task_result:{self.request.id}",
            json.dumps(task_data),
            ex=3600,  # Expire in 1 hour
        )

        # Also update Celery state
        self.update_state(
            state="PROGRESS" if progress < 100 else "SUCCESS",
            meta={"current": progress, "total": 100, "status": status},
        )

    try:
        print(f"Starting to process video: {video_url}")

        # Update task state - Extracting info
        update_task_status(10, "Extracting video information...")

        # Get script record
        script = db.query(Script).filter(Script.id == script_id).first()
        if not script:
            raise Exception(f"Script with ID {script_id} not found")

        # Update script status
        script.status = "processing"
        db.commit()

        # Extract video info
        update_task_status(20, "Downloading audio from video...")
        video_info = downloader.extract_video_info(video_url)

        # Update script with video info
        script.video_title = video_info.get("title")
        script.video_duration = video_info.get("duration")
        db.commit()

        # Download audio
        audio_path = downloader.download_audio(video_url)

        # Ensure audio_path is a string, not a tuple
        if isinstance(audio_path, tuple):
            audio_path = audio_path[0]

        print(f"Audio downloaded to: {audio_path}")

        # Transcribe audio
        update_task_status(50, "Transcribing audio using AI...")
        transcript_data = transcriber.transcribe_audio(audio_path)

        # Format transcript
        update_task_status(80, "Formatting transcript...")
        formatted_script = transcriber.format_transcript_as_list(
            transcript_data["segments"]
        )

        # Update script with results
        script.transcript_text = transcript_data["text"]
        script.formatted_script = formatted_script  # Now storing as JSON list
        script.status = "completed"
        script.completed_at = datetime.utcnow()
        db.commit()

        # Final update
        update_task_status(100, "Transcription completed!", {"state": "SUCCESS"})

        print(f"Successfully processed script {script_id}")
        return {
            "script_id": script_id,
            "status": "completed",
            "message": "Video processed successfully",
        }

    except Exception as e:
        print(f"Error processing video: {str(e)}")
        print(traceback.format_exc())

        # Update script with error
        if script:
            script.status = "failed"
            script.error_message = str(e)
            db.commit()

        # Update task status
        update_task_status(
            0, f"Processing failed: {str(e)}", {"state": "FAILURE", "error": str(e)}
        )

        raise

    finally:
        # Cleanup
        if audio_path:
            # Ensure audio_path is a string
            if isinstance(audio_path, tuple):
                audio_path = audio_path[0]

            if isinstance(audio_path, str) and os.path.exists(audio_path):
                try:
                    os.remove(audio_path)
                    print(f"Cleaned up audio file: {audio_path}")
                except Exception as cleanup_error:
                    print(f"Failed to clean up audio file: {cleanup_error}")

        db.close()

@celery_app.task(bind=True, name="download_video")
def download_video_task(self, video_url: str, quality: str = "best"):
    """Task to download a single YouTube video"""
    
    from ..core.youtube_downloader import YouTubeDownloader
    from ..core.redis_client import get_redis_client
    
    downloader = YouTubeDownloader()
    redis_client = get_redis_client()
    
    def update_task_status(progress, status, extra_data=None):
        task_data = {
            "task_id": self.request.id,
            "progress": progress,
            "status": status,
            "state": "PROGRESS" if progress < 100 else "SUCCESS",
            "timestamp": datetime.utcnow().isoformat(),
        }
        if extra_data:
            task_data.update(extra_data)
        
        redis_client.set(
            f"download_task:{self.request.id}",
            json.dumps(task_data),
            ex=3600  # Expire in 1 hour
        )
        
        self.update_state(
            state="PROGRESS" if progress < 100 else "SUCCESS",
            meta={"current": progress, "total": 100, "status": status}
        )
    
    try:
        # Update status
        update_task_status(10, "Extracting video information...")
        
        # Extract video info
        video_info = downloader.extract_video_info(video_url)
        
        # Update status
        update_task_status(30, f"Downloading: {video_info['title']}...")
        
        # Download video
        video_path = downloader.download_video(video_url, quality)
        
        # Update final status
        update_task_status(
            100,
            "Download completed!",
            {
                "state": "SUCCESS",
                "file_path": video_path,
                "video_info": video_info
            }
        )
        
        return {
            "file_path": video_path,
            "video_info": video_info,
            "status": "completed"
        }
        
    except Exception as e:
        # Update error status
        error_data = {
            "state": "FAILURE",
            "error": str(e)
        }
        
        redis_client.set(
            f"download_task:{self.request.id}",
            json.dumps(error_data),
            ex=3600
        )
        
        raise


@celery_app.task(bind=True, name="download_multiple_videos")
def download_multiple_videos_task(self, video_urls: List[str], quality: str = "best"):
    """Task to download multiple YouTube videos"""
    
    from ..core.youtube_downloader import YouTubeDownloader
    from ..core.redis_client import get_redis_client
    
    downloader = YouTubeDownloader()
    redis_client = get_redis_client()
    
    def update_task_status(progress, status, extra_data=None):
        task_data = {
            "task_id": self.request.id,
            "progress": progress,
            "status": status,
            "state": "PROGRESS" if progress < 100 else "SUCCESS",
            "timestamp": datetime.utcnow().isoformat(),
        }
        if extra_data:
            task_data.update(extra_data)
        
        redis_client.set(
            f"download_task:{self.request.id}",
            json.dumps(task_data),
            ex=3600
        )
        
        self.update_state(
            state="PROGRESS" if progress < 100 else "SUCCESS",
            meta={"current": progress, "total": 100, "status": status}
        )
    
    try:
        total_videos = len(video_urls)
        
        # Update initial status
        update_task_status(5, f"Starting download of {total_videos} videos...")
        
        # Calculate progress increments
        progress_per_video = 90 / total_videos
        current_progress = 5
        
        # Download videos and create zip
        zip_path = downloader.download_multiple_videos(video_urls, quality)
        
        # Update final status
        update_task_status(
            100,
            f"Successfully created zip file with videos",
            {
                "state": "SUCCESS",
                "file_path": zip_path,
                "total_videos": total_videos
            }
        )
        
        return {
            "file_path": zip_path,
            "total_videos": total_videos,
            "status": "completed"
        }
        
    except Exception as e:
        # Update error status
        error_data = {
            "state": "FAILURE",
            "error": str(e)
        }
        
        redis_client.set(
            f"download_task:{self.request.id}",
            json.dumps(error_data),
            ex=3600
        )
        
        raise