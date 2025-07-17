import yt_dlp
import os
from ..config import settings


class YouTubeDownloader:
    def __init__(self):
        self.output_path = settings.TEMP_AUDIO_PATH
        os.makedirs(self.output_path, exist_ok=True)

    def extract_video_info(self, url: str) -> dict:
        """Extract video information without downloading"""
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "extract_flat": False,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

            return {
                "title": info.get("title", "Unknown"),
                "duration": info.get("duration", 0),
                "channel": info.get("channel", "Unknown"),
                "video_id": info.get("id", "unknown"),
                "thumbnail": info.get("thumbnail", ""),
                "description": info.get("description", ""),
                "upload_date": info.get("upload_date", ""),
                "view_count": info.get("view_count", 0),
            }

    def download_audio(self, url: str) -> str:
        """Download audio from YouTube video and return the file path"""
        # Extract video info first to get video ID
        info = self.extract_video_info(url)
        video_id = info["video_id"]

        # Set output filename
        output_filename = f"{video_id}.%(ext)s"
        output_template = os.path.join(self.output_path, output_filename)

        ydl_opts = {
            "format": "bestaudio/best",
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ],
            "outtmpl": output_template,
            "quiet": True,
            "no_warnings": True,
            "prefer_ffmpeg": True,
            "keepvideo": False,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Download the audio
                ydl.download([url])

                # Get the actual output filename
                # After conversion, the file will have .mp3 extension
                audio_path = os.path.join(self.output_path, f"{video_id}.mp3")

                # Verify the file exists
                if os.path.exists(audio_path):
                    print(f"Audio downloaded successfully: {audio_path}")
                    return audio_path
                else:
                    # Check for other possible extensions
                    for ext in ["m4a", "webm", "opus", "wav"]:
                        possible_path = os.path.join(
                            self.output_path, f"{video_id}.{ext}"
                        )
                        if os.path.exists(possible_path):
                            print(f"Audio downloaded successfully: {possible_path}")
                            return possible_path

                    raise Exception(f"Downloaded file not found at expected location")

        except Exception as e:
            print(f"Error downloading audio: {str(e)}")
            raise Exception(f"Failed to download audio: {str(e)}")
