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

Run container:
```bash
docker run --env-file .env -p 8080:80 wdoc-frontend:local
```

Open in browser:
```
http://localhost:8080
```

### CI/CD (GitHub Actions)
What happens after a push or PR:
- The project is checked for lint and security issues.
- A Docker image is built and scanned for critical vulnerabilities.
- If everything is OK on `main`, the image is pushed and deployment is triggered in the other repository.

When it runs:
- Push to `develop`, `main`, `feature/**`, `chore/**`, `hotfix/**`
- PR to `develop` or `main`
- Manual run (`workflow_dispatch`)

Deployment rules by branch:
- `main`: automatic deploy after a successful pipeline run.
- `develop`: manual deploy only (run `workflow_dispatch`).
- `feature/**`, `chore/**`, `hotfix/**`: no deploy, checks only.
