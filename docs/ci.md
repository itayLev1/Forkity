# Continuous integration

Jenkins can validate this repository with the following independent stages.

## Backend

```bash
cd api
npm ci
npm test
DATABASE_URL="$DATABASE_URL" npm run db:validate
```

## Frontend

```bash
cd src
npm ci
npm run build
```

The backend tests do not require PostgreSQL because they cover the application
boundary and error responses without opening database-backed routes. A separate
integration stage can start `api/docker-compose.yml`, apply migrations, and run
the authenticated API workflow when Jenkins has Docker access.

Deployment configuration remains in the separate DevOps repository managed by
Terraform and ArgoCD.