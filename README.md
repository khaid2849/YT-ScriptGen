# YouTube Script Generator & Media Downloader

A comprehensive web application that converts YouTube videos into timestamped text scripts and provides video/audio downloading functionality with modern dark/light theme support.

## ✨ Features

### Script Generation

- 🔗 Simple YouTube URL input
- ⏱️ Automatic timestamp generation
- 📄 Multiple export formats (TXT, JSON, Plain Text)
- ⚡ Real-time processing updates
- 📋 One-click copy to clipboard
- 🎥 Video quality selection for downloads

### Media Downloads

- 📥 Single video/audio downloads
- 📦 Bulk downloads (up to 10 files as ZIP)
- 🎬 Multiple video quality options (Best, 720p, 480p)
- 🎵 High-quality MP3 audio extraction
- ⏳ Real-time download progress tracking
- 📊 Download status monitoring
- 🏷️ Smart filename generation using video titles

### User Experience

- 🌙 Dark/Light theme toggle with system preference detection
- 📱 Fully responsive design for all devices
- 💾 Theme preference persistence
- ⚡ Smooth transitions and animations
- 🎯 Intuitive two-column layout for generated content

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

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ for content creators and accessibility

**Note**: This tool is for educational and personal use. Please respect YouTube's Terms of Service and copyright laws when downloading content.
