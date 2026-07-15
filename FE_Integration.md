# Frontend API Guide - Complete Reference

## Table of Contents

1. [Authentication](#authentication)
2. [Classroom Management](#classroom-management)
3. [Materials & Upload](#materials--upload)
4. [Quiz System](#quiz-system)
5. [AI Features](#ai-features)
6. [Analytics](#analytics)
7. [Error Handling](#error-handling)

---

## Base Setup

All API calls start with: `http://localhost:3000/api` (or your deployed URL)

### Headers Required (for all authenticated endpoints)

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

### Response Format (Success)

```javascript
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Response Format (Error)

```javascript
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message"
}
```

---

## Authentication

### 1. Register User

**Endpoint:** `POST /auth/register`

**When to use:** User signup page

**Request Body:**
```javascript
{
  "email": "student@example.com",
  "password": "SecurePassword123",
  "full_name": "John Doe"
}
```

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "full_name": "John Doe",
      "role": "student"
    },
    "access_token": "jwt_token_here",
    "refresh_token": "refresh_token_here"
  }
}
```

**Possible Errors:**
- `VALIDATION_ERROR` (400) - Invalid email or weak password
- `USER_ALREADY_EXISTS` (409) - Email already registered

**Frontend TODO:**
- [ ] Store tokens in localStorage or cookies
- [ ] Validate email format before sending
- [ ] Show password strength indicator

---

### 2. Login User

**Endpoint:** `POST /auth/login`

**When to use:** User login page

**Request Body:**
```javascript
{
  "email": "student@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "full_name": "John Doe",
      "role": "student"
    },
    "access_token": "jwt_token_here",
    "refresh_token": "refresh_token_here"
  }
}
```

**Possible Errors:**
- `INVALID_CREDENTIALS` (401) - Wrong email or password
- `USER_NOT_FOUND` (404) - Email doesn't exist

**Frontend TODO:**
- [ ] Add "Remember me" checkbox
- [ ] Show loading state during login
- [ ] Redirect to dashboard on success

---

### 3. Refresh Token

**Endpoint:** `POST /auth/refresh`

**When to use:** When access token expires (every ~15 min)

**Request Body:**
```javascript
{
  "refresh_token": "your_refresh_token"
}
```

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "access_token": "new_jwt_token",
    "refresh_token": "new_refresh_token"
  }
}
```

**Possible Errors:**
- `INVALID_TOKEN` (401) - Refresh token expired

**Frontend TODO:**
- [ ] Auto-refresh token before expiry
- [ ] Redirect to login if refresh fails
- [ ] Store new tokens immediately

---

### 4. Logout

**Endpoint:** `POST /auth/logout`

**When to use:** User clicks logout button

**Request Body:**
```javascript
{
  "refresh_token": "your_refresh_token"
}
```

**Response (200):**
```javascript
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Frontend TODO:**
- [ ] Clear all stored tokens
- [ ] Redirect to login page
- [ ] Clear user data from state/context

---

## Classroom Management

### 1. Create Class (Teacher Only)

**Endpoint:** `POST /classes/create`

**When to use:** Teacher creates new class

**Request Body:**
```javascript
{
  "name": "Advanced Mathematics 101",
  "description": "Learn calculus and advanced algebra"
}
```

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "id": "class_uuid",
    "name": "Advanced Mathematics 101",
    "description": "Learn calculus and advanced algebra",
    "teacher_id": "teacher_uuid",
    "class_code": "MATH101", // Generated automatically
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Possible Errors:**
- `FORBIDDEN` (403) - User is not a teacher
- `VALIDATION_ERROR` (400) - Missing required fields

**Frontend TODO:**
- [ ] Show class code prominently for teacher to share
- [ ] Add copy-to-clipboard button for code
- [ ] Show success notification

---

### 2. List My Classes

**Endpoint:** `GET /classes/list`

**When to use:** Dashboard - show all classes for current user

**Query Parameters:** None (uses current user from token)

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "owned_classes": [ // For teachers
      {
        "id": "class_uuid",
        "name": "Class Name",
        "description": "Description",
        "teacher_id": "uuid",
        "class_code": "CODE123",
        "student_count": 25,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "enrolled_classes": [ // For students
      {
        "id": "class_uuid",
        "name": "Class Name",
        "description": "Description",
        "teacher": {
          "id": "teacher_uuid",
          "full_name": "Prof. Smith"
        },
        "enrolled_at": "2024-01-20T14:00:00Z"
      }
    ]
  }
}
```

**Frontend TODO:**
- [ ] Display classes in grid or list layout
- [ ] Add icons/badges to distinguish owned vs enrolled
- [ ] Add "Create Class" button for teachers
- [ ] Show student count for owned classes

---

### 3. Get Class Details

**Endpoint:** `GET /classes/[classId]`

**When to use:** Open specific class to see materials, quizzes, students

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "class": {
      "id": "class_uuid",
      "name": "Advanced Mathematics 101",
      "description": "Description",
      "teacher_id": "uuid",
      "class_code": "MATH101",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "teacher": {
      "id": "uuid",
      "full_name": "Prof. Smith",
      "email": "prof.smith@school.edu"
    },
    "students": [
      {
        "id": "student_uuid",
        "full_name": "John Doe",
        "email": "john@example.com",
        "enrolled_at": "2024-01-20"
      }
    ],
    "material_count": 12,
    "quiz_count": 5
  }
}
```

**Possible Errors:**
- `CLASS_NOT_FOUND` (404) - Class doesn't exist
- `FORBIDDEN` (403) - Not enrolled or owner

**Frontend TODO:**
- [ ] Show teacher info as header
- [ ] List all students in a table
- [ ] Show material count and quiz count
- [ ] Add tabs for Materials, Quizzes, Students

---

### 4. Enroll in Class

**Endpoint:** `POST /classes/enroll`

**When to use:** Student enters class code to join

**Request Body:**
```javascript
{
  "class_code": "MATH101"
}
```

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "enrollment": {
      "id": "enrollment_uuid",
      "class_id": "class_uuid",
      "student_id": "student_uuid",
      "enrolled_at": "2024-01-25T09:15:00Z"
    },
    "class": {
      "id": "class_uuid",
      "name": "Advanced Mathematics 101"
    }
  }
}
```

**Possible Errors:**
- `CLASS_NOT_FOUND` (404) - Invalid class code
- `ALREADY_ENROLLED` (409) - Already in this class
- `VALIDATION_ERROR` (400) - Missing class code

**Frontend TODO:**
- [ ] Add enrollment modal/form
- [ ] Validate class code format
- [ ] Show confirmation after enrollment
- [ ] Auto-redirect to class dashboard

---

### 5. Leave Class

**Endpoint:** `POST /classes/[classId]/leave`

**When to use:** Student leaves a class

**Response (200):**
```javascript
{
  "success": true,
  "message": "Successfully left the class"
}
```

**Frontend TODO:**
- [ ] Show confirmation dialog before leaving
- [ ] Remove class from list immediately
- [ ] Show success toast notification

---

## Materials & Upload

### 1. Upload Material

**Endpoint:** `POST /materials/upload`

**When to use:** Teacher uploads PDF, notes, or documents

**Request Body:** (FormData)
```javascript
const formData = new FormData();
formData.append('file', fileObject); // PDF, DOC, PPT, etc.
formData.append('class_id', 'class_uuid');
formData.append('title', 'Chapter 5: Introduction to Derivatives');
```

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "id": "material_uuid",
    "title": "Chapter 5: Introduction to Derivatives",
    "class_id": "class_uuid",
    "file_url": "https://storage.supabase.com/...",
    "file_type": "pdf",
    "created_at": "2024-01-25T10:00:00Z",
    "creator": {
      "id": "teacher_uuid",
      "full_name": "Prof. Smith"
    }
  }
}
```

**Possible Errors:**
- `VALIDATION_ERROR` (400) - Missing title or class_id
- `UPLOAD_FAILED` (500) - File too large or unsupported format
- `FORBIDDEN` (403) - Only teachers can upload

**Frontend TODO:**
- [ ] Add file upload input (drag & drop support)
- [ ] Show upload progress bar
- [ ] Validate file size before upload (max ~50MB)
- [ ] Show success notification with file name
- [ ] Handle network failures with retry

---

### 2. List Class Materials

**Endpoint:** `GET /materials/list?class_id=CLASS_UUID`

**When to use:** Display all materials in class

**Response (200):**
```javascript
{
  "success": true,
  "data": [
    {
      "id": "material_uuid",
      "title": "Chapter 5: Introduction to Derivatives",
      "class_id": "class_uuid",
      "file_url": "https://storage.supabase.com/...",
      "file_type": "pdf",
      "created_at": "2024-01-25T10:00:00Z",
      "creator": {
        "id": "teacher_uuid",
        "full_name": "Prof. Smith"
      }
    }
  ]
}
```

**Frontend TODO:**
- [ ] Display materials in chronological order (newest first)
- [ ] Show file type icon (PDF, DOC, etc.)
- [ ] Add download button for each material
- [ ] Show upload date and teacher name
- [ ] Add search/filter by title

---

## Quiz System

### 1. Create Quiz (Teacher Only)

**Endpoint:** `POST /quizzes/create`

**When to use:** Teacher creates new quiz

**Request Body:**
```javascript
{
  "class_id": "class_uuid",
  "title": "Chapter 5 Quiz",
  "description": "Test your understanding of derivatives"
}
```

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "id": "quiz_uuid",
    "class_id": "class_uuid",
    "title": "Chapter 5 Quiz",
    "description": "Test your understanding of derivatives",
    "is_published": false,
    "created_at": "2024-01-25T10:00:00Z"
  }
}
```

**Frontend TODO:**
- [ ] Show "Add Questions" button immediately after creation
- [ ] Display quiz status (Draft/Published)
- [ ] Add preview mode for teachers

---

### 2. Add Question to Quiz (Teacher)

**Endpoint:** `POST /quizzes/[quizId]/questions`

**When to use:** Teacher adds question to quiz

**Request Body:**
```javascript
{
  "question_text": "What is the derivative of x^2?",
  "question_type": "multiple_choice", // or "short_answer", "true_false"
  "options": {
    "a": "2x",
    "b": "x^2",
    "c": "2",
    "d": "x"
  },
  "correct_answer": "a",
  "order_index": 1
}
```

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "id": "question_uuid",
    "quiz_id": "quiz_uuid",
    "question_text": "What is the derivative of x^2?",
    "question_type": "multiple_choice",
    "options": { /* ... */ },
    "order_index": 1,
    "created_at": "2024-01-25T10:00:00Z"
  }
}
```

