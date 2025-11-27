
## Summary of changes ## Jose Mendez-

- Added Service resource (CRUD): model, controller, routes
  - `src/models/Service.js` — Service mongoose model
  - `src/controllers/serviceController.js` — create, read, update, delete handlers
  - `src/routes/serviceRoutes.js` — public and protected routes mounted at `/api/services`
- Registered services router in `src/app.js` (mounted at `/api/services`).
- Auth improvements for production-safe JWT handling:
  - `src/controllers/auth.controller.js` — signs tokens with RS256 when `JWT_PRIVATE_KEY` is provided; falls back to HS256 using `JWT_SECRET`.
  - `src/middleware/auth.js` — verifies tokens using RSA public key (`JWT_PUBLIC_KEY`) if present, otherwise verifies with `JWT_SECRET` (HS256).
- Server startup improvements:
  - `server.js` now provides a local MongoDB fallback for development and performs environment checks when `NODE_ENV=production` to enforce secure JWT configuration.
- Key generation support:
  - `scripts/generate_keys.js` — small Node script that generates an RSA 2048 keypair and prints escaped keys ready for `.env`.
- `.env.example` and a development `server/.env` (generated keys) were added for convenience. Please treat the included `.env` as development-only and replace with secure secrets in production.

## How to run (local development)
1. From project root:
```powershell
cd server
npm install
```
2. Ensure you have a `.env` in `server/`. You can copy the example:
```powershell
copy .env.example .env
notepad .env
```
3. If you want RS256 (recommended for production), populate `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` in `.env` with escaped PEM lines (the repo contains a development `.env` with generated keys). If you prefer HS256 for quick local testing, set `JWT_SECRET`.
4. Start the dev server:
```powershell
npm run dev
```
The server will print warnings if it falls back to local MongoDB or a development JWT secret.

## Production JWT recommendation
- Use RS256 (asymmetric) signing for production: sign tokens with a private key (`JWT_PRIVATE_KEY`) and verify with the public key (`JWT_PUBLIC_KEY`). Keep the private key secret and rotate keys periodically.
- If you must use HS256 (symmetric), use a long random `JWT_SECRET` (>= 32 characters) and keep it safe (e.g., vault, environment variable).

Key generation (Windows PowerShell) — example (already added in repo):
1. Run the script from `server/`:
```powershell
node .\scripts\generate_keys.js
```
2. The script prints two lines starting with `PRIVATE=` and `PUBLIC=` where `\n` is used for newlines. Paste those values into your `.env` as shown in `.env.example` with quotes around the value.

Security note: the repository currently contains a development `.env` with a generated keypair. Do NOT use these keys in production and consider rotating them.

## API endpoints
Base URL (default local): `http://localhost:4000`

- Auth
  - POST `/api/auth/register` — register a new user
  - POST `/api/auth/login` — login and receive a token

- Services
  - GET `/api/services` — list services (public)
  - GET `/api/services/:id` — get single service (public)
  - POST `/api/services` — create service (protected)
  - PUT `/api/services/:id` — update service (protected, provider only)
  - DELETE `/api/services/:id` — delete service (protected, provider only)

## Postman quick setup
Create a Postman Environment (e.g., `ServiceConnect Local`) and add variables:
- `baseUrl` = `http://localhost:4000`
- `token` = (empty initially)
- `serviceId` = (optional)

