# Pathway — Student Counselling Platform

Pathway is a student counselling demo built as two separate applications. The Next.js App Router frontend keeps the current visual experience: warm ivory, forest green, peach accents, inline campus illustrations, mobile navigation, college discovery and the counselling enquiry form. A Node.js + Express + TypeScript backend owns MySQL access and authentication.

## Architecture

```text
Next.js frontend  http://localhost:3000
        │ fetch + HTTP-only cookie
Express API        http://localhost:4000
        │ mysql2 parameterized queries
MySQL              127.0.0.1:3306
```

Prisma has been removed. The backend uses `mysql2/promise`, SQL schema, bcryptjs password hashes, Zod validation and a signed JWT in an HTTP-only cookie. Express protects every dashboard endpoint with the same JWT checks used by the frontend session gate.

## Features

- Responsive landing page at `/` with hero, three-step explanation, four fictional colleges and a working enquiry form.
- `/signup`, `/login` and `/dashboard` flow.
- Server validation, duplicate email errors, bcrypt password hashing, JWT expiration and logout.
- Protected Express endpoints for summary cards and leads.
- Search by name, phone or city, city filter, pagination, loading, empty and error states.
- 25 fictional seeded leads, plus public enquiries stored in MySQL.
- Task 3 SQL in `task3.sql` and schema in `database/schema.sql`.

## Setup

Install Node.js 22.12+ and MySQL 8.4. MySQL Workbench is optional; it is useful for running SQL and inspecting tables, but MySQL Server must be running.

Create the database and application account in Workbench:

```sql
CREATE DATABASE student_counselling CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'counselling_app'@'localhost' IDENTIFIED BY 'YOUR_PRIVATE_PASSWORD';
GRANT ALL PRIVILEGES ON student_counselling.* TO 'counselling_app'@'localhost';
```

Install each application separately:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
cd ..\backend
npm ci
Copy-Item .env.example .env
```

Edit `backend\.env`:

```dotenv
DATABASE_URL="mysql://counselling_app:YOUR_PASSWORD@127.0.0.1:3306/student_counselling"
JWT_SECRET="at-least-32-random-characters"
FRONTEND_ORIGIN="http://localhost:3000"
API_PORT="4000"
```

Edit `frontend\.env.local` so it contains `NEXT_PUBLIC_API_ORIGIN="http://localhost:4000"`.

Generate a secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Keep `.env` private. If the password contains URL characters, URL-encode it.

Create tables and seed demo data:

```powershell
mysql --protocol=TCP --host=127.0.0.1 --port=3306 --user=counselling_app --password student_counselling < database/schema.sql
cd backend
npm run seed
```

Run the two apps in separate terminals:

```powershell
cd backend
npm run dev

# In a second terminal
cd frontend
npm run dev
```

Open `http://localhost:3000`, create an account, log in, and visit the dashboard. There is no default account. Use fictional contact data because this is a demonstration project.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | API health check |
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Set the HTTP-only JWT cookie |
| POST | `/api/auth/logout` | Clear the cookie |
| GET | `/api/auth/me` | Current authenticated user |
| POST | `/api/enquiries` | Save a public counselling lead |
| GET | `/api/leads?search=&city=&page=1` | Protected filtered leads |
| GET | `/api/dashboard/summary` | Protected lead statistics |

The frontend sends `credentials: include`; Express allows only `FRONTEND_ORIGIN`. SQL values are passed as parameters. The API limits JSON bodies to 8 KB, validates inputs with Zod, and never returns password hashes.

## Security and assumptions

Passwords use bcrypt cost 12. JWTs are signed with `JWT_SECRET`, expire after 24 hours, and are stored in `HttpOnly`, `SameSite=Lax` cookies; production cookies also use `Secure`. Any signed-up user can view the shared dashboard because that was selected for the machine test. Real staff software should use invitations, roles, scoped lead access, shared rate limiting, session revocation and privacy controls.

Dates are stored and displayed as UTC. “This week” starts Monday 00:00 UTC. Top-city ties are sorted alphabetically. The colleges and all seeded leads are fictional. The fourth college intentionally has no seed leads so the zero-leads SQL query is demonstrable.

## Task 3 SQL

```sql
SELECT c.id, c.name, c.city, COUNT(l.id) AS lead_count
FROM colleges c JOIN leads l ON l.college_id = c.id
WHERE l.created_at >= UTC_TIMESTAMP() - INTERVAL 30 DAY
GROUP BY c.id, c.name, c.city ORDER BY lead_count DESC, c.id ASC LIMIT 5;

SELECT c.id, c.name, c.city FROM colleges c
LEFT JOIN leads l ON l.college_id = c.id
WHERE l.id IS NULL ORDER BY c.id;
```

The first query ranks only colleges with leads in the rolling last 30 days. The second finds colleges with no leads at any time. Full copies are in `task3.sql`.

## Checks and deliverables

```powershell
cd frontend
npm run typecheck
npm run lint
npm run build

cd ..\backend
npm run typecheck
```

After both servers and MySQL are available, open `http://localhost:3000` and verify signup, login, the dashboard, search, city filtering and logout manually.

## Interview walkthrough

“Next.js owns the user interface and calls a separate Express API. Express validates requests, queries MySQL with parameterized `mysql2` statements, hashes passwords with bcryptjs, and signs a short-lived JWT cookie. The dashboard first asks Express for the current user, then loads summary and lead data through protected endpoints. Search and city filtering happen in MySQL. The visual language is calm and editorial so students can focus on choices, while the dashboard is dense enough for lead review.”