**Frontend TODO:**
- [ ] Build question builder form
- [ ] Support drag-to-reorder questions
- [ ] Preview question before saving
- [ ] Add "Publish Quiz" button when all questions added

---

### 3. Start Quiz Attempt (Student)

**Endpoint:** `POST /quizzes/[quizId]/attempt`

**When to use:** Student clicks "Start Quiz"

**Request Body:**
```javascript
{
  "learning_mode": "normal" // or "socratic", "explainable"
}
```

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "attempt": {
      "id": "attempt_uuid",
      "quiz_id": "quiz_uuid",
      "student_id": "student_uuid",
      "status": "in_progress",
      "learning_mode": "normal",
      "started_at": "2024-01-25T14:00:00Z"
    },
    "questions": [
      {
        "id": "question_uuid",
        "question_text": "What is the derivative of x^2?",
        "question_type": "multiple_choice",
        "options": { "a": "2x", "b": "x^2", "c": "2", "d": "x" },
        "order_index": 1
      }
    ],
    "total_questions": 10
  }
}
```

**Frontend TODO:**
- [ ] Display quiz timer
- [ ] Show progress (1/10 questions)
- [ ] Store attempt ID for later
- [ ] Disable going back if not allowed

---

### 4. Submit Quiz Answers

**Endpoint:** `POST /quizzes/attempt/[attemptId]/submit`

**When to use:** Student finishes quiz and clicks submit

**Request Body:**
```javascript
{
  "answers": [
    {
      "question_id": "question_uuid_1",
      "student_answer": "a"
    },
    {
      "question_id": "question_uuid_2",
      "student_answer": "True"
    }
  ]
}
```

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "attempt": {
      "id": "attempt_uuid",
      "status": "completed",
      "score": 8,
      "total_questions": 10,
      "percentage_score": 80,
      "completed_at": "2024-01-25T14:15:00Z"
    },
    "results": [
      {
        "question_id": "question_uuid",
        "question_text": "What is the derivative of x^2?",
        "student_answer": "a",
        "correct_answer": "a",
        "is_correct": true,
        "explanation": "Correct! Using the power rule: d/dx(x^n) = n*x^(n-1)"
      }
    ]
  }
}
```

