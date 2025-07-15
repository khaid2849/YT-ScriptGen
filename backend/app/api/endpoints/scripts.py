from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json
import io
import re
from datetime import datetime

from ...database import get_db
from ...models import Script
from ...schemas import ScriptWithContent

router = APIRouter()

@router.get("/{script_id}", response_model=ScriptWithContent)
def get_script(
    script_id: int,
    db: Session = Depends(get_db)
):
    """Get a single script by ID"""
    script = db.query(Script).filter(Script.id == script_id).first()
    
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    
    return script

@router.get("/{script_id}/download")
def download_script(
    script_id: int,
    format: str = "txt",
    db: Session = Depends(get_db)
):
    """Download a script in various formats"""
    script = db.query(Script).filter(Script.id == script_id).first()
    
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    
    if script.status != "completed":
        raise HTTPException(status_code=400, detail="Script is not ready for download")
    
    # Generate content based on format
    if format == "txt":
        content = generate_txt_content(script)
        filename = f"{sanitize_filename(script.video_title or 'transcript')}.txt"
        media_type = "text/plain"
    elif format == "json":
        content = generate_json_content(script)
        filename = f"{sanitize_filename(script.video_title or 'transcript')}.json"
        media_type = "application/json"
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")
    
    # Create response
    output = io.BytesIO(content.encode('utf-8'))
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe download"""
    # Remove or replace invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Limit length
    if len(filename) > 100:
        filename = filename[:100]
    return filename

def generate_txt_content(script: Script) -> str:
    """Generate TXT content for download"""
    if script.formatted_script:
        # Handle new list format
        if isinstance(script.formatted_script, list):
            lines = []
            for script_item in script.formatted_script:
                if isinstance(script_item, dict) and 'timestamp' in script_item and 'script' in script_item:
                    lines.append(f"{script_item['timestamp']}: {script_item['script']}")
                else:
                    lines.append(str(script_item))
            return '\n\n'.join(lines)
        
        # Handle old string format
        elif isinstance(script.formatted_script, str):
            return script.formatted_script
    
    # Fallback to transcript text
    if script.transcript_text:
        return script.transcript_text
    
    return "No transcript available"

def generate_json_content(script: Script) -> str:
    """Generate JSON content for download with timestamp-script format
    
    JSON Structure:
    {
        "transcript": {
            "[00:00 - 00:05]": "Hello welcome to my videos",
            "[00:06 - 00:10]": "Let's have a look at the overview",
            "[00:11 - 00:15]": "of what we gonna talk about today"
        },
        "video_info": {
            "title": "Video Title",
            "url": "https://youtube.com/watch?v=...",
            "duration_seconds": 3600,
            "duration_formatted": "1:00:00",
            "status": "completed",
            "created_at": "2024-01-01T12:00:00",
            "completed_at": "2024-01-01T12:05:00"
        },
        "metadata": {
            "total_segments": 3,
            "export_format": "timestamp_script",
            "export_date": "2024-01-01T12:05:00"
        }
    }
    """
    # Create the main JSON structure
    json_data = {
        # Main timestamp-script pairs
        "transcript": {}
    }
    
    # Handle the new list format of formatted_script
    if script.formatted_script and isinstance(script.formatted_script, list):
        # formatted_script is now a list of script objects
        for script_item in script.formatted_script:
            if isinstance(script_item, dict) and 'timestamp' in script_item and 'script' in script_item:
                json_data["transcript"][script_item['timestamp']] = script_item['script']
    else:
        # Fallback for old format or if formatted_script is not a list
        timestamp_script_pairs = []
        
        if script.formatted_script and isinstance(script.formatted_script, str):
            lines = script.formatted_script.split('\n')
            for line in lines:
                line = line.strip()
                if line:
                    # Look for timestamp pattern [00:00 - 00:05]: script content
                    if '[' in line and ']' in line and ':' in line:
                        timestamp_end = line.find(']')
                        timestamp = line[:timestamp_end + 1]
                        # Extract the script content after the timestamp
                        content_start = line.find(':', timestamp_end)
                        if content_start != -1:
                            script_content = line[content_start + 1:].strip()
                            if script_content:  # Only add if there's actual content
                                timestamp_script_pairs.append([timestamp, script_content])
                    else:
                        # If no timestamp, treat as regular content
                        timestamp_script_pairs.append(["", line])
            
            # Add timestamp-script pairs to the main structure
            for timestamp, content in timestamp_script_pairs:
                if timestamp:
                    json_data["transcript"][timestamp] = content
                else:
                    # For content without timestamps, use a generic key
                    json_data["transcript"]["content"] = content
    
    # Add video information
    json_data["video_info"] = {
        "title": script.video_title or "Untitled",
        "url": script.video_url,
        "duration_seconds": script.video_duration,
        "duration_formatted": format_duration(script.video_duration) if script.video_duration else "0:00",
        "status": script.status,
        "created_at": script.created_at.isoformat() if script.created_at else None,
        "completed_at": script.completed_at.isoformat() if script.completed_at else None
    }
    
    # Add metadata
    total_segments = len(json_data["transcript"])
    json_data["metadata"] = {
        "total_segments": total_segments,
        "export_format": "timestamp_script",
        "export_date": datetime.now().isoformat()
    }
    
    return json.dumps(json_data, indent=2, ensure_ascii=False)

def format_duration(seconds: int) -> str:
    """Format duration in human-readable format"""
    if not seconds:
        return "0:00"
    
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    else:
        return f"{minutes}:{secs:02d}"