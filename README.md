ClassSync - Assignment Management System
=======================================

A modern classroom platform to manage users, assignments, and submissions with a role-based admin panel.

Tech Stack
----------
- Backend: Node.js, Express, TypeScript, MongoDB (Mongoose)
- Frontend: React (Vite), TypeScript, Material UI
- Auth: JWT with role-based access (student, teacher, admin)
- Document Processing: pdf-parse (PDF), mammoth (DOCX)
- Similarity Detection: TF-IDF, Cosine Similarity, Content Hashing (SHA256)

Monorepo Structure
------------------
- `server/` Express API (TypeScript)
- `client/` React app (Vite + MUI)

Features
--------
- Admin dashboard: system overview, user activity
- User management (admin): list/create users by role
- Assignments: create/list/view
- Submissions: students submit; admins can list and filter (submitted/late)
- Authentication: register, login, current user
- Password change: any logged-in user
- **Similarity Detection**: Automatic plagiarism checking using TF-IDF and cosine similarity
  - Detects similarity between student submissions (≥80% threshold)
  - Categorizes similarity levels: none, low, medium, high
  - Supports multiple file formats: PDF, DOCX, TXT, JSON
  - Content hashing for exact duplicate detection
- **Notification System**: Real-time alerts for similarity detection
  - Teachers receive alerts when students submit similar work
  - Students receive notifications when their submissions have high similarity
  - Notification popup in dashboard with unread count badge
  - Full notification center page with mark as read/delete functionality
- **Teacher Dashboard**: View similarity reports for assignments
  - View flagged submissions with similarity scores
  - Filter by assignment to see similarity alerts

Quick Start
-----------
1) Backend

```bash
cd server
Copy-Item env.example .env   # PowerShell on Windows (or: cp env.example .env)
npm install
# Ensure MongoDB is running locally (mongodb://localhost:27017)
npm run dev
# API at http://localhost:5000
```

2) Frontend

```bash
cd client
Set-Content -Path .env -Value "VITE_API_URL=http://localhost:5000"   # or echo on bash
npm install
npm run dev
# App at http://localhost:5173
```

Environment Variables
---------------------
Backend (`server/.env`):
- `PORT=5000`
- `NODE_ENV=development`
- `MONGODB_URI=mongodb://localhost:27017/classsync`
- `JWT_SECRET=your-strong-secret`
- `JWT_EXPIRE=7d`
- `MAX_FILE_SIZE=10485760` (10MB)
- `UPLOAD_PATH=./uploads`
- `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000` (comma-separated)

Frontend (`client/.env`):
- `VITE_API_URL=http://localhost:5000`

Auth & Roles
------------
- Roles: `student`, `teacher`, `admin`
- Register: `POST /api/auth/register` `{ name, email, password, role }`
- Login: `POST /api/auth/login` → `{ token, user }`
- Me: `GET /api/auth/me` (Bearer token)
- Change password: `PUT /api/users/change-password` `{ currentPassword, newPassword }`

API Highlights (Admin)
----------------------
- `GET /api/admin/health`
- `GET /api/admin/stats`
- `GET /api/admin/users` (pagination), `POST /api/admin/users`
- `GET /api/admin/assignments`
- `GET /api/admin/submissions?status=submitted|late&page=1&limit=10`

API Highlights (Notifications)
-------------------------------
- `GET /api/notifications` - Get user notifications (supports `?limit=10&unreadOnly=true`)
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

API Highlights (Similarity Detection)
--------------------------------------
- `GET /api/submissions/assignment/:assignmentId/flags` - Get flagged submissions with similarity reports
- Similarity is automatically calculated on submission
- Similarity report includes:
  - `score`: Similarity score (0-1)
  - `category`: none, low, medium, high
  - `matches`: Array of matching submissions with scores

Assignments & Submissions
-------------------------
- Students submit via `POST /api/submissions` using `multipart/form-data`.
- Required body includes `assignmentId` and submission content/files.
- Admin submissions response includes `assignment` and `submittedBy` (populated) for the UI.
- **Similarity Detection**:
  - Automatically runs on submission
  - Extracts text from PDF, DOCX, TXT, and JSON files
  - Normalizes and hashes content for comparison
  - Compares against all previous submissions for the same assignment
  - Generates similarity report with scores and matches
  - Creates notifications for teachers (≥80% similarity) and students (≥80% similarity)
- **Supported File Formats**:
  - PDF (using pdf-parse)
  - DOCX (using mammoth)
  - TXT (plain text)
  - JSON (parsed as text)

Common Scripts
--------------
Backend (`server/`):
- `npm run dev` – start dev server with nodemon
- `npm run build` – build TypeScript to JavaScript
- `npm start` – run built server

Frontend (`client/`):
- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview production build

Similarity Detection Details
-----------------------------
The similarity detection system uses multiple techniques:
1. **Text Extraction**: Extracts text from PDF, DOCX, TXT, and JSON files
2. **Text Normalization**: Lowercases, removes punctuation, collapses whitespace
3. **Content Hashing**: SHA256 hash for exact duplicate detection
4. **TF-IDF Vectorization**: Converts text to feature vectors
5. **Cosine Similarity**: Calculates similarity scores between vectors
6. **Score Categorization**:
   - None: 0% similarity
   - Low: 1-40% similarity
   - Medium: 41-79% similarity
   - High: ≥80% similarity

When a submission has ≥80% similarity:
- Teacher receives notification (if assignment has creator)
- Student receives notification (always)
- Similarity report is saved with submission
- Matched submissions are updated with reciprocal matches

Notification System
-------------------
- Notifications are created automatically when similarity is detected
- Notification popup appears when clicking the notification button in dashboard
- Unread count badge shows number of unread notifications
- Clicking a notification marks it as read and navigates to related assignment
- Full notification center available at `/notifications` route
- Notifications can be marked as read, deleted, or viewed in detail

Troubleshooting
---------------
- MongoDB connection: start MongoDB locally; verify `MONGODB_URI`.
- 401/403: check `Authorization: Bearer <token>` and role.
- Submissions 500: ensure form uses `multipart/form-data` and includes `assignmentId`.
- Dev server crash with TypeScript conflict markers: open `server/src/index.ts` and remove lines starting with `<<<<<<<`, `=======`, `>>>>>>>`, then restart.
- Frontend cannot reach API: verify `VITE_API_URL` and backend port.
- CORS errors: add your frontend origin to `CORS_ALLOWED_ORIGINS` in server `.env` file (comma-separated).
- PDF parsing errors: ensure `pdf-parse` is installed and file is a valid PDF.
- DOCX parsing errors: ensure `mammoth` is installed and file is a valid DOCX.
- Notification popup not showing: check browser console for errors and verify notification API is accessible.

License
-------
Proprietary. All rights reserved.
