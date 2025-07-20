import yt_dlp
import os
import zipfile
from typing import List, Dict

from ..config import settings


class YouTubeDownloader:
    def __init__(self):
        self.output_path = settings.TEMP_AUDIO_PATH
        self.video_output_path = os.path.join(settings.TEMP_AUDIO_PATH, "videos")
        os.makedirs(self.output_path, exist_ok=True)
        os.makedirs(self.video_output_path, exist_ok=True)

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

    def download_video(self, url: str, quality: str = "best") -> str:
        """Download video from YouTube and return the file path"""
        # Extract video info first to get video ID and title
        info = self.extract_video_info(url)
        video_id = info["video_id"]
        
        # Clean title for filename
        clean_title = self._sanitize_filename(info["title"])
        
        # Set output filename
        output_filename = f"{clean_title}_{video_id}.%(ext)s"
        output_template = os.path.join(self.video_output_path, output_filename)

        # Configure quality settings
        if quality == "best":
            format_string = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"
        elif quality == "720p":
            format_string = "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best"
        elif quality == "480p":
            format_string = "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best"
        else:
            format_string = "best[ext=mp4]/best"

        ydl_opts = {
            "format": format_string,
            "outtmpl": output_template,
            "quiet": True,
            "no_warnings": True,
            "prefer_ffmpeg": True,
            "merge_output_format": "mp4",
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Download the video
                ydl.download([url])

                # Find the downloaded file
                for ext in ["mp4", "webm", "mkv", "avi"]:
                    video_path = os.path.join(
                        self.video_output_path, f"{clean_title}_{video_id}.{ext}"
                    )
                    if os.path.exists(video_path):
                        print(f"Video downloaded successfully: {video_path}")
                        return video_path

                raise Exception("Downloaded video file not found")

        except Exception as e:
            print(f"Error downloading video: {str(e)}")
            raise Exception(f"Failed to download video: {str(e)}")

    def download_multiple_videos(self, urls: List[str], quality: str = "best") -> str:
        """Download multiple videos and return them as a zip file"""
        downloaded_files = []
        failed_downloads = []
        
        # Create temporary directory for this batch
        batch_id = os.urandom(8).hex()
        batch_dir = os.path.join(self.video_output_path, f"batch_{batch_id}")
        os.makedirs(batch_dir, exist_ok=True)
        
        try:
            # Download each video
            for i, url in enumerate(urls):
                try:
                    print(f"Downloading video {i+1}/{len(urls)}: {url}")
                    
                    # Extract video info
                    info = self.extract_video_info(url)
                    video_id = info["video_id"]
                    clean_title = self._sanitize_filename(info["title"])
                    
                    # Set output filename with index to avoid duplicates
                    output_filename = f"{i+1:02d}_{clean_title}_{video_id}.%(ext)s"
                    output_template = os.path.join(batch_dir, output_filename)
                    
                    # Configure quality settings
                    if quality == "best":
                        format_string = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"
                    elif quality == "720p":
                        format_string = "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best"
                    elif quality == "480p":
                        format_string = "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best"
                    else:
                        format_string = "best[ext=mp4]/best"
                    
                    ydl_opts = {
                        "format": format_string,
                        "outtmpl": output_template,
                        "quiet": True,
                        "no_warnings": True,
                        "prefer_ffmpeg": True,
                        "merge_output_format": "mp4",
                    }
                    
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        ydl.download([url])
                    
                    # Find the downloaded file
                    for ext in ["mp4", "webm", "mkv", "avi"]:
                        video_path = os.path.join(
                            batch_dir, f"{i+1:02d}_{clean_title}_{video_id}.{ext}"
                        )
                        if os.path.exists(video_path):
                            downloaded_files.append({
                                "path": video_path,
                                "filename": os.path.basename(video_path),
                                "url": url,
                                "title": info["title"]
                            })
                            break
                    
                except Exception as e:
                    print(f"Failed to download {url}: {str(e)}")
                    failed_downloads.append({
                        "url": url,
                        "error": str(e)
                    })
            
            # Create zip file
            zip_filename = f"youtube_videos_{batch_id}.zip"
            zip_path = os.path.join(self.video_output_path, zip_filename)
            
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                # Add downloaded videos
                for file_info in downloaded_files:
                    zipf.write(file_info["path"], file_info["filename"])
                
                # Add download summary
                summary = self._create_download_summary(downloaded_files, failed_downloads)
                zipf.writestr("download_summary.txt", summary)
            
            # Cleanup individual files
            for file_info in downloaded_files:
                try:
                    os.remove(file_info["path"])
                except:
                    pass
            
            # Remove batch directory
            try:
                os.rmdir(batch_dir)
            except:
                pass
            
            return zip_path
            
        except Exception as e:
            # Cleanup on error
            for file_info in downloaded_files:
                try:
                    os.remove(file_info["path"])
                except:
                    pass
            
            if os.path.exists(batch_dir):
                try:
                    os.rmdir(batch_dir)
                except:
                    pass
            
            raise Exception(f"Failed to create zip file: {str(e)}")

    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for safe file system usage"""
        # Remove invalid characters
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            filename = filename.replace(char, '_')
        
        # Limit length
        if len(filename) > 100:
            filename = filename[:100]
        
        return filename.strip()

    def _create_download_summary(self, downloaded: List[Dict], failed: List[Dict]) -> str:
        """Create a summary of the download batch"""
        summary = "YouTube Batch Download Summary\n"
        summary += "=" * 50 + "\n\n"
        
        summary += f"Total videos requested: {len(downloaded) + len(failed)}\n"
        summary += f"Successfully downloaded: {len(downloaded)}\n"
        summary += f"Failed downloads: {len(failed)}\n\n"
        
        if downloaded:
            summary += "Successfully Downloaded Videos:\n"
            summary += "-" * 30 + "\n"
            for i, file_info in enumerate(downloaded, 1):
                summary += f"{i}. {file_info['title']}\n"
                summary += f"   URL: {file_info['url']}\n"
                summary += f"   Filename: {file_info['filename']}\n\n"
        
        if failed:
            summary += "\nFailed Downloads:\n"
            summary += "-" * 30 + "\n"
            for i, fail_info in enumerate(failed, 1):
                summary += f"{i}. URL: {fail_info['url']}\n"
                summary += f"   Error: {fail_info['error']}\n\n"
        
        return summary

    def cleanup_old_files(self, hours: int = 24):
        """Clean up old downloaded files"""
        import time
        
        current_time = time.time()
        
        # Clean video directory
        for filename in os.listdir(self.video_output_path):
            file_path = os.path.join(self.video_output_path, filename)
            if os.path.isfile(file_path):
                file_age = current_time - os.path.getmtime(file_path)
                if file_age > (hours * 3600):
                    try:
                        os.remove(file_path)
                        print(f"Deleted old file: {filename}")
                    except:
                        pass