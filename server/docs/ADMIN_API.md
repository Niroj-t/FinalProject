# Admin API Documentation

This document describes the admin-specific API endpoints for the ClassSync application.

## Authentication

All admin endpoints require:
1. Valid JWT token in the Authorization header: `Bearer <token>`
2. User must have `admin` role

## Base URL

All admin endpoints are prefixed with `/api/admin`

## Endpoints

### Health Check

#### GET /api/admin/health
Check if the admin panel is accessible and healthy.

**Response:**
```json
{
  "success": true,
  "message": "Admin panel is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user_id",
    "name": "Admin Name",
    "role": "admin"
  }
}
```

### User Management

#### GET /api/admin/users
Get all users with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (`student`, `teacher`, `admin`)
- `search` (optional): Search by name or email
- `isActive` (optional): Filter by active status (`true`/`false`)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "user_id",
        "name": "User Name",
        "email": "user@example.com",
        "role": "student",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "lastLogin": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 50,
      "limit": 10
    }
  }
}
```

#### GET /api/admin/users/:id
Get specific user by ID with additional statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "student",
      "isActive": true,
      "assignmentsCount": 5,
      "submissionsCount": 10
    }
  }
}
```

#### POST /api/admin/users
Create a new user.

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "New User",
      "email": "newuser@example.com",
      "role": "student",
      "isActive": true
    }
  }
}
```

#### PUT /api/admin/users/:id/status
Update user's active status.

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "student",
      "isActive": false
    }
  }
}
```

#### PUT /api/admin/users/:id/role
Update user's role.

**Request Body:**
```json
{
  "role": "teacher"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "teacher",
      "isActive": true
    }
  }
}
```

#### DELETE /api/admin/users/:id
Delete a user (soft delete - removes user record).

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### System Statistics

#### GET /api/admin/stats
Get comprehensive system statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 100,
      "students": 80,
      "teachers": 18,
      "admins": 2,
      "active": 95,
      "recent": 5,
      "activeLast30Days": 85
    },
    "assignments": {
      "total": 50,
      "active": 30,
      "overdue": 5,
      "recent": 10
    },
    "submissions": {
      "total": 200,
      "recent": 25
    },
    "notifications": {
      "total": 150
    }
  }
}
```

#### GET /api/admin/logs
Get system activity logs (placeholder implementation).

**Response:**
```json
{
  "success": true,
  "message": "System logs endpoint - placeholder implementation",
  "data": {
    "logs": [
      {
        "type": "user_activity",
        "message": "John Doe (student) last active: 2024-01-01T00:00:00.000Z",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "user": {
          "name": "John Doe",
          "email": "john@example.com",
          "role": "student"
        }
      }
    ]
  }
}
```

### Content Management

#### GET /api/admin/assignments
Get all assignments with admin view.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by title or description
- `status` (optional): Filter by status (`active`, `overdue`, `all`)

**Response:**
```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "_id": "assignment_id",
        "title": "Assignment Title",
        "description": "Assignment description",
        "dueDate": "2024-01-15T00:00:00.000Z",
        "isActive": true,
        "createdBy": {
          "_id": "teacher_id",
          "name": "Teacher Name",
          "email": "teacher@example.com",
          "role": "teacher"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 3,
      "total": 25,
      "limit": 10
    }
  }
}
```

#### GET /api/admin/submissions
Get all submissions with admin view.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by grading status (`graded`, `ungraded`, `all`)

**Response:**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "_id": "submission_id",
        "assignment": {
          "_id": "assignment_id",
          "title": "Assignment Title",
          "dueDate": "2024-01-15T00:00:00.000Z"
        },
        "submittedBy": {
          "_id": "student_id",
          "name": "Student Name",
          "email": "student@example.com",
          "role": "student"
        },
        "submittedAt": "2024-01-10T00:00:00.000Z",
        "grade": 85
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 10,
      "total": 100,
      "limit": 10
    }
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message",
  "errors": [
    {
      "msg": "Specific validation error",
      "param": "fieldName",
      "location": "body"
    }
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error"
}
```

## Security Notes

1. **Admin Protection**: All endpoints require admin role
2. **Self-Protection**: Admins cannot delete themselves or change their own role
3. **Input Validation**: All inputs are validated using express-validator
4. **Password Security**: Passwords are hashed using bcrypt
5. **Token Verification**: JWT tokens are verified on every request

## Rate Limiting

Consider implementing rate limiting for admin endpoints to prevent abuse:
- User management: 100 requests per hour
- Statistics: 200 requests per hour
- Content management: 150 requests per hour
