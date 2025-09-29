"""Logging configuration for the application."""
import logging
import sys
from typing import Optional
from pathlib import Path
from datetime import datetime

from ..config import settings


def setup_logging() -> logging.Logger:
    """Set up application logging."""
    # Create logger
    logger = logging.getLogger("yt_scriptgen")
    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    # Avoid duplicate handlers
    if logger.handlers:
        return logger

    # Create formatters
    if settings.DEBUG:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File handler for production
    if settings.ENVIRONMENT == "production":
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)

        file_handler = logging.FileHandler(
            log_dir / f"app_{datetime.now().strftime('%Y%m%d')}.log"
        )
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

        # Error file handler
        error_handler = logging.FileHandler(
            log_dir / f"errors_{datetime.now().strftime('%Y%m%d')}.log"
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(formatter)
        logger.addHandler(error_handler)

    return logger


# Create the logger instance
logger = setup_logging()


def log_request(method: str, path: str, client_ip: str, duration: Optional[float] = None):
    """Log HTTP requests."""
    message = f"{method} {path} from {client_ip}"
    if duration is not None:
        message += f" took {duration:.3f}s"
    logger.info(message)


def log_error(error: Exception, context: str = ""):
    """Log errors with context."""
    message = f"Error in {context}: {str(error)}" if context else f"Error: {str(error)}"
    logger.error(message, exc_info=True)


def log_task_start(task_name: str, task_id: str, **kwargs):
    """Log task start."""
    extra_info = " ".join([f"{k}={v}" for k, v in kwargs.items()])
    logger.info(f"Task {task_name} started - ID: {task_id} {extra_info}")


def log_task_complete(task_name: str, task_id: str, duration: float, **kwargs):
    """Log task completion."""
    extra_info = " ".join([f"{k}={v}" for k, v in kwargs.items()])
    logger.info(f"Task {task_name} completed - ID: {task_id} Duration: {duration:.2f}s {extra_info}")


def log_task_error(task_name: str, task_id: str, error: Exception):
    """Log task errors."""
    logger.error(f"Task {task_name} failed - ID: {task_id} Error: {str(error)}", exc_info=True)