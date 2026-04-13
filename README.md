# World of Development of Opportunities and Change (Frontend)

## 🚀 Tech Stack
- React
- TypeScript
- Vite
- Redux
- Tailwind CSS

## 📦 Setup

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

///