**Frontend TODO:**
- [ ] Show score immediately after submission
- [ ] Display each question with result (correct/incorrect)
- [ ] Show explanations for each answer
- [ ] Add "View Results" button to see detailed feedback
- [ ] Show retake option if allowed

---

## AI Features

### 1. AI Chat (Ask Questions)

**Endpoint:** `POST /ai/chat`

**When to use:** Student types message in chat while studying

**Request Body:**
```javascript
{
  "session_id": "session_uuid", // or null to create new
  "class_id": "class_uuid", // optional, for context
  "message": "Explain the chain rule in calculus",
  "learning_mode": "normal" // or "socratic", "explainable"
}
```

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "session_id": "session_uuid",
    "response": "The chain rule is used when you have a function composed of multiple functions...",
    "sources": [ // From materials (RAG)
      {
        "material_id": "material_uuid",
        "title": "Chapter 3: The Chain Rule",
        "excerpt": "The chain rule states that d/dx[f(g(x))] = f'(g(x)) * g'(x)"
      }
    ],
    "tokens_used": 450,
    "created_at": "2024-01-25T14:30:00Z"
  }
}
```

**Possible Errors:**
- `SESSION_NOT_FOUND` (404) - Invalid session
- `GROQ_API_ERROR` (500) - AI service error

**Frontend TODO:**
- [ ] Create chat interface
- [ ] Display AI responses with markdown formatting
- [ ] Show message history
- [ ] Display source materials when available
- [ ] Add typing indicator while waiting for response
- [ ] Handle long responses with scrolling

---

### 2. Get Hint (Progressive Hints)

**Endpoint:** `POST /ai/hint`

**When to use:** Student clicks "Get Hint" button during quiz

**Request Body:**
```javascript
{
  "question_id": "question_uuid",
  "attempt_id": "attempt_uuid",
  "hint_level": 1 // 1, 2, or 3 (progressive difficulty)
}
```

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "hint_level": 1,
    "hint": "Think about what mathematical operation increases by 1 when you add 1 to the input.",
    "next_hint_available": true,
    "remaining_hints": 2,
    "learning_mode": "normal"
  }
}
```

