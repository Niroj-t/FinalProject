ClassSync - Assignment Management System
=======================================

A modern classroom platform to manage users, assignments, and submissions with a role-based admin panel.

Tech Stack
----------
- Backend: Node.js, Express, TypeScript, MongoDB (Mongoose)
- Frontend: React (Vite), TypeScript, Material UI
- Auth: JWT with role-based access (student, teacher, admin)

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
- `MONGO_URI=mongodb://localhost:27017/classsync`
- `JWT_SECRET=your-strong-secret`
- `JWT_EXPIRES_IN=7d`
- `CORS_ORIGIN=http://localhost:5173`

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

Assignments & Submissions
-------------------------
- Students submit via `POST /api/submissions` using `multipart/form-data`.
- Required body includes `assignmentId` and submission content/files.
- Admin submissions response includes `assignment` and `submittedBy` (populated) for the UI.

Common Scripts
--------------
Backend (`server/`):
- `npm run dev` – start dev server
- `npm run build` – build TypeScript
- `npm start` – run built server

Frontend (`client/`):
- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview build

Troubleshooting
---------------
- MongoDB connection: start MongoDB locally; verify `MONGO_URI`.
- 401/403: check `Authorization: Bearer <token>` and role.
- Submissions 500: ensure form uses `multipart/form-data` and includes `assignmentId`.
- Dev server crash with TypeScript conflict markers: open `server/src/index.ts` and remove lines starting with `<<<<<<<`, `=======`, `>>>>>>>`, then restart.
- Frontend cannot reach API: verify `VITE_API_URL` and backend port.

License
-------
Proprietary. All rights reserved.
