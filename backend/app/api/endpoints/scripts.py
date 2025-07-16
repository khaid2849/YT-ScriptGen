from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import json
import io
import re
from datetime import datetime

from ...database import get_db
from ...models import Script
from ...schemas import ScriptWithContent

router = APIRouter()

@router.get("/", response_model=List[ScriptWithContent])
def get_all_scripts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all scripts - no authentication required"""
    scripts = db.query(Script).offset(skip).limit(limit).all()
    return scripts

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
    """Generate JSON content with the required format"""
    
    # Create the JSON structure as per requirements
    json_data = {
        "video_info": {
            "title": script.video_title or "Untitled",
            "url": script.video_url,
            "duration": format_duration(script.video_duration) if script.video_duration else "0:00"
        },
        "formatted_script": []
    }
    
    # Process the formatted script
    if script.formatted_script and isinstance(script.formatted_script, list):
        # If it's already in the correct list format
        for item in script.formatted_script:
            if isinstance(item, dict) and 'timestamp' in item and 'script' in item:
                json_data["formatted_script"].append({
                    "time": item['timestamp'],
                    "text": item['script']
                })
    elif script.formatted_script and isinstance(script.formatted_script, str):
        # Parse string format
        lines = script.formatted_script.split('\n')
        for line in lines:
            line = line.strip()
            if line and '[' in line and ']' in line:
                # Extract timestamp and text
                timestamp_end = line.find(']')
                if timestamp_end != -1:
                    timestamp = line[:timestamp_end + 1]
                    # Find the colon after timestamp
                    content_start = line.find(':', timestamp_end)
                    if content_start != -1:
                        text = line[content_start + 1:].strip()
                        if text:  # Only add if there's actual content
                            json_data["formatted_script"].append({
                                "time": timestamp,
                                "text": text
                            })
    elif script.transcript_text:
        # Fallback: if no formatted script, use plain transcript
        json_data["formatted_script"].append({
            "time": "[00:00]",
            "text": script.transcript_text
        })
    
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