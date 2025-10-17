# Critical Fixes Checklist

## 🔴 URGENT - Fix These Immediately

### 1. Missing Whisper Dependency ⚠️
**Issue:** The application uses `whisper` for transcription but it's not in `requirements.txt`

**Fix:**
```bash
cd backend
# Add to requirements.txt:
echo "openai-whisper==20231117" >> requirements.txt
echo "torch>=2.0.0" >> requirements.txt  
echo "torchaudio>=2.0.0" >> requirements.txt
pip install -r requirements.txt
```

**Impact:** Application will fail when trying to transcribe videos

---

### 2. No Authentication System 🔐
**Issue:** All API endpoints are publicly accessible with no user management

**Risks:**
- Anyone can use your service without limits
- No way to track or bill users
- No protection against abuse
- Cannot implement different user tiers

**What's Needed:**
- JWT-based authentication
- User registration/login
- Password reset functionality
- Session management
- Role-based access control

**Priority:** CRITICAL for production deployment

---

### 3. No Rate Limiting in Development 🚦
**Issue:** Rate limiting only applied in production mode

**Fix in:** `backend/app/main.py` (lines 28-34)

**Current Code:**
```python
# Add rate limiting in production
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        RateLimitMiddleware,
        per_minute=settings.RATE_LIMIT_PER_MINUTE,
        per_hour=settings.RATE_LIMIT_PER_HOUR
    )
```

**Should Always Be Enabled** (even with higher limits in dev)

---

### 4. Weak Database Credentials 🔑
**Issue:** Default passwords in docker-compose.yml

**Current:** `scriptgen_password` (line 9)

**Fix:**
```bash
# Generate strong password
openssl rand -base64 32

# Update docker-compose.yml and backend/.env
```

---

### 5. No File Cleanup Strategy 💾
**Issue:** Temporary files and generated scripts accumulate indefinitely

**Risks:**
- Disk space will fill up
- Increased storage costs
- Performance degradation

**Quick Fix:**
```bash
# Create cleanup cron job
crontab -e

# Add:
0 2 * * * find /path/to/backend/temp_audio -type f -mtime +1 -delete
0 3 * * * find /path/to/backend/generated_scripts -type f -mtime +30 -delete
```

---

### 6. No Error Monitoring 📊
**Issue:** No centralized error tracking or monitoring

**Impact:** You won't know when things break in production

**Quick Fix:**
```bash
# Add Sentry
cd backend
pip install sentry-sdk==1.38.0

# Update requirements.txt
echo "sentry-sdk==1.38.0" >> requirements.txt

# Add to backend/app/main.py:
# import sentry_sdk
# sentry_sdk.init(dsn="YOUR_SENTRY_DSN")
```

---

### 7. No Automated Backups 📦
**Issue:** No database backup strategy

**Risk:** Data loss if server fails

**Quick Fix:**
```bash
# Create backup script
cat > scripts/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T db pg_dump -U scriptgen_user scriptgen | gzip > backup_$DATE.sql.gz
find . -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x scripts/backup.sh

# Add to crontab
crontab -e
# 0 2 * * * /path/to/scripts/backup.sh
```

---

### 8. Missing Test Suite 🧪
**Issue:** No automated tests

**Impact:**
- Cannot confidently make changes
- No way to verify functionality
- Regressions will go unnoticed

**Quick Start:**
```bash
cd backend
pip install pytest pytest-asyncio httpx

# Create tests/test_basic.py
mkdir -p tests
cat > tests/test_basic.py << 'EOF'
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}
EOF

# Run tests
pytest
```

---

## 🟠 HIGH Priority - Next Sprint

### 9. Usage Tracking & Quotas
Without this, you cannot:
- Limit free tier usage
- Implement paid plans
- Track costs per user
- Prevent abuse

### 10. YouTube API Quota Management
YouTube Data API has daily limits (10,000 units). You need:
- Quota monitoring
- Caching of video metadata
- Fallback mechanisms

### 11. Input Validation & Security
Current risks:
- URL injection attacks
- File upload vulnerabilities
- No content type validation

### 12. Database Optimization
Missing indexes will cause slow queries as data grows:
```sql
CREATE INDEX idx_scripts_status ON scripts(status);
CREATE INDEX idx_scripts_created_at ON scripts(created_at DESC);
CREATE INDEX idx_scripts_video_url ON scripts(video_url);
```

