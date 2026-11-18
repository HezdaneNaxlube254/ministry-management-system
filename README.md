# Ministry Management System

A production-grade full-stack platform for a high-school outreach ministry serving 8 schools. Built to survive leadership turnover: roles and data belong to the term, not to people.

## Highlights

- **Role-based access** for 9 roles (Chair, Patron, Secretary, Treasurer, Prayer Secretary, Dad, Mum, OS, Facilitator) with server-enforced 24-hour edit locks
- **Append-only treasury ledger** with line-item breakdowns and auto-calculated totals
- **Fuzzy-match deduplication** for the unified member registry (Levenshtein distance)
- **Onboarding gate** — leaders are blocked from every route until they set department targets
- **Neon Postgres** serverless database with Drizzle ORM migrations
- **Zero paid services** — every component fits a free tier

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router
- **Backend:** Hono (Web-standard fetch handler), Drizzle ORM, Zod validation
- **Database:** Neon Postgres (serverless, pooled connection)
- **Deployment:** Netlify (static frontend) + Vercel (serverless backend) via same-origin `/api/*` proxy

## Architecture

- Monorepo with `frontend/`, `backend/`, and `shared/` (Zod schemas used by both sides)
- Single Hono app behind one Vercel catch-all function
- Netlify proxies `/api/*` to Vercel so session cookies stay first-party (no CORS)
- All business logic uses Web-standard APIs for portability

## Local Development

```bash
npm install
cp backend/.env.example backend/.env
# Add DATABASE_URL (Neon pooled connection string)
npm run db:generate
npm run db:migrate
npm run dev
Frontend: http://localhost:5173
Backend: http://localhost:3000

Test Credentials
Role	Username	Password
Chair	chair	password123
Treasurer	treasurer	password123
Secretary	secretary	password123
Project Status
☑ Auth (sessions, cookies, 24-hour policy)
☑ Onboarding gate (leaders must set targets first)
☑ Unified member registry with fuzzy dedupe
☑ Treasury ledger with line items, filters, and edit locks
☑ Chair admin (account management, schools, target approvals)
□ Secretary minutes module (guided wizard + PDF)
□ Weekly exec compilation
□ Analytics dashboard
License
MIT
EOFcat > README.md <<'EOF'
# Ministry Management System

A production-grade full-stack platform for a high-school outreach ministry serving 8 schools. Built to survive leadership turnover: roles and data belong to the term, not to people.

## Highlights

- **Role-based access** for 9 roles (Chair, Patron, Secretary, Treasurer, Prayer Secretary, Dad, Mum, OS, Facilitator) with server-enforced 24-hour edit locks
- **Append-only treasury ledger** with line-item breakdowns and auto-calculated totals
- **Fuzzy-match deduplication** for the unified member registry (Levenshtein distance)
- **Onboarding gate** — leaders are blocked from every route until they set department targets
- **Neon Postgres** serverless database with Drizzle ORM migrations
- **Zero paid services** — every component fits a free tier

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router
- **Backend:** Hono (Web-standard fetch handler), Drizzle ORM, Zod validation
- **Database:** Neon Postgres (serverless, pooled connection)
- **Deployment:** Netlify (static frontend) + Vercel (serverless backend) via same-origin `/api/*` proxy

## Architecture

- Monorepo with `frontend/`, `backend/`, and `shared/` (Zod schemas used by both sides)
- Single Hono app behind one Vercel catch-all function
- Netlify proxies `/api/*` to Vercel so session cookies stay first-party (no CORS)
- All business logic uses Web-standard APIs for portability

## Local Development

```bash
npm install
cp backend/.env.example backend/.env
# Add DATABASE_URL (Neon pooled connection string)
npm run db:generate
npm run db:migrate
npm run dev
Frontend: http://localhost:5173
Backend: http://localhost:3000

Test Credentials
Role	Username	Password
Chair	chair	password123
Treasurer	treasurer	password123
Secretary	secretary	password123
Project Status
☑ Auth (sessions, cookies, 24-hour policy)
☑ Onboarding gate (leaders must set targets first)
☑ Unified member registry with fuzzy dedupe
☑ Treasury ledger with line items, filters, and edit locks
☑ Chair admin (account management, schools, target approvals)
□ Secretary minutes module (guided wizard + PDF)
□ Weekly exec compilation
□ Analytics dashboard
License
MIT
EOFcat > README.md <<'EOF'
# Ministry Management System

A production-grade full-stack platform for a high-school outreach ministry serving 8 schools. Built to survive leadership turnover: roles and data belong to the term, not to people.

## Highlights

- **Role-based access** for 9 roles (Chair, Patron, Secretary, Treasurer, Prayer Secretary, Dad, Mum, OS, Facilitator) with server-enforced 24-hour edit locks
- **Append-only treasury ledger** with line-item breakdowns and auto-calculated totals
- **Fuzzy-match deduplication** for the unified member registry (Levenshtein distance)
- **Onboarding gate** — leaders are blocked from every route until they set department targets
- **Neon Postgres** serverless database with Drizzle ORM migrations
- **Zero paid services** — every component fits a free tier

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router
- **Backend:** Hono (Web-standard fetch handler), Drizzle ORM, Zod validation
- **Database:** Neon Postgres (serverless, pooled connection)
- **Deployment:** Netlify (static frontend) + Vercel (serverless backend) via same-origin `/api/*` proxy

## Architecture

- Monorepo with `frontend/`, `backend/`, and `shared/` (Zod schemas used by both sides)
- Single Hono app behind one Vercel catch-all function
- Netlify proxies `/api/*` to Vercel so session cookies stay first-party (no CORS)
- All business logic uses Web-standard APIs for portability

## Local Development

```bash
npm install
cp backend/.env.example backend/.env
# Add DATABASE_URL (Neon pooled connection string)
npm run db:generate
npm run db:migrate
npm run dev
Frontend: http://localhost:5173
Backend: http://localhost:3000

Test Credentials
Role	Username	Password
Chair	chair	password123
Treasurer	treasurer	password123
Secretary	secretary	password123
Project Status
☑ Auth (sessions, cookies, 24-hour policy)
☑ Onboarding gate (leaders must set targets first)
☑ Unified member registry with fuzzy dedupe
☑ Treasury ledger with line items, filters, and edit locks
☑ Chair admin (account management, schools, target approvals)
□ Secretary minutes module (guided wizard + PDF)
□ Weekly exec compilation
□ Analytics dashboard
License
MIT