**Possible Errors:**
- `NO_MORE_HINTS` (429) - Student has used all hints
- `QUESTION_NOT_FOUND` (404) - Invalid question

**Frontend TODO:**
- [ ] Show "Get Hint" button (disabled after 3 uses)
- [ ] Display hint text in a highlighted box
- [ ] Show hint level (1/3, 2/3, 3/3)
- [ ] Disable button if no more hints
- [ ] Track wrong attempts to auto-switch learning modes

---

## Analytics

### 1. Get Class Dashboard (Teacher)

**Endpoint:** `GET /analytics/dashboard?class_id=CLASS_UUID`

**When to use:** Teacher views class statistics

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "class_id": "class_uuid",
    "total_students": 25,
    "total_quizzes": 5,
    "average_score": 78.5,
    "highest_score": 95,
    "lowest_score": 45,
    "completion_rate": 92,
    "student_metrics": [
      {
        "student_id": "uuid",
        "full_name": "John Doe",
        "quizzes_completed": 5,
        "average_score": 82,
        "last_active": "2024-01-25T14:00:00Z"
      }
    ],
    "quiz_stats": [
      {
        "quiz_id": "uuid",
        "title": "Chapter 5 Quiz",
        "average_score": 76,
        "completion_rate": 88
      }
    ]
  }
}
```

**Frontend TODO:**
- [ ] Create dashboard cards for key metrics
- [ ] Show student progress table
- [ ] Add filters (by quiz, date range)
- [ ] Export stats as CSV/PDF

---

### 2. Get Student Progress

**Endpoint:** `GET /analytics/progress?class_id=CLASS_UUID`

**When to use:** Student views their progress

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "student_id": "student_uuid",
    "class_id": "class_uuid",
    "quizzes_completed": 5,
    "total_quizzes": 8,
    "completion_percentage": 62.5,
    "average_score": 78.5,
    "attempts": [
      {
        "quiz_id": "uuid",
        "quiz_title": "Chapter 5 Quiz",
        "score": 85,
        "percentage": 85,
        "completed_at": "2024-01-25T14:15:00Z",
        "learning_mode": "normal"
      }
    ]
  }
}
```

**Frontend TODO:**
- [ ] Show progress bar (completed/total)
- [ ] Display average score
- [ ] List all quiz attempts chronologically
- [ ] Show trend (improving/declining)

---

### 3. Get AI Usage Stats (Teacher)

**Endpoint:** `GET /analytics/ai-usage?class_id=CLASS_UUID`

**When to use:** Teacher sees AI feature adoption

