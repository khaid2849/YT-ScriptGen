import os
import traceback
import json

from .celery_app import celery_app
from datetime import datetime
from typing import List

# Friendly messages for common failure scenarios
_FRIENDLY_ERRORS = {
    "openai-whisper": "Transcription service is not properly installed. Please run: pip install openai-whisper",
    "LoadLibrary": "Transcription service failed to load on this system. Ensure openai-whisper is installed correctly.",
    "ffmpeg": "Audio processing tool (ffmpeg) is not installed or not found in PATH.",
    "No space left": "Server ran out of disk space while processing the video.",
    "FileNotFoundError": "Audio file could not be found after download. Please try again.",
}


def _friendly_error(exc: Exception) -> str:
    msg = str(exc)
    for keyword, friendly in _FRIENDLY_ERRORS.items():
        if keyword.lower() in msg.lower() or keyword.lower() in type(exc).__name__.lower():
            return friendly
    return f"Processing failed: {msg}"


@celery_app.task(bind=True, name="process_youtube_video")
def process_youtube_video(self, script_id: int, video_url: str):
    """Main task to process YouTube video - No user authentication"""

    # These must be imported and initialized before the try block so
    # the except block can always report errors back to the user.
    from ..database import SessionLocal
    from ..models import Script
    from ..core.redis_client import get_redis_client

    db = SessionLocal()
    redis_client = get_redis_client()
    script = None
    audio_path = None

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

        redis_client.set(
            f"task_result:{self.request.id}",
            json.dumps(task_data),
            ex=3600,
        )

        self.update_state(
            state="PROGRESS" if progress < 100 else "SUCCESS",
            meta={"current": progress, "total": 100, "status": status},
        )

    try:
        # Defer heavy imports so any ImportError is caught and surfaced
        from ..core.youtube_downloader import YouTubeDownloader
        from ..core.transcriber import WhisperTranscriber
        from ..core.formatter import ScriptFormatter

        downloader = YouTubeDownloader()
        transcriber = WhisperTranscriber()
        formatter = ScriptFormatter()

        print(f"Starting to process video: {video_url}")

        update_task_status(10, "Extracting video information...")

        script = db.query(Script).filter(Script.id == script_id).first()
        if not script:
            raise Exception(f"Script with ID {script_id} not found")

        script.status = "processing"
        db.commit()

        update_task_status(20, "Downloading audio from video...")
        video_info = downloader.extract_video_info(video_url)

        script.video_title = video_info.get("title")
        script.video_duration = video_info.get("duration")
        db.commit()

        audio_path = downloader.download_audio(video_url)

        if isinstance(audio_path, tuple):
            audio_path = audio_path[0]

        print(f"Audio downloaded to: {audio_path}")

        update_task_status(50, "Transcribing audio using AI...")
        transcript_data = transcriber.transcribe_audio(audio_path)

        update_task_status(80, "Formatting transcript...")
        formatted_script = transcriber.format_transcript_as_list(
            transcript_data["segments"]
        )

        script.transcript_text = transcript_data["text"]
        script.formatted_script = formatted_script
        script.status = "completed"
        script.completed_at = datetime.utcnow()
        db.commit()

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

        user_message = _friendly_error(e)

        if script:
            script.status = "failed"
            script.error_message = user_message
            db.commit()

        update_task_status(
            0,
            user_message,
            {"state": "FAILURE", "error": user_message},
        )

        raise

    finally:
        if audio_path:
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


@celery_app.task(bind=True, name="download_audio")
def download_audio_task(self, video_url: str):
    """Task to download audio from a single YouTube video"""
    
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
        # Update initial status
        update_task_status(10, "Extracting video info...")
        
        # Get video info
        video_info = downloader.extract_video_info(video_url)
        
        # Update status
        update_task_status(30, "Starting audio extraction...")
        
        # Download audio
        audio_path = downloader.download_audio(video_url)
        
        # Update final status
        update_task_status(
            100,
            "Audio extraction completed",
            {
                "state": "SUCCESS",
                "file_path": audio_path,
                "video_info": video_info
            }
        )
        
        return {
            "file_path": audio_path,
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


@celery_app.task(bind=True, name="download_multiple_audios")
def download_multiple_audios_task(self, video_urls: List[str]):
    """Task to download audio from multiple YouTube videos"""
    
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
        update_task_status(5, f"Starting audio extraction from {total_videos} videos...")
        
        # Download audio files and create zip
        zip_path = downloader.download_multiple_audios(video_urls)
        
        # Update final status
        update_task_status(
            100,
            f"Successfully created zip file with audio files",
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
