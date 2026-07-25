# Bruno quick test guide

## 1. Start the backend

From the backend folder:

```powershell
pnpm install
pnpm dev
```

The API will run at http://localhost:3000.

## 2. Configure environment values

Copy [.env.local.example](.env.local.example) to .env.local and replace the placeholder values with your Supabase and Groq keys.

Required values:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GROQ_API_KEY
- JWT_SECRET

## 3. Test in Bruno

Create a collection with these requests:

### Health check
- Method: GET
- URL: http://localhost:3000/api/health

### Register a user
- Method: POST
- URL: http://localhost:3000/api/auth/register
- Body:

```json
{
  "email": "student@example.com",
  "password": "Password123!",
  "full_name": "Student User"
}
```

### Login
- Method: POST
- URL: http://localhost:3000/api/auth/login
- Body:

```json
{
  "email": "student@example.com",
  "password": "Password123!"
}
```

If the login succeeds, copy the returned token and use it as a Bearer token for protected routes.

### AI hint example
- Method: POST
- URL: http://localhost:3000/api/ai/hint
- Headers:
  - Authorization: Bearer <token>
- Body:

```json
{
  "question_id": "dummy-question-id",
  "hint_level": "1"
}
```

> If your Supabase tables are not created yet, the auth routes may fail with a database error. In that case, create the tables from the SQL in [lib/database/migrations.sql](lib/database/migrations.sql).
