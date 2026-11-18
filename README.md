# Ministry Management System

A production-grade full-stack platform for a high-school outreach ministry serving 8 schools. Built to survive leadership turnover: roles and data belong to the term, not to people.

## Highlights
- **Role-based access** for 9 roles (Chair, Patron, Secretary, Treasurer, Prayer Sec, Dad, Mum, OS, Facilitator) with server-enforced 24-hour edit locks
- **Offline-capable** report entry with IndexedDB queue and idempotency keys
- **Append-only treasury ledger** with line-item breakdowns and auto-calculated totals
- **Fuzzy-match deduplication** for the unified member registry
- **Onboarding gate** that blocks leaders until they set their department targets

## Stack
Frontend: React 18, TypeScript, Vite, Tailwind CSS, React Router
Backend: Hono (Web-standard fetch handler), Drizzle ORM, Zod
Database: Neon Postgres (serverless)
Deployment: Netlify (frontend) + Vercel (backend) via same-origin proxy

## Architecture
- Monorepo (`/frontend`, `/backend`, `/shared`)
- Single Hono app behind one catch-all function on Vercel
- Netlify proxies `/api/*` to Vercel so cookies stay first-party
- No paid services — every dependency fits a free tier

## Local Development
```bash
npm install
cp backend/.env.example backend/.env
# add DATABASE_URL (Neon pooled connection string)
npm run db:generate && npm run db:migrate
npm run dev
Test Credentials (seeded)
Role	Username	Password
Chair	chair	password123
Treasurer	treasurer	password123
Secretary	secretary	password123
Status
Phase 1 (auth, policy, onboarding gate): complete
Phase 2 (people registry, treasury): complete
Phase 3 (reports, minutes, analytics): in progress

What I'd Build Next
PDF generation for meeting minutes (via @react-pdf/renderer)

Weekly exec meeting dashboard with target-vs-actual charts

Automated backup to Cloudflare R2

text

That README alone will make your repo stand out. It signals you understand **the problem** (leadership turnover), **the constraints** (free tier, Kenya Data Protection Act), and **the tradeoffs** (proxy for cookies, single function for Vercel limits).

---

## Commands To Set This Up Now

Run these in Git Bash, **from the project root**:

### Step 1: Initialize the repo locally (if not already)
```bash
cd /c/Users/NewAdmin/projects/ministry
git init