**Response (200):**
```javascript
{
  "success": true,
  "data": {
    "class_id": "class_uuid",
    "total_requests": 342,
    "total_tokens_used": 154000,
    "by_type": {
      "chat": 150,
      "hint": 165,
      "explanation": 27
    },
    "unique_users": 18,
    "most_used_feature": "hint",
    "average_requests_per_user": 19
  }
}
```

**Frontend TODO:**
- [ ] Show usage charts (requests over time)
- [ ] Display feature breakdown (pie chart)
- [ ] Show token usage
- [ ] Compare with previous period

---

## Error Handling

### Common Error Codes

| Code | Status | Meaning | Fix |
|------|--------|---------|-----|
| `VALIDATION_ERROR` | 400 | Invalid input | Check form fields |
| `UNAUTHORIZED` | 401 | No auth token | Login again |
| `FORBIDDEN` | 403 | No permission | Not allowed for this role |
| `NOT_FOUND` | 404 | Resource doesn't exist | Check IDs |
| `ALREADY_ENROLLED` | 409 | Duplicate action | Already exists |
| `INTERNAL_SERVER_ERROR` | 500 | Backend error | Try again later |

### Frontend Error Handling Template

```javascript
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific errors
      if (response.status === 401) {
        // Try refresh token
        await refreshToken();
        return apiCall(endpoint, options); // Retry
      }
      
      throw new Error(data.message || 'Unknown error');
    }

    return data.data; // Return just the data
  } catch (error) {
    console.error('[API Error]', error);
    // Show user-friendly error message
    throw error;
  }
}
```

---

## Quick Start for Frontend Dev

### 1. Authentication Flow

```javascript
// Step 1: User registers
const user = await apiCall('/auth/register', {
  method: 'POST',
  body: JSON.stringify({
    email, password, full_name
  })
});

// Store tokens
localStorage.setItem('access_token', user.access_token);
localStorage.setItem('refresh_token', user.refresh_token);

// Step 2: User logged in - fetch their classes
const classes = await apiCall('/classes/list', {
  method: 'GET'
});

// Display classes in UI
```

### 2. Quiz Flow

```javascript
// Student takes quiz
const attempt = await apiCall(`/quizzes/${quizId}/attempt`, {
  method: 'POST',
  body: JSON.stringify({ learning_mode: 'normal' })
});

// Store attempt ID
const attemptId = attempt.id;

// Student answers questions (stored in local state)
// When done, submit:
const results = await apiCall(`/quizzes/attempt/${attemptId}/submit`, {
  method: 'POST',
  body: JSON.stringify({ answers: studentAnswers })
});

// Show results
showResults(results);
```

### 3. Material Upload Flow

```javascript
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('class_id', currentClassId);
formData.append('title', fileName);

const uploaded = await apiCall('/materials/upload', {
  method: 'POST',
  body: formData,
  headers: {} // Don't set Content-Type for FormData
});

// Refresh materials list
loadMaterials();
```

---

## Response Time Expectations

- Authentication: ~200ms
- Data fetching: ~100-300ms
- File upload: ~1-5 seconds (depends on file size)
- AI chat: ~2-5 seconds (Groq API)
- Hints: ~1-2 seconds

Show loading states for anything over 500ms.

---

## Useful Frontend Libraries

```bash
# HTTP Client
npm install axios  # Or use native fetch

# State Management
npm install zustand  # Simple state
npm install redux  # Complex state

# UI Components
npm install react-icons  # Icons
npm install react-hot-toast  # Notifications
npm install react-markdown  # Format AI responses

# Form Handling
npm install react-hook-form zod  # Validation

# File Upload
npm install react-dropzone  # Drag & drop
```

---

## Testing Your Integration

```bash
# Test in browser console
fetch('http://localhost:3000/api/health', {
  method: 'GET'
}).then(r => r.json()).then(console.log);

# Expected response:
# { "status": "ok" }
```

---

## Next Steps

1. **Setup authentication context/state** - Store user and tokens
2. **Create API client hook** - Centralize all API calls
3. **Build main layout** - Navigation, sidebar
4. **Create auth pages** - Login, Register, Logout
5. **Build dashboard** - Show classes
6. **Build class view** - Materials, quizzes
7. **Build quiz interface** - Question display, timer
8. **Add AI chat** - Chat UI and integration
9. **Add analytics** - Dashboard for teachers/students
10. **Polish & deploy** - Error handling, loading states, mobile responsive

---

**Happy coding!** 🚀

For questions about specific endpoints, refer to the [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) for curl examples.
