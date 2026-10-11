# Pathway Student Counselling App

Pathway is a student counselling demo built with a Next.js frontend and a Node.js API. It helps a student explore colleges, submit an enquiry, and lets a logged-in user view lead activity in a protected dashboard.

## Tech Stack

- Next.js
- Node.js and Express
- MySQL
- TypeScript
- bcrypt for password hashing
- JWT stored in an HTTP-only cookie

## Setup

Requirements:

- Node.js 22.12 or newer
- MySQL running locally

Create the database:

```sql
CREATE DATABASE student_counselling;
```

Install dependencies:

```powershell
cd frontend
npm install

cd ..\backend
npm install
```

Create environment files:

```powershell
cd backend
Copy-Item .env.example .env

cd ..\frontend
Copy-Item .env.example .env.local
```

Example backend `.env`:

```dotenv
DATABASE_URL="mysql://root:YOUR_PASSWORD@127.0.0.1:3306/student_counselling"
JWT_SECRET="use-a-long-random-secret-with-at-least-32-characters"
FRONTEND_ORIGIN="http://localhost:3000"
API_PORT="4000"
```

Example frontend `.env.local`:

```dotenv
NEXT_PUBLIC_API_ORIGIN="http://localhost:4000"
```

Create tables and seed dummy data:


cd backend
npm run seed
```

Run the API:

```powershell
cd backend
npm run dev
```

Run the frontend in another terminal:

```powershell
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

## What I Completed

- Landing page with hero section, how it works section, college cards, and call to action.
- Responsive layout checked for mobile and desktop.
- Sign up and login with validation messages.
- Password hashing using bcrypt.
- JWT-based login stored in an HTTP-only cookie.
- Protected dashboard route.
- Logout flow.
- Dashboard summary cards for total leads, leads this week, and top city.
- Leads table loaded from the API with search and city filter.
- Loading, empty, and error states for dashboard data.
- Seed data with 25 dummy leads.
- Public enquiry form that saves leads.
- College search from the database with server side filtering.
- Task 3 SQL queries.

## Design Choices

I used green as the main colour because it feels steady and guidance-focused, with soft neutral backgrounds to keep the page easy to read. The typography mixes a clean sans serif with a serif accent to make the page feel less like a generic dashboard template. The dashboard is more compact because it is meant for quick lead review.

## Assumptions

- Any registered user can view the shared demo dashboard.
- The seeded leads and colleges are fictional.
- The current database has colleges and leads, so course selection is mentioned in the landing page but not stored as a separate course entity.
- "Leads this week" is calculated from the current week using UTC dates.
- This is a machine-test project, so deployment was not included.

## What I Would Improve With More Time

- Add a real courses table and link courses to colleges.
- Add user roles so only staff can access the dashboard.
- Add automated tests for authentication and dashboard APIs.
- Add better admin tools for managing colleges and courses.
- Add production-ready deployment settings.

## Task 3 SQL

Top 5 colleges by number of leads in the last 30 days:

```sql
SELECT c.id, c.name, c.city, COUNT(l.id) AS lead_count
FROM colleges AS c
INNER JOIN leads AS l ON l.college_id = c.id
WHERE l.created_at >= UTC_TIMESTAMP() - INTERVAL 30 DAY
GROUP BY c.id, c.name, c.city
ORDER BY lead_count DESC, c.id ASC
LIMIT 5;
```

Colleges with zero leads:

```sql
SELECT c.id, c.name, c.city
FROM colleges AS c
LEFT JOIN leads AS l ON l.college_id = c.id
WHERE l.id IS NULL
ORDER BY c.id ASC;
```

The same answers are also saved in `task3.sql`.

## Screenshots

Screenshots or a short screen recording should be included with the submission. The required screens are:

- Landing page
- Sign-up page
- Login page
- Dashboard

## Notes for Submission

Submit the project without `node_modules`, `.next`, or private `.env` files. Keep `.env.example`, `package.json`, and `package-lock.json` in the zip or Git repository.