---

## 🟡 MEDIUM Priority - This Quarter

### 13. Payment Integration
To monetize your application:
- Stripe or PayPal integration
- Subscription management
- Invoice generation

### 14. Cloud Storage (S3)
Current local storage won't scale:
- Limited disk space
- No redundancy
- Cannot scale horizontally

### 15. CI/CD Pipeline
Automate:
- Testing on every commit
- Deployment to staging/production
- Database migrations

### 16. Monitoring Dashboard
Set up:
- Prometheus + Grafana
- Or use Datadog/New Relic
- Track: API response times, error rates, queue depth

---

## Quick Wins (< 1 Hour Each)

### ✅ Add Missing Dependencies
```bash
cd backend
cat >> requirements.txt << EOF

# Missing dependencies
openai-whisper==20231117
torch>=2.0.0
pytest==7.4.3
pytest-asyncio==0.21.1
sentry-sdk==1.38.0
gunicorn==21.2.0
EOF

pip install -r requirements.txt
```

### ✅ Add Health Check Logging
```python
# backend/app/main.py
@app.get("/health")
def health_check():
    logger.info("Health check called")
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.APP_VERSION
    }
```

### ✅ Add Request ID Tracking
```python
# backend/app/middleware/request_id.py
import uuid
from starlette.middleware.base import BaseHTTPMiddleware

class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

# Add to main.py
app.add_middleware(RequestIdMiddleware)
```

### ✅ Add CORS Configuration Check
```python
# Make sure CORS origins are properly configured in production
# backend/app/config.py - Line 54-56
# Verify CORS_ORIGINS environment variable is set correctly
```

### ✅ Add Database Connection Pool Configuration
```python
# backend/app/database.py
from sqlalchemy.pool import QueuePool

engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=5,
    pool_pre_ping=True,  # Verify connections before using
    echo=settings.DEBUG
)
```

---

## Testing Your Fixes

### 1. Test Whisper Installation
```bash
cd backend
python -c "import whisper; print('✓ Whisper installed correctly')"
```

### 2. Test Database Connection
```bash
cd backend
python -c "from app.database import engine; engine.connect(); print('✓ Database connected')"
```

### 3. Test Redis Connection
```bash
cd backend
python -c "from app.core.redis_client import get_redis_client; get_redis_client().ping(); print('✓ Redis connected')"
```

### 4. Test API Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Create transcription (will fail without auth, but should return 401 not 500)
curl -X POST http://localhost:8000/api/v1/transcribe/ \
  -H "Content-Type: application/json" \
  -d '{"video_url": "https://youtube.com/watch?v=test"}'
```

---

## Estimated Time to Fix

| Priority | Item | Time Estimate |
|----------|------|---------------|
| 🔴 CRITICAL | Add Whisper dependency | 5 minutes |
| 🔴 CRITICAL | Basic auth system | 2-3 days |
| 🔴 CRITICAL | Database backups | 1 hour |
| 🔴 CRITICAL | Input validation | 4-6 hours |
| 🟠 HIGH | Usage tracking | 2-3 days |
| 🟠 HIGH | Error monitoring | 2 hours |
| 🟠 HIGH | Automated tests | 3-5 days |
| 🟠 HIGH | CI/CD pipeline | 1-2 days |

**Total for Critical Items:** ~1 week of focused development
**Total for High Priority:** ~2-3 additional weeks

---

## Next Steps

1. **Today:** Fix missing Whisper dependency
2. **This Week:** Implement authentication system
3. **Next Week:** Set up backups and error monitoring  
4. **This Month:** Complete all critical and high priority items

---

## Questions to Ask Yourself

- [ ] Do I plan to have multiple users?
- [ ] Will I charge for this service?
- [ ] What's my expected traffic volume?
- [ ] What's my budget for infrastructure?
- [ ] Do I need to comply with GDPR/privacy laws?
- [ ] Will I provide an API for developers?
- [ ] What's my disaster recovery plan?

Your answers will help prioritize the requirements.

---

## Resources

- **Main Document:** See `PROJECT_REQUIREMENTS_AND_SPECS.md` for complete details
- **Deployment Guide:** See `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **API Docs:** http://localhost:8000/docs (when running)

---

**Remember:** Start with security and stability, then add features. A secure, stable application with fewer features is better than a feature-rich application that's insecure or unreliable.

