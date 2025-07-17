import whisper
import os
from typing import Dict, List
from ..config import settings


class WhisperTranscriber:
    def __init__(self, model_name: str = None):
        self.model_name = model_name or settings.WHISPER_MODEL
        print(f"Loading Whisper model: {self.model_name}")
        self.model = whisper.load_model(self.model_name)
        print(f"Whisper model loaded successfully")

    def transcribe_audio(self, audio_path: str) -> Dict:
        """Transcribe audio file using Whisper"""
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        print(f"Starting transcription of: {audio_path}")

        try:
            # Transcribe the audio file directly with the path
            result = self.model.transcribe(
                audio_path,
                language=None,  # Auto-detect language
                task="transcribe",
                verbose=True,
                temperature=0.0,
                compression_ratio_threshold=2.4,
                logprob_threshold=-1.0,
                no_speech_threshold=0.6,
                condition_on_previous_text=True,
                initial_prompt=None,
                word_timestamps=False,
            )

            print(
                f"Transcription completed. Detected language: {result.get('language', 'unknown')}"
            )

            return {
                "text": result["text"],
                "segments": result["segments"],
                "language": result.get("language", "unknown"),
            }

        except Exception as e:
            print(f"Error during transcription: {str(e)}")
            # Try with different parameters as fallback
            try:
                print("Attempting transcription with basic parameters...")
                result = self.model.transcribe(audio_path)
                return {
                    "text": result["text"],
                    "segments": result["segments"],
                    "language": result.get("language", "unknown"),
                }
            except Exception as fallback_error:
                print(f"Fallback transcription also failed: {str(fallback_error)}")
                raise Exception(f"Transcription failed: {str(e)}")

    def format_transcript(
        self, segments: List[Dict], format_type: str = "timestamp"
    ) -> str:
        """Format transcript segments into readable text"""
        if format_type == "timestamp":
            lines = []
            for segment in segments:
                start_time = self._seconds_to_timestamp(segment["start"])
                end_time = self._seconds_to_timestamp(segment["end"])
                text = segment["text"].strip()
                lines.append(f"[{start_time} - {end_time}]: {text}")
            return "\n\n".join(lines)
        elif format_type == "plain":
            return " ".join([segment["text"].strip() for segment in segments])
        else:
            raise ValueError(f"Unknown format type: {format_type}")

    def format_transcript_as_list(self, segments: List[Dict]) -> List[Dict]:
        """Format transcript segments into a list of script objects"""
        script_list = []
        for segment in segments:
            start_time = self._seconds_to_timestamp(segment["start"])
            end_time = self._seconds_to_timestamp(segment["end"])
            text = segment["text"].strip()

            script_list.append(
                {
                    "timestamp": f"[{start_time} - {end_time}]",
                    "script": text,
                    "start_seconds": segment["start"],
                    "end_seconds": segment["end"],
                }
            )

        return script_list

    def _seconds_to_timestamp(self, seconds: float) -> str:
        """Convert seconds to HH:MM:SS or MM:SS format"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)

        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{secs:02d}"
        else:
            return f"{minutes:02d}:{secs:02d}"
