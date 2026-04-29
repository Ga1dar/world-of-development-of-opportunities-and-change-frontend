# World of Development of Opportunities and Change (Frontend)

## 🚀 Tech Stack
- React
- TypeScript
- Vite
- Redux
- Tailwind CSS
- schadcn
---

## API Documentation

The project includes built-in API documentation for convenient endpoint browsing and testing.

### Available links

- Swagger UI: `http://127.0.0.1:8000/api/v1/schema/swagger/`
- Redoc: `http://127.0.0.1:8000/api/v1/schema/redoc/`
- OpenAPI Schema: `http://127.0.0.1:8000/api/v1/schema/`

These pages allow you to:
- explore available endpoints
- check request and response schemas
- test API requests in the browser

---

## What is implemented

## OAuth (Google Login)

### What is implemented

Google OAuth authentication is implemented using:
- django-allauth
- dj-rest-auth
- JWT (SimpleJWT)

Custom logic:
- Blocking login for users with `is_blocked=True`
- Auto-connecting existing users by email
- JWT tokens returned after Google login

---

## Google Console Setup

1. Go to Google Cloud Console
2. Create project
3. Enable:
   - Google People API
   - OAuth2

4. Create OAuth Client ID:
   - Type: Web application

### Authorized redirect URIs (IMPORTANT)

For development (React):
```
http://localhost:5173/auth/google/callback
```

For backend-only testing:
```
http://127.0.0.1:8000/accounts/google/login/callback/
```

---

## Django Settings

Already configured:

- SITE_ID = 1
- REST_USE_JWT = True
- JWT enabled
- allauth + google provider

See settings:

(see settings.py)


---

## Google Login Endpoint

### Endpoint

POST:
```
/api/v1/users/google/
```

### Request

```json
{
  "access_token": "your_google_access_token"
}
```

### Response

```json
{
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "first_name": "Name",
    "last_name": "Surname"
  },
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

---

## Flow (React + Backend)

1. React → Google OAuth
2. Google → redirect to:
```
http://localhost:5173/auth/google/callback
```

3. React extracts `access_token`
4. React sends POST to backend:
```
/api/v1/users/google/
```

5. Backend:
- verifies token via Google
- creates / gets user
- returns JWT tokens

6. React:
- stores token
- sends Authorization header

---

# Password Reset (Django + DRF + Celery)

## Overview

We implemented password reset functionality using Django built-in token generator, DRF endpoints, and Celery for async email sending.

Flow:
1. User sends email
2. Backend generates uid + token
3. Sends reset link (Celery task)
4. User opens link
5. Sends new password
6. Password updated

---

## .env configuration

Add the following variables:

```
FRONTEND_URL=http://localhost:5173 for frontend or http://127.0.0.1:8000/api/v1/users for backend-only

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```



### EMAIL_HOST_PASSWORD (Google)

This is NOT your Gmail password.

You must generate **App Password**:

1. Go to Google Account → Security
2. Enable 2FA
3. Go to:
   https://myaccount.google.com/apppasswords
4. Generate password for "Mail"
5. Use it as EMAIL_HOST_PASSWORD

---

## Redis (Celery) via Docker

To run Redis locally for Celery, use Docker:

### Run Redis container

```bash
npm install
npm run dev
```

## 🛠 DevOps (Checks, Build + Push, Deploy)

### Docker
Build image:
```bash
docker build -t wdoc-frontend:local .
```

Run container from built image (not for development):

```bash
docker run --env-file .env -p 8080:80 wdoc-frontend:local
```

Make sure that your .env file is in the root of the project and contains necessary environment variables!

Open in browser:
```
http://localhost:8080
```

Run container (hot reload / Vite dev server):

Make sure that your .env file is in the root of the project and contains necessary environment variables!

Windows (CMD):
```bat
docker run --rm --env-file .env -p 5173:5173 -v "%cd%:/app" -w /app node:20-alpine sh -c "npm install && npm run dev -- --host 0.0.0.0"
```

Windows (PowerShell):
```powershell
docker run --rm --env-file .env -p 5173:5173 -v "${PWD}:/app" -w /app node:20-alpine sh -c "npm install && npm run dev -- --host 0.0.0.0"
```

macOS/Linux:
```bash
docker run --rm --env-file .env -p 5173:5173 -v "$(pwd):/app" -w /app node:20-alpine sh -c "npm install && npm run dev -- --host 0.0.0.0"
```

Open in browser:
```
http://localhost:5173
```

### CI/CD (GitHub Actions)
Workflow: `frontend-ci`

Triggers:
- Push to `main` or `develop`
- PR to `main` or `develop`
- Manual run (`workflow_dispatch`)

Jobs and conditions:
- Lint + security audit: runs only on PRs and manual runs.
- Docker build + Trivy scan + push: runs only on `main` push or manual run.
- CD trigger (repository dispatch): runs only on `main` push or manual run.
