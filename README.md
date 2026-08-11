# Kenbet Precious Academy — Website

Built with Next.js 14 (App Router) + TypeScript + Tailwind CSS + MongoDB.

This is a **real, functioning system** — not a demo. Real authentication, a real database, and
the full 7-role account hierarchy we designed are all wired up and working.

## What's actually working

- **Real authentication** — signup, login, logout with hashed passwords and signed session cookies
- **Real database** (MongoDB via Mongoose) — every account, class, and message is a real record
- **The full account hierarchy**: Owner, Share Owner, Admin, Teacher, Parent, Student, Trial Guest
  — each with correct creation rules and permission limits (Share Owner capped at 4, Owner capped
  at 3, etc.)
- **Parent registration** auto-creates a Student account per child, unassigned to a class
- **Admin dashboard** — assign unassigned students to classes, create new classes, approve trial
  guest → parent upgrade requests, read messages
- **Trial guest flow** — instant self-registration, 1-month expiry, read-only preview, can message
  Admin/Owner directly, can request to become a full Parent account
- **Role-protected routes** — middleware blocks anyone from viewing a portal page that isn't theirs
- **AI assistant** — real Claude-powered chat, and it now knows who it's talking to (a Student gets
  a homework-helper tone, a Parent/Trial Guest gets an admissions tone, staff get a concise tone)
- **Time-of-day mood system** and the **10-loop animated logo** — unchanged from before, still live

## What's still a placeholder

- **Background music** — the UI shows a "playlist playing" label but no actual audio files.
  Source ~20 royalty-free tracks yourself (YouTube Audio Library, Pixabay Music — must be
  royalty-free) and drop them in `public/audio/`; ask me to wire up the player once you have them.
- **Fee payments** — Parent dashboard shows a fees balance placeholder, no real payment
  integration yet (e.g. Paystack/Flutterwave for Nigerian bank transfers).
- **Results/grading, attendance, timetables** — Teacher and Student dashboards show the shell of
  these but not full functionality yet.

## Setup — do this in order

### 1. Install dependencies
```bash
npm install
```

### 2. Create a MongoDB database
1. Go to https://www.mongodb.com/cloud/atlas and create a free cluster
2. Under **Network Access**, add `0.0.0.0/0` (allow from anywhere) so Vercel can connect
3. Under **Database Access**, create a user with a password
4. Get your connection string (looks like `mongodb+srv://user:pass@cluster.mongodb.net/kenbet`)

### 3. Set up environment variables
```bash
cp .env.example .env.local
```
Fill in:
- `MONGODB_URI` — from step 2
- `JWT_SECRET` — run `openssl rand -base64 32` and paste the result
- `SEED_SECRET` — any password-like string, used once
- `ANTHROPIC_API_KEY` — from https://console.anthropic.com (optional — AI assistant just says
  it's not connected yet without this)

### 4. Run the app
```bash
npm run dev
```
Open http://localhost:3000

### 5. Create your first Owner account (do this once)
The Owner account is the top of the hierarchy and can't self-register through the normal signup
form. Create it with:
```bash
curl -X POST http://localhost:3000/api/auth/seed-owner \
  -H "Content-Type: application/json" \
  -d '{"name":"Your Parent'"'"'s Name","email":"owner@kenbet.local","password":"choose-a-real-password","secret":"YOUR_SEED_SECRET"}'
```
(Use the same `SEED_SECRET` value you put in `.env.local`.) This route refuses to run a second
time once an Owner exists — that's intentional.

Then log in at `/login` with that email/password.

## How the account hierarchy actually works in the code

- `/signup` → creates a **Trial Guest** (instant, no approval, 1-month expiry)
- `/register/parent` → creates a **Parent** + auto-creates one **Student** per child listed
- Owner logs in → `/portal/owner` → can create Share Owner / Admin accounts (via the staff API)
- Admin logs in → `/portal/admin` → assigns unassigned students to classes, creates classes,
  approves Trial Guest → Parent upgrade requests
- Trial Guest logs in → `/portal/trial-guest` → can message Admin/Owner, can request to become a
  Parent (Admin approves, which converts their account and creates Student records)

All of this hits real API routes under `app/api/`, backed by real Mongoose models under
`lib/models/`.

## Deploying to Vercel

1. Push this to GitHub
2. Import into Vercel
3. In the Vercel project's **Environment Variables**, add all four values from `.env.local`
   (`MONGODB_URI`, `JWT_SECRET`, `SEED_SECRET`, `ANTHROPIC_API_KEY`)
4. Deploy
5. Run the seed-owner `curl` command again, but against your live Vercel URL instead of
   `localhost:3000`

Common pitfalls from past projects, already accounted for here: make sure MongoDB Atlas Network
Access really does allow `0.0.0.0/0` (not just your home IP), and make sure env vars are set in
Vercel's dashboard, not just in your local `.env.local` file — Vercel doesn't read that file.
