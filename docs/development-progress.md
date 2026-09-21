# Forkity development progress

Last checkpoint: 2026-09-21
Branch: `main`

## Project direction

Forkity is being evolved from a Parcel/vanilla JavaScript recipe frontend into a full-stack application.

- Frontend: vanilla JavaScript, MVC-style modules, Parcel, Sass
- Backend: Node.js, Express, Prisma
- Database: PostgreSQL
- Authentication: bcrypt password hashes and HTTP-only signed session cookies
- CI: Jenkins runs repository validation and builds
- Deployment: Terraform and ArgoCD files belong in a separate DevOps repository

Do not add Kubernetes, Terraform, Helm, or ArgoCD deployment files to this repository.

## Completed architecture work

1. Architecture diagrams saved under `docs/architecture/` as editable Mermaid sources and PNG files.
2. Backend foundation with `/health` endpoint.
3. PostgreSQL Docker Compose service and Prisma schema/migration.
4. Authentication endpoints:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `POST /api/auth/logout`
   - `GET /api/auth/me`
5. Recipe endpoints:
   - `GET /api/recipes?search=...`
   - `GET /api/recipes/:id`
   - `POST /api/recipes` for authenticated users
6. Database-backed favorites:
   - `GET /api/favorites`
   - `POST /api/favorites/:recipeId`
   - `DELETE /api/favorites/:recipeId`
7. Frontend connected to the backend; the external Forkify API key and URL were removed.
8. Jenkins CI documentation and dependency-free API tests added in `docs/ci.md` and `api/test/app.test.js`.
9. Visual redesign started with:
   - editorial palette and typography
   - redesigned global buttons and focus states
   - header and search navigation
   - recipe preview rows and result column
   - recipe detail layout
   - modal, loading, empty, and error-state styling

## Current behavior fixes

- Authentication and upload modals share one overlay but now open and close independently.
- `AddRecipeView` selectors are scoped so the authentication modal is not opened by the Add Recipe button.
- The latest modal selector fix is currently uncommitted.

## Current Git checkpoint

Latest pushed commit:

```text
7351f36 Imlemented new recipe detail visual.
```

Current uncommitted files at this checkpoint:

```text
src/js/controller.js
src/js/views/addRecipeView.js
src/js/views/authView.js
src/sass/_components.scss
src/sass/_upload.scss
```

Review these changes before committing. Do not reset or discard them.

## Validation commands

Frontend:

```bash
cd src
npm install
npm run build
```

Backend:

```bash
cd api
npm install
npm test
DATABASE_URL="postgresql://forkity:forkity@localhost:5432/forkity?schema=public" npm run db:validate
```

Local full stack:

```bash
cd api
docker compose up -d --wait database
DATABASE_URL="postgresql://forkity:forkity@localhost:5432/forkity?schema=public" npx prisma migrate deploy
DATABASE_URL="postgresql://forkity:forkity@localhost:5432/forkity?schema=public" JWT_SECRET="local-development-test-secret" FRONTEND_ORIGIN="http://localhost:1234" npm start
```

In another terminal:

```bash
cd src
npm start
```

Frontend URL: `http://localhost:1234`
Backend URL: `http://localhost:3000`

## Next session plan

1. Confirm the modal behavior fixes in the browser:
   - sign-in modal opens and closes
   - upload modal opens after authentication
   - overlay and close buttons affect only the active modal
2. Run the frontend build again.
3. Review `git diff` and commit/push the uncommitted behavior and visual polish.
4. Continue targeted UI review only after behavior is stable.
5. Address remaining Sass deprecation warnings later; they are not caused by the latest visual changes.
