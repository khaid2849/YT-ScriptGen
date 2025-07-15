# YouTube Script Generator

A web application that automatically converts YouTube videos into timestamped text scripts.

## ✨ Features

- 🔗 Simple YouTube URL input
- ⏱️ Automatic timestamp generation
- 📄 Multiple export formats (TXT, JSON)
- ⚡ Real-time processing updates

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/youtube-script-generator.git

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
