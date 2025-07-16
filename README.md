# YouTube Script Generator

A web application that automatically converts YouTube videos into timestamped text scripts.

## ✨ Features

- 🔗 Simple YouTube URL input
- ⏱️ Automatic timestamp generation
- 📄 Multiple export formats (TXT, JSON)
- ⚡ Real-time processing updates

## 🗒️ Prerequisites
Before you begin, ensure you have the following installed on your system:
- Redis
- Postgresql
- Node.js
- Configure required environment variables file .env in /backend and /frontend folder:
```bash
#YT-ScriptGen/backend/.env
DATABASE_URL=postgresql://scriptgen_admin:123456@localhost/scriptgen
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
SECRET_KEY={{YOUR SECRET KEY}}

#YT-ScriptGen/frontend/.env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/YT-ScriptGen.git

# Backend setup
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend setup
cd frontend && npm install && npm start

# Start workers
celery -A app.celery worker --loglevel=info
```

## 🎯 Usage

1. Enter YouTube URL
2. Click "Generate Script"
3. Monitor real-time progress
4. Download formatted transcript

## 📝 Output Format

```
[00:00 - 00:05]: Hello welcome to my videos
[00:06 - 00:10]: Let's have a look at the overview of what we gonna talk about today
```

## 🤝 Contributing

Fork the repo, create a feature branch, and submit a pull request.

## 📄 License

MIT License

---

Made with ❤️ for content creators and accessibility
