  ---
  YT-ScriptGen User Management Features - Detailed Requirements & Specifications

  Based on my analysis of your codebase (FastAPI backend + React frontend + PostgreSQL + Celery), here's a comprehensive specification for adding user management features.

  ---
  📋 OVERVIEW

  Current State: Your application is completely public with no authentication. All scripts are globally accessible.

  Goal: Transform it into a multi-user platform where users can:
  - Register/login with email or Google OAuth
  - Manage their own videos, audios, and scripts privately
  - Search and organize their content
  - Customize their profile settings

  ---
  🔐 1. AUTHENTICATION & AUTHORIZATION

  1.1 Email-based Authentication

  Backend Requirements:

  New Database Tables:
  # User model
  class User(Base):
      id: Integer (PK, auto-increment)
      email: String (unique, indexed, not null)
      password_hash: String (not null) - bcrypt hashed
      full_name: String (optional)
      is_active: Boolean (default: True)
      is_verified: Boolean (default: False)
      email_verified_at: DateTime (nullable)
      created_at: DateTime (server default: now())
      updated_at: DateTime (onupdate: now())
      last_login_at: DateTime (nullable)

      # OAuth fields
      google_id: String (unique, nullable, indexed)
      avatar_url: String (nullable)

      # Relationships
      scripts: relationship to Script (one-to-many)
      videos: relationship to Video (one-to-many)
      audios: relationship to Audio (one-to-many)
      folders: relationship to Folder (one-to-many)

  Security Requirements:
  - Password hashing: Use passlib with bcrypt (12 rounds minimum)
  - Password validation: Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
  - JWT tokens for authentication:
    - Access token: 15-30 minutes expiry
    - Refresh token: 7 days expiry, stored in DB for revocation
    - HS256 algorithm with strong SECRET_KEY
  - CSRF protection for state-changing operations
  - Rate limiting on auth endpoints (max 5 login attempts per 15 min per IP)

  New API Endpoints:
  POST   /api/v1/auth/register
         Request: {email, password, full_name (optional)}
         Response: {message, user_id}

  POST   /api/v1/auth/login
         Request: {email, password}
         Response: {access_token, refresh_token, user: {...}}

  POST   /api/v1/auth/refresh
         Request: {refresh_token}
         Response: {access_token}

  POST   /api/v1/auth/logout
         Headers: Authorization Bearer token
         Request: {refresh_token}
         Response: {message}

  POST   /api/v1/auth/verify-email
         Request: {token}
         Response: {message}

  POST   /api/v1/auth/resend-verification
         Request: {email}
         Response: {message}

  POST   /api/v1/auth/forgot-password
         Request: {email}
         Response: {message}

  POST   /api/v1/auth/reset-password
         Request: {token, new_password}
         Response: {message}

  GET    /api/v1/auth/me
         Headers: Authorization Bearer token
         Response: {user: {...}}

  Email Verification Flow:
  1. On registration, generate verification token (JWT with 24h expiry)
  2. Send email with verification link
  3. User clicks link → frontend calls /verify-email
  4. Mark is_verified = True, set email_verified_at
  5. Until verified, limit user actions (can't create scripts)

  Dependencies to Add:
  passlib[bcrypt]
  python-jose[cryptography]  # For JWT
  python-multipart  # For form data

  ---
  1.2 Google OAuth Authentication

  Backend Requirements:

  OAuth Flow:
  1. Frontend redirects to Google OAuth consent screen
  2. Google redirects back with authorization code
  3. Backend exchanges code for user info
  4. Check if user exists by google_id or email
  5. If new user: create account with google_id
  6. Return JWT tokens

  New Endpoints:
  GET    /api/v1/auth/google/login
         Response: {authorization_url}

  POST   /api/v1/auth/google/callback
         Request: {code, state}
         Response: {access_token, refresh_token, user: {...}}

  POST   /api/v1/auth/google/link
         Headers: Authorization Bearer token
         Request: {code}
         Response: {message}  # Link Google to existing account

  Dependencies:
  authlib  # OAuth 2.0 client
  httpx    # For async HTTP requests to Google

  Configuration (.env):
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

  Frontend Requirements:

  New Pages/Components:
  - /login - Login form + "Sign in with Google" button
  - /register - Registration form + "Sign up with Google" button
  - /verify-email - Email verification landing page
  - /reset-password - Password reset form
  - PrivateRoute component - Wraps protected routes

  State Management:
  - Create AuthContext (similar to existing ThemeContext):
    - Store: user, accessToken, isAuthenticated, isLoading
    - Methods: login(), logout(), register(), refreshToken()
    - Auto-refresh token before expiry
    - Persist refresh token in httpOnly cookie (recommended) or localStorage

  API Client Updates:
  - Add Authorization header to all authenticated requests
  - Implement token refresh interceptor
  - Handle 401 errors (redirect to login)

  Dependencies:
  "@react-oauth/google": "^0.12.1"  // Google OAuth for React
  "jwt-decode": "^4.0.0"            // Decode JWT

  ---
  📁 2. USER'S VIDEOS, AUDIOS, SCRIPTS MANAGEMENT

  2.1 Database Schema Changes

  Modify Existing Script Table:
  class Script(Base):
      # ... existing fields ...
      user_id: Integer (ForeignKey('users.id'), not null, indexed)
      folder_id: Integer (ForeignKey('folders.id'), nullable, indexed)
      tags: JSON (list of strings, default: [])
      is_favorite: Boolean (default: False)
      is_archived: Boolean (default: False)
      last_accessed_at: DateTime (nullable)

      # New relationship
      user: relationship('User', back_populates='scripts')
      folder: relationship('Folder', back_populates='scripts')

  New Tables:

  class Video(Base):
      """Downloaded videos library"""
      __tablename__ = "videos"

      id: Integer (PK)
      user_id: Integer (ForeignKey('users.id'), not null, indexed)
      folder_id: Integer (ForeignKey('folders.id'), nullable, indexed)

      # Video metadata
      video_url: String (not null)
      title: String (not null)
      duration: Integer (seconds)
      thumbnail_url: String (nullable)
      quality: String (e.g., "720p", "best")

      # File info
      file_path: String (not null)
      file_size: Integer (bytes)
      file_format: String (e.g., "mp4")

      # Organization
      tags: JSON (list of strings, default: [])
      is_favorite: Boolean (default: False)
      is_archived: Boolean (default: False)

      # Timestamps
      downloaded_at: DateTime (server default: now())
      last_accessed_at: DateTime (nullable)

      # Relationships
      user: relationship('User', back_populates='videos')
      folder: relationship('Folder', back_populates='videos')

  class Audio(Base):
      """Downloaded/extracted audios library"""
      __tablename__ = "audios"

      id: Integer (PK)
      user_id: Integer (ForeignKey('users.id'), not null, indexed)
      folder_id: Integer (ForeignKey('folders.id'), nullable, indexed)

      # Audio metadata
      source_url: String (nullable)  # YouTube URL if extracted
      title: String (not null)
      duration: Integer (seconds)

      # File info
      file_path: String (not null)
      file_size: Integer (bytes)
      file_format: String (e.g., "mp3", "wav")

      # Organization
      tags: JSON (list of strings, default: [])
      is_favorite: Boolean (default: False)
      is_archived: Boolean (default: False)

      # Timestamps
      created_at: DateTime (server default: now())
      last_accessed_at: DateTime (nullable)

      # Relationships
      user: relationship('User', back_populates='audios')
      folder: relationship('Folder', back_populates='audios')

  class Folder(Base):
      """Folders for organizing content"""
      __tablename__ = "folders"

      id: Integer (PK)
      user_id: Integer (ForeignKey('users.id'), not null, indexed)
      parent_folder_id: Integer (ForeignKey('folders.id'), nullable, indexed)

      name: String (not null)
      color: String (nullable)  # Hex color for UI
      icon: String (nullable)   # Icon name
      description: Text (nullable)

      # Organization
      is_archived: Boolean (default: False)

      # Timestamps
      created_at: DateTime (server default: now())
      updated_at: DateTime (onupdate: now())

      # Relationships
      user: relationship('User', back_populates='folders')
      parent: relationship('Folder', remote_side=[id])
      children: relationship('Folder', back_populates='parent')
      scripts: relationship('Script', back_populates='folder')
      videos: relationship('Video', back_populates='folder')
      audios: relationship('Audio', back_populates='folder')

  Migration Strategy:
  1. Create Alembic migration for new tables
  2. Add migration to add user_id to existing scripts table
  3. For existing scripts: Either delete or assign to admin user

  ---
  2.2 Content Management API Endpoints

  Scripts Management:
  GET    /api/v1/scripts
         Query params:
           - folder_id (optional)
           - is_favorite (optional)
           - is_archived (optional, default: False)
           - search (optional) - search in title/transcript
           - tags (optional, comma-separated)
           - sort_by (created_at, title, duration)
           - order (asc, desc)
           - page, limit
         Response: {items: [...], total, page, total_pages}

  GET    /api/v1/scripts/{id}
         Response: Script with full content

  PATCH  /api/v1/scripts/{id}
         Request: {folder_id, tags, is_favorite, is_archived}
         Response: Updated script

  DELETE /api/v1/scripts/{id}
         Response: {message}

  POST   /api/v1/scripts/{id}/move
         Request: {folder_id}
         Response: Updated script

  POST   /api/v1/scripts/{id}/duplicate
         Response: New script copy

  Videos Management:
  GET    /api/v1/videos
         Query params: Similar to scripts
         Response: {items: [...], total, page, total_pages}

  GET    /api/v1/videos/{id}
         Response: Video metadata + download URL

  POST   /api/v1/videos
         Request: {url, quality, folder_id (optional), tags (optional)}
         Response: {task_id, video_id}

  PATCH  /api/v1/videos/{id}
         Request: {folder_id, tags, is_favorite, is_archived, title}
         Response: Updated video

  DELETE /api/v1/videos/{id}
         Response: {message} - Also delete file

  GET    /api/v1/videos/{id}/download
         Response: File stream

  Audios Management:
  GET    /api/v1/audios
         Query params: Similar to scripts/videos
         Response: {items: [...], total, page, total_pages}

  GET    /api/v1/audios/{id}
         Response: Audio metadata + download URL

  POST   /api/v1/audios
         Request: {url, folder_id (optional), tags (optional)}
         Response: {task_id, audio_id}

  PATCH  /api/v1/audios/{id}
         Request: {folder_id, tags, is_favorite, is_archived, title}
         Response: Updated audio

  DELETE /api/v1/audios/{id}
         Response: {message} - Also delete file

  Folders Management:
  GET    /api/v1/folders
         Query params: parent_folder_id (optional), include_archived
         Response: {items: [...]}

  POST   /api/v1/folders
         Request: {name, parent_folder_id (optional), color, icon}
         Response: New folder

  PATCH  /api/v1/folders/{id}
         Request: {name, color, icon, parent_folder_id}
         Response: Updated folder

  DELETE /api/v1/folders/{id}
         Query params: move_items_to (optional) - move or delete contents
         Response: {message}

  Bulk Operations:
  POST   /api/v1/bulk/delete
         Request: {type: "scripts"|"videos"|"audios", ids: [...]}
         Response: {deleted_count}

  POST   /api/v1/bulk/move
         Request: {type, ids: [...], folder_id}
         Response: {updated_count}

  POST   /api/v1/bulk/tag
         Request: {type, ids: [...], tags: [...], action: "add"|"remove"}
         Response: {updated_count}

  ---
  2.3 Search & Filtering Features

  Search Implementation:

  Backend:
  - Use PostgreSQL full-text search (using tsvector)
  - Search across: video_title, transcript_text, tags
  - Add GIN index for performance
  CREATE INDEX scripts_search_idx ON scripts
  USING GIN(to_tsvector('english', coalesce(video_title, '') || ' ' || coalesce(transcript_text, '')));

  Search Endpoint:
  GET    /api/v1/search
         Query params:
           - q (search query)
           - type (all, scripts, videos, audios)
           - filters (JSON): {tags, date_range, duration_range}
           - sort_by (relevance, date, title)
           - page, limit
         Response: {
           scripts: [...],
           videos: [...],
           audios: [...],
           total: {scripts: 10, videos: 5, audios: 3}
         }

  Filters:
  - Date range: created_after, created_before
  - Duration range: min_duration, max_duration
  - Tags: tags=tag1,tag2 (AND or OR logic)
  - Favorites only: is_favorite=true
  - By folder: folder_id=123 (include subfolders option)

  Frontend Search Features:
  - Global search bar in navbar
  - Advanced search modal with filters
  - Search suggestions/autocomplete
  - Recent searches history (localStorage)
  - Saved search queries

  ---
  2.4 Organization Features

  Tags System:
  - User-specific tags (each user has their own tag namespace)
  - Auto-suggest existing tags while typing
  - Tag cloud/popular tags view
  - Color-coded tags

  Favorites:
  - Quick "star" button on all items
  - Dedicated favorites view
  - Keyboard shortcut (F key)

  Archive:
  - Soft delete (archive instead of permanent delete)
  - View archived items separately
  - Restore from archive
  - Permanent delete from archive

  Folders:
  - Nested folders (tree structure)
  - Drag-and-drop to move items (frontend)
  - Breadcrumb navigation
  - Folder sharing (future feature)

  ---
  👤 3. USER PROFILE MANAGEMENT

  3.1 Profile Settings

  User Preferences Table:
  class UserPreference(Base):
      __tablename__ = "user_preferences"

      user_id: Integer (PK, ForeignKey('users.id'))

      # UI preferences
      theme: String (default: "system")  # light, dark, system
      language: String (default: "en")   # en, vi, etc.

      # Transcription defaults
      default_whisper_model: String (default: "base")
      default_video_quality: String (default: "best")

      # Notifications
      email_notifications: Boolean (default: True)
      notification_on_completion: Boolean (default: True)

      # Storage
      auto_cleanup_days: Integer (default: 30)  # Auto-delete after X days
      max_storage_gb: Integer (default: 10)

      # Privacy
      profile_visibility: String (default: "private")

      # Updated timestamp
      updated_at: DateTime (onupdate: now())

  Profile API Endpoints:
  GET    /api/v1/profile
         Response: {user: {...}, preferences: {...}, stats: {...}}

  PATCH  /api/v1/profile
         Request: {full_name, avatar (file upload)}
         Response: Updated user

  PATCH  /api/v1/profile/preferences
         Request: {theme, language, default_whisper_model, ...}
         Response: Updated preferences

  POST   /api/v1/profile/avatar
         Request: FormData with image file
         Response: {avatar_url}

  DELETE /api/v1/profile/avatar
         Response: {message}

  POST   /api/v1/profile/change-password
         Request: {current_password, new_password}
         Response: {message}

  DELETE /api/v1/profile/account
         Request: {password, confirmation: "DELETE"}
         Response: {message}

  Usage Statistics:
  GET    /api/v1/profile/stats
         Response: {
           total_scripts: 45,
           total_videos: 20,
           total_audios: 15,
           storage_used_bytes: 5242880000,
           storage_limit_bytes: 10737418240,
           scripts_this_month: 5,
           last_activity: "2025-10-20T15:30:00Z"
         }

  Activity Log:
  class ActivityLog(Base):
      """Track user actions for activity feed"""
      __tablename__ = "activity_logs"

      id: Integer (PK)
      user_id: Integer (ForeignKey('users.id'), indexed)

      action_type: String (e.g., "script_created", "video_downloaded")
      resource_type: String (e.g., "script", "video")
      resource_id: Integer (nullable)
      metadata: JSON (additional context)

      created_at: DateTime (server default: now())

  GET    /api/v1/profile/activity
         Query params: page, limit, action_type
         Response: {items: [...], total}

  ---
  3.2 Frontend Profile Pages

  New Routes:
  - /profile - Profile overview + edit form
  - /profile/settings - Preferences & settings
  - /profile/security - Password change, 2FA (future)
  - /profile/activity - Activity log
  - /profile/storage - Storage usage breakdown

  Profile Components:
  - Avatar upload with crop/resize
  - Stats dashboard (charts for usage over time)
  - Recent activity feed
  - Storage usage pie chart

  ---
  🔒 4. AUTHORIZATION & SECURITY

  4.1 Access Control

  Authorization Middleware:
  # Dependency for protected endpoints
  async def get_current_user(token: str = Depends(oauth2_scheme)):
      # Verify JWT, return User object

  async def get_current_active_user(current_user: User = Depends(get_current_user)):
      if not current_user.is_active:
          raise HTTPException(403, "User account is disabled")
      return current_user

  Resource Ownership Check:
  def verify_script_ownership(script: Script, user: User):
      if script.user_id != user.id:
          raise HTTPException(403, "Not authorized to access this resource")

  Apply to All Endpoints:
  - All existing endpoints must require authentication
  - Check resource ownership before allowing access/modification
  - Return 404 (not 403) for resources user doesn't own (security best practice)

  ---
  4.2 Rate Limiting

  Update Rate Limiting Strategy:
  - Current: IP-based rate limiting
  - New: User-based rate limiting (higher limits for authenticated users)

  Tiers:
  Anonymous: 10 requests/minute, 100/hour
  Authenticated: 60 requests/minute, 1000/hour
  Premium (future): 200 requests/minute, 5000/hour

  Endpoint-specific limits:
  POST /transcribe: 5/hour (authenticated), 1/hour (anonymous)
  POST /download/video: 10/hour (authenticated)

  ---
  4.3 Storage Quotas

  Implement Storage Tracking:
  class StorageQuota:
      def check_user_storage(user_id: int) -> dict:
          # Calculate total file sizes
          # Return: {used_bytes, limit_bytes, available_bytes}

      def enforce_quota(user_id: int, file_size: int):
          # Raise exception if quota exceeded

  Apply Before File Operations:
  - Before downloading video/audio
  - Before saving script files
  - Show warning at 80% usage

  ---
  📱 5. FRONTEND CHANGES

  5.1 New UI Components

  Layout Changes:
  - Add user menu dropdown in navbar (avatar, name, settings, logout)
  - Add sidebar for navigation (Dashboard, Scripts, Videos, Audios, Folders)
  - Breadcrumb navigation for folders

  New Pages:
  1. Dashboard (/dashboard):
    - Quick stats (total scripts/videos/audios)
    - Recent activity
    - Quick actions (new transcription, download video)
    - Storage usage
  2. Library Views:
    - /library/scripts - Grid/list view with filters
    - /library/videos - Grid/list view
    - /library/audios - Grid/list view
    - /library/favorites - All favorites
    - /library/folders/:id - Folder contents
  3. Search (/search):
    - Global search results
    - Filters sidebar
    - Grouped by type

  Components:
  /components/Library/
    - ItemCard.js (reusable for script/video/audio)
    - ItemGrid.js
    - ItemList.js
    - FilterSidebar.js
    - SortDropdown.js
    - BulkActions.js

  /components/Folders/
    - FolderTree.js
    - FolderBreadcrumb.js
    - CreateFolderModal.js
    - MoveFolderModal.js

  /components/Profile/
    - ProfileHeader.js
    - AvatarUpload.js
    - PreferencesForm.js
    - ActivityFeed.js
    - StorageUsage.js

  ---
  5.2 State Management Expansion

  New Contexts:
  // AuthContext
  {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    login: (credentials) => Promise,
    logout: () => Promise,
    register: (data) => Promise,
    refreshToken: () => Promise
  }

  // LibraryContext (optional, or use React Query)
  {
    scripts: Script[],
    videos: Video[],
    audios: Audio[],
    folders: Folder[],
    fetchScripts: (filters) => Promise,
    ...
  }

  Consider Adding:
  - React Query (TanStack Query) for server state management
    - Automatic caching, refetching, pagination
    - Better than Context for data fetching
    - Recommended for this use case

  ---
  🎨 6. UX/UI RECOMMENDATIONS

  6.1 Design System

  Components Library:
  - Use existing Tailwind + Lucide icons
  - Consider adding: shadcn/ui or Headless UI for accessible components
    - Modal dialogs
    - Dropdown menus
    - Tabs
    - Command palette (Cmd+K search)

  Color Coding:
  - Scripts: Blue
  - Videos: Red/Purple
  - Audios: Green
  - Folders: Yellow/Orange

  ---
  6.2 User Experience Enhancements

  Onboarding:
  - Welcome modal for new users
  - Quick tour of features
  - Sample script/video to explore

  Empty States:
  - Friendly messages when library is empty
  - Call-to-action buttons ("Create your first script")

  Loading States:
  - Skeleton screens for lists
  - Progress bars for uploads/downloads

  Error Handling:
  - User-friendly error messages
  - Retry buttons
  - Contact support link

  Keyboard Shortcuts:
  - Cmd+K: Global search
  - F: Toggle favorite
  - Del: Delete selected
  - Esc: Close modals

  Drag & Drop:
  - Drag files to upload
  - Drag items to folders
  - Drag to reorder

  ---
  📊 7. ANALYTICS & MONITORING (OPTIONAL)

  User Analytics:
  - Track: Registrations, logins, script creations, downloads
  - Tools: Mixpanel, PostHog, or custom with ActivityLog

  Error Tracking:
  - Sentry for backend errors
  - Frontend error boundary with Sentry

  Performance Monitoring:
  - API response times
  - Database query performance (pg_stat_statements)
  - Celery task durations

  ---
  🚀 8. IMPLEMENTATION ROADMAP

  Phase 1: Authentication (Week 1-2)

  1. Create User model & database migration
  2. Implement email auth endpoints (register, login, logout)
  3. Add JWT middleware
  4. Create frontend AuthContext
  5. Build login/register pages
  6. Add email verification

  Phase 2: Google OAuth (Week 2-3)

  7. Implement Google OAuth backend
  8. Add Google sign-in button to frontend
  9. Test OAuth flow

  Phase 3: Data Ownership (Week 3-4)

  10. Add user_id to Script model (migration)
  11. Update all existing endpoints to filter by user
  12. Create Video & Audio models
  13. Update download endpoints to save to user library
  14. Add authorization checks to all endpoints

  Phase 4: Content Management (Week 4-6)

  15. Create Folder model
  16. Implement folder CRUD endpoints
  17. Build folder UI (tree, breadcrumb)
  18. Add tags support to all models
  19. Implement favorites & archive
  20. Build library pages (scripts, videos, audios)

  Phase 5: Search & Filtering (Week 6-7)

  21. Implement full-text search backend
  22. Build search API endpoint
  23. Create search UI with filters
  24. Add sorting options

  Phase 6: Profile & Preferences (Week 7-8)

  25. Create UserPreference model
  26. Implement profile endpoints
  27. Build profile pages
  28. Add avatar upload
  29. Implement storage quotas

  Phase 7: Polish & Testing (Week 8-10)

  30. Add activity logging
  31. Build dashboard with stats
  32. Implement bulk operations
  33. Add loading/error states
  34. Write tests (pytest, Jest)
  35. Security audit
  36. Performance optimization

  ---
  🔧 9. TECHNICAL DEPENDENCIES TO ADD

  Backend:

  # requirements.txt additions
  passlib[bcrypt]==1.7.4
  python-jose[cryptography]==3.3.0
  python-multipart==0.0.6
  authlib==1.3.0
  httpx==0.25.2
  pillow==10.1.0  # For avatar image processing

  Frontend:

  {
    "dependencies": {
      "@react-oauth/google": "^0.12.1",
      "jwt-decode": "^4.0.0",
      "@tanstack/react-query": "^5.17.0",  // Recommended
      "react-dropzone": "^14.2.3",  // For file uploads
      "react-hot-keys": "^2.7.2"  // Keyboard shortcuts
    }
  }

  ---
  🔐 10. SECURITY CONSIDERATIONS

  Must Implement:
  1. HTTPS only in production
  2. Secure cookie settings (HttpOnly, Secure, SameSite)
  3. CORS configuration (limit origins)
  4. Input validation on all endpoints (Pydantic)
  5. SQL injection prevention (use SQLAlchemy ORM)
  6. XSS prevention (React handles this, but sanitize in API responses)
  7. File upload validation (size, type, malware scan)
  8. Rate limiting (already partially implemented)
  9. Secrets in environment variables (never in code)
  10. Regular security updates (dependabot)

  Recommended:
  - Add 2FA (TOTP) in future
  - Add password breach detection (HaveIBeenPwned API)
  - Add CAPTCHA on registration (hCaptcha)
  - Implement CSP headers (already in middleware)
  - Add audit logs for sensitive actions

  ---
  💾 11. DATABASE MIGRATION STRATEGY

  Alembic Setup:
  # Initialize Alembic (if not done)
  cd backend
  alembic init alembic

  # Create migrations
  alembic revision --autogenerate -m "Add user authentication"
  alembic revision --autogenerate -m "Add video and audio models"
  alembic revision --autogenerate -m "Add folder and preferences models"

  # Apply migrations
  alembic upgrade head

  Handle Existing Data:
  - Option 1: Delete all existing scripts (if test data)
  - Option 2: Create admin user, assign all scripts to admin
  - Option 3: Mark existing scripts as "legacy" with null user_id (not recommended)

  ---
  📈 12. SCALABILITY CONSIDERATIONS

  File Storage:
  - Current: Local filesystem
  - Future: S3-compatible storage (AWS S3, MinIO, Cloudflare R2)
    - Benefits: CDN, scalability, backups
    - Add boto3 library

  Database:
  - Add indexes on: user_id, folder_id, created_at, tags (GIN)
  - Consider read replicas if traffic grows
  - Regular VACUUM and ANALYZE

  Celery:
  - Increase workers for concurrent transcriptions
  - Separate queues for priority tasks
  - Add task result cleanup

  Caching:
  - Redis for frequently accessed data (user sessions, folder trees)
  - Frontend: React Query caching

  ---
  🎯 13. ADDITIONAL FEATURE SUGGESTIONS

  Nice-to-Have Features:
  1. Collaboration:
    - Share scripts/folders with other users
    - Public links with expiry
  2. Export/Import:
    - Export all data as ZIP
    - Import from other services
  3. Advanced Transcription:
    - Custom vocabulary/terminology
    - Multi-speaker detection
    - Timestamp editing
  4. Templates:
    - Script templates for common formats
    - Quick formatting presets
  5. Integrations:
    - Export to Google Drive, Dropbox
    - Webhook notifications
    - API keys for programmatic access
  6. Mobile App:
    - React Native mobile app
    - Push notifications
  7. Premium Tiers:
    - Free: 10 scripts/month, 1GB storage
    - Pro: Unlimited scripts, 100GB storage, priority processing
    - Implement with Stripe/PayPal

  ---
  📝 SUMMARY

  This is a comprehensive user management system that will transform your public app into a full-featured SaaS platform. The implementation is structured in phases to allow
  incremental development and testing.

  Estimated Effort: 8-10 weeks for full implementation (1 developer)

  Priority Order:
  1. Authentication (email + Google OAuth) - Critical
  2. Data ownership & authorization - Critical
  3. Content management (folders, tags) - High
  4. Search & filtering - High
  5. Profile & preferences - Medium
  6. Analytics & advanced features - Low

  ---
  Would you like me to:
  1. Start implementing any specific phase?
  2. Create detailed API endpoint specifications with request/response examples?
  3. Generate database migration files?
  4. Set up the authentication system first?
  5. Create mockups or wireframes for the UI?

  Let me know which direction you'd like to take!