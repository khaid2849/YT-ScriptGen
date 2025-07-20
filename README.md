# YouTube Script Generator & Video Downloader

A comprehensive web application that converts YouTube videos into timestamped text scripts and provides video downloading functionality.

## ✨ Features

### Script Generation

- 🔗 Simple YouTube URL input
- ⏱️ Automatic timestamp generation
- 📄 Multiple export formats (TXT, JSON)
- ⚡ Real-time processing updates

### Video Downloads

- 📥 Single video downloads
- 📦 Bulk video downloads (up to 10 videos as ZIP)
- 🎬 Multiple quality options (Best, 720p, 480p)
- ⏳ Real-time download progress tracking
- 📊 Download status monitoring

## 🗒️ Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Redis** - For task queue management
- **PostgreSQL** - For database storage
- **Node.js** - For frontend development
- **Python 3.8+** - For backend services
- **FFmpeg** - For audio/video processing

## ⚙️ Environment Configuration

Configure required environment variables in `.env` files:

### Backend Environment (`/backend/.env`)

```bash
# Database
DATABASE_URL=postgresql://scriptgen_user:password@localhost/scriptgen

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# Email Configuration (Optional - for contact form notifications)
# For Gmail: Enable 2FA and use App Password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@scriptgen.app
# Note: If email is not configured, contact messages will only be saved to files
```

### Frontend Environment (`/frontend/.env`)

```bash
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/YT-ScriptGen.git
cd YT-ScriptGen
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Set up database (ensure PostgreSQL is running)
cd backend
alembic upgrade head

# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
# Install and start React app
cd frontend
npm install
npm start
```

### 4. Start Background Workers

```bash
# In a new terminal, start Celery workers
cd backend
celery -A app.celery worker --loglevel=info
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🎯 Usage

### Script Generation

1. Navigate to the Generate page
2. Enter a YouTube URL
3. Click "Generate Script"
4. Monitor real-time progress
5. Download formatted transcript in TXT or JSON format

### Video Downloads

1. Navigate to the Download page
2. Choose single or multiple video mode
3. Enter YouTube URL(s)
4. Select desired quality (Best/720p/480p)
5. Click download and monitor progress
6. Download files when complete

## 📝 Output Formats

### Script Format

```
[00:00 - 00:05]: Hello welcome to my videos
[00:06 - 00:10]: Let's have a look at the overview of what we gonna talk about today
```

### Download Formats

- **Single Video**: Direct MP4 download
- **Multiple Videos**: ZIP file containing all videos + download summary

## 🔧 API Endpoints

### Script Generation

- `POST /api/v1/generate` - Generate script from YouTube URL
- `GET /api/v1/task/{task_id}` - Check generation status
- `GET /api/v1/script/{script_id}/download` - Download script file

### Video Downloads

- `POST /api/v1/download/video` - Download single video (async)
- `POST /api/v1/download/video/direct` - Download single video (sync)
- `POST /api/v1/download/videos` - Download multiple videos as ZIP
- `GET /api/v1/download/status/{task_id}` - Check download status
- `GET /api/v1/download/file/{task_id}` - Download completed file

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ for content creators and accessibility

**Note**: This tool is for educational and personal use. Please respect YouTube's Terms of Service and copyright laws when downloading content.
