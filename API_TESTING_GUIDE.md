# API Testing Guide

This guide provides examples and best practices for testing the educational platform backend.

## Prerequisites

- Dev server running: `pnpm dev`
- API base URL: `http://localhost:3000/api`
- A REST client: curl, Postman, VS Code REST Client extension, or Thunder Client

## Authentication Flow

### 1. Register New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@example.com",
    "password": "SecurePassword123",
    "full_name": "John Doe"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "student1@example.com",
      "full_name": "John Doe",
      "role_id": "...",
      "role": {
        "id": "...",
        "name": "student",
        "permissions": {...}
      }
    }
  }
}
```

**Save the token for next requests:**
```bash
TOKEN="<access_token_from_response>"
```

### 2. Login User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@example.com",
    "password": "SecurePassword123"
  }'
```

### 3. Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "<refresh_token>"
  }'
```

### 4. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## Health Check

```bash
curl http://localhost:3000/api/health
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-07-08T12:00:00Z",
    "environment": "development"
  }
}
```

---

## Error Handling Examples

### Missing Required Fields

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
    # Missing password and full_name
  }'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "VAL_001",
    "message": "Validation failed",
    "details": { ... }
  }
}
```

### Invalid Email

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "SecurePass123",
    "full_name": "Test"
  }'
```

### User Already Exists

```bash
# Register same user twice
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@example.com",
    "password": "SecurePassword123",
    "full_name": "Duplicate User"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_006",
    "message": "Email already registered"
  }
}
```

### Invalid Token

```bash
curl -X GET http://localhost:3000/api/classes \
  -H "Authorization: Bearer invalid-token"
```

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_004",
    "message": "Invalid or malformed token"
  }
}
```

---

## Authentication with All Requests

Always include the Authorization header:

```bash
curl -X GET http://localhost:3000/api/classes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## Testing with Postman

### 1. Import Variables

Set up environment variables in Postman:
- `base_url`: http://localhost:3000/api
- `token`: (leave empty, will be filled after login)
- `refresh_token`: (leave empty)

### 2. Register Request

**URL:** `{{base_url}}/auth/register`  
**Method:** POST  
**Body (JSON):**
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123",
  "full_name": "Test Student"
}
```

**Tests Tab** (to save token):
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  var jsonData = pm.response.json();
  pm.environment.set("token", jsonData.data.token);
  pm.environment.set("refresh_token", jsonData.data.refreshToken);
}
```

### 3. Login Request

**URL:** `{{base_url}}/auth/login`  
**Method:** POST  
**Body (JSON):**
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123"
}
```

### 4. Protected Route Request

**URL:** `{{base_url}}/classes`  
**Method:** GET  
**Headers:**
- Key: `Authorization`
- Value: `Bearer {{token}}`

---

## Testing with curl

### Create Reusable Variables

```bash
#!/bin/bash
BASE_URL="http://localhost:3000/api"
EMAIL="student@example.com"
PASSWORD="SecurePassword123"
FULLNAME="Test Student"

# Register
RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"full_name\": \"$FULLNAME\"
  }")

# Extract token using jq
TOKEN=$(echo $RESPONSE | jq -r '.data.token')
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.data.refreshToken')

echo "Token: $TOKEN"
echo "Refresh Token: $REFRESH_TOKEN"

# Use token in next request
curl -X GET $BASE_URL/classes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

Save as `test-api.sh` and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Testing with VS Code REST Client

Create file `.vscode/test-api.http`:

```http
### Variables
@base_url = http://localhost:3000/api
@token = 

### Register New Student
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "SecurePassword123",
  "full_name": "John Doe"
}

### Login
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "SecurePassword123"
}

### Health Check
GET {{base_url}}/health

### Refresh Token
POST {{base_url}}/auth/refresh
Content-Type: application/json

{
  "refresh_token": "{{refresh_token}}"
}

### Logout
POST {{base_url}}/auth/logout
Authorization: Bearer {{token}}
```

Click "Send Request" on each endpoint.

---

## Common Test Scenarios

### Scenario 1: Full Authentication Flow

```bash
#!/bin/bash
BASE_URL="http://localhost:3000/api"
EMAIL="test-$(date +%s)@example.com"
PASSWORD="TestPassword123"

echo "1. Registering user..."
REGISTER=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"full_name\":\"Test User\"}")

TOKEN=$(echo $REGISTER | jq -r '.data.token')
REFRESH=$(echo $REGISTER | jq -r '.data.refreshToken')

echo "✓ Registered"
echo "Token: $TOKEN"

echo -e "\n2. Using token to access protected resource..."
curl -s -X GET $BASE_URL/health \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n3. Refreshing token..."
NEW_TOKEN=$(curl -s -X POST $BASE_URL/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH\"}" | jq -r '.data.token')

echo "✓ New Token: $NEW_TOKEN"

echo -e "\n4. Logging out..."
curl -s -X POST $BASE_URL/auth/logout \
  -H "Authorization: Bearer $NEW_TOKEN" | jq '.'

echo "✓ Done"
```

### Scenario 2: Error Handling

```bash
#!/bin/bash
BASE_URL="http://localhost:3000/api"

echo "Test 1: Invalid email format"
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"not-email","password":"Pass123","full_name":"Test"}' | jq '.error'

echo -e "\nTest 2: Password too short"
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123","full_name":"Test"}' | jq '.error'

echo -e "\nTest 3: Missing fields"
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' | jq '.error'

echo -e "\nTest 4: Invalid credentials"
curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com","password":"WrongPass"}' | jq '.error'
```

---

## Performance Testing

### Load Test with Multiple Requests

```bash
#!/bin/bash
BASE_URL="http://localhost:3000/api"

# Register multiple users
for i in {1..10}; do
  curl -s -X POST $BASE_URL/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"user$i@example.com\",\"password\":\"Pass123\",\"full_name\":\"User $i\"}" &
done

wait
echo "✓ Created 10 users"
```

### Response Time Measurement

```bash
#!/bin/bash
BASE_URL="http://localhost:3000/api"
TOKEN="your-token-here"

echo "Measuring response times..."
time curl -s -X GET $BASE_URL/classes \
  -H "Authorization: Bearer $TOKEN" > /dev/null
```

---

## Integration Testing

### Test Full Workflow

```javascript
// Using Node.js with fetch
const BASE_URL = 'http://localhost:3000/api';
let token = '';

async function testWorkflow() {
  try {
    // 1. Register
    let res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@test.com',
        password: 'SecurePass123',
        full_name: 'Test Student'
      })
    });
    let data = await res.json();
    token = data.data.token;
    console.log('✓ Registered', data.data.user.id);

    // 2. Health check with token
    res = await fetch(`${BASE_URL}/health`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await res.json();
    console.log('✓ Health:', data.data.status);

    // 3. Logout
    res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await res.json();
    console.log('✓ Logged out');

  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

testWorkflow();
```

---

## Troubleshooting

### "SUPABASE_URL not set" Error

**Solution**: Make sure `.env.local` is in the project root with:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### "JWT_SECRET not configured" Error

**Solution**: Add to `.env.local`:
```
JWT_SECRET=your-secret-key-min-32-chars
```

### CORS Errors

If testing from a different origin, make sure CORS is configured in Next.js.

### 401 Unauthorized

**Solution**: Ensure token is in Authorization header:
```bash
# Wrong
curl -H "Authorization: $TOKEN"

# Correct
curl -H "Authorization: Bearer $TOKEN"
```

### Token Expired

**Solution**: Use refresh token endpoint to get new access token:
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"your-refresh-token"}'
```

---


