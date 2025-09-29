"""Security middleware for production deployment."""
import time
from typing import Dict, Any
from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict, deque
import asyncio

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, per_minute: int = 60, per_hour: int = 1000):
        super().__init__(app)
        self.per_minute = per_minute
        self.per_hour = per_hour
        self.requests: Dict[str, deque] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        client_ip = self.get_client_ip(request)
        current_time = time.time()

        # Clean old requests
        self.cleanup_old_requests(client_ip, current_time)

        # Check rate limits
        if self.is_rate_limited(client_ip, current_time):
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Too many requests."
            )

        # Add current request
        self.requests[client_ip].append(current_time)

        response = await call_next(request)
        return response

    def get_client_ip(self, request: Request) -> str:
        """Get client IP from request."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def cleanup_old_requests(self, client_ip: str, current_time: float):
        """Remove requests older than 1 hour."""
        if client_ip in self.requests:
            while (self.requests[client_ip] and
                   current_time - self.requests[client_ip][0] > 3600):
                self.requests[client_ip].popleft()

    def is_rate_limited(self, client_ip: str, current_time: float) -> bool:
        """Check if client is rate limited."""
        requests = self.requests[client_ip]

        # Check per-minute limit
        minute_ago = current_time - 60
        minute_requests = sum(1 for req_time in requests if req_time > minute_ago)
        if minute_requests >= self.per_minute:
            return True

        # Check per-hour limit
        hour_ago = current_time - 3600
        hour_requests = sum(1 for req_time in requests if req_time > hour_ago)
        if hour_requests >= self.per_hour:
            return True

        return False


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Only add HSTS in production with HTTPS
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response