### Register (example)
POST {{baseUrl}}/api/auth/register
```markdown
# Service Connect — Server README

This document summarizes recent role-related changes, the new superuser seed, and gives Postman/cURL examples you can use to test role-based behavior locally.

**Important**: This README focuses only on server changes. See the `client/` README for frontend details.

**Superuser credentials created for local testing**
- email: `admin@admin.com`
- name: `admin`
- password: `Adminpasss`
- role: `superuser`

To (re)create the superuser locally run:
```powershell
cd server
npm run seed-admin
```

What changed (high level)
- Roles: `user`, `provider`, `admin`, `superuser` are now supported (stored in `src/models/User.js`).
- Role enforcement: `src/middleware/auth.js` exposes `requireAuth` and `requireRole(...)`.
  - `requireRole(...)` accepts either `requireRole('user')` or `requireRole(['user','provider'])`.
  - `admin` and `superuser` bypass route role checks (they still must present a valid token).
- Routes and controllers updated to enforce role behaviors:
  - Providers may create/update/delete services they own. `superuser`/`admin` may also modify/delete services.
  - Users (customers) may view services and create bookings.
  - Providers may view bookings for services they own.
- Seed script: `server/scripts/seed_admin.js` creates the `superuser` account.

Allowed `Service.category` values
- The `Service` model enforces an enum for `category`. Use one of:
  - `plumbing`
  - `electrical`
  - `moving`
  - `cleaning`
  - `other`

Local setup and common commands
1. Install and start server:
```powershell
cd server
npm install
npm run dev
```
2. (Optional) Seed the superuser:
```powershell
npm run seed-admin
```

API quick reference (base URL: `http://localhost:4000`)
- POST `/api/auth/register` — register a new user (role may be `user` or `provider` during registration)
- POST `/api/auth/login` — login and receive a JWT token
- GET `/api/services` — list services
- GET `/api/services/:id` — get single service
- POST `/api/services` — create service (protected — provider or superuser/admin)
- PUT `/api/services/:id` — update service (provider owning service or superuser/admin)
- DELETE `/api/services/:id` — delete service (provider owning service or superuser/admin)
- POST `/api/services/:id/booking` — create booking (user role)
- GET `/api/services/:id/booking` — provider may view bookings for their service

Postman / testing examples
Create a Postman environment with variables:
- `baseUrl` = `http://localhost:4000`
- `token` = (empty initially)
- `serviceId` = (empty)

1) Register a provider
- Request
  - POST `{{baseUrl}}/api/auth/register`
  - Headers: `Content-Type: application/json`
  - Body:
```json
{
  "name": "Provider One",
  "email": "provider1@test.com",
  "password": "ProviderPass1",
  "role": "provider"
}
```

2) Register a user (customer)
- Request
  - POST `{{baseUrl}}/api/auth/register`
  - Body:
```json
{
  "name": "User One",
  "email": "user1@test.com",
  "password": "UserPass1"
}
```

3) Login (get token)
- Request
  - POST `{{baseUrl}}/api/auth/login`
  - Body:
```json
{
  "email": "provider1@test.com",
  "password": "ProviderPass1"
}
```
- Response contains `token`. Save it into `{{token}}`.

4) Create a service (provider)
- Request
  - POST `{{baseUrl}}/api/services`
  - Header: `Authorization: Bearer {{token}}`, `Content-Type: application/json`
  - Body (category must match enum):
```json
{
  "title": "Home Cleaning",
  "description": "Thorough apartment cleaning",
  "category": "cleaning",
  "price": 80
}
```
- Response: service object with `_id` — save into `{{serviceId}}`.

5) Create a booking (user)
- Login as the user created above, set `{{token}}` to that token.
- Request
  - POST `{{baseUrl}}/api/services/{{serviceId}}/booking`
  - Header: `Authorization: Bearer {{token}}`
  - Body:
```json
{
  "date": "2025-12-01",
  "notes": "Please arrive on time"
}
```

6) Superuser quick test
- Login as the seeded superuser (`admin@admin.com` / `Adminpasss`) and obtain token.
- Using the superuser token, you can create/update/delete services (the middleware allows `admin`/`superuser` to bypass route role checks). Note: service data still must pass model validation (eg. `category` must be one of the allowed values).

Examples: cURL and PowerShell
- Login (cURL):
```bash
curl -X POST "http://localhost:4000/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@admin.com","password":"Adminpasss"}'
```
- Create service (cURL) — replace `<TOKEN>` with the JWT:
```bash
curl -X POST "http://localhost:4000/api/services" -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" -d '{"title":"Lawn Mowing","description":"Weekly","category":"other","price":35}'
```
- Login + create service example (PowerShell):
```powershell
#$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/api/auth/login' -ContentType 'application/json' -Body '{"email":"admin@admin.com","password":"Adminpasss"}'
#$token = $login.token
#Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/api/services' -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body '{"title":"Svc","description":"desc","category":"other","price":10}'
```

Notes & recommendations
- The server will fall back to a local MongoDB at `mongodb://127.0.0.1:27017/service_connect_db` if `MONGO_URI` is not set. For production, set `MONGO_URI` to your managed DB.
- For local testing we use a development JWT secret if RSA keys are not provided. In production, use RS256 keys or a strong HS256 secret of length >= 32.
- Registration allows `provider` and `user` values only. `admin` and `superuser` must be created via the seed script or directly in the database.
- If you prefer administrator approval for providers, I can add an admin-only endpoint to promote a `user` to `provider` instead of allowing self-registration.

---
End of server README.
```



