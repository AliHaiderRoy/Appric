<div align="center">

# 🚀 TechFlow

### Modern Software House Website

A high-performance, visually stunning software house website built with **Next.js**, **Tailwind CSS**, and **MongoDB**.

📧 **Contact:** appric172@gmail.com  
🏢 **Developed by APPRIC Software House**

</div>

---

## 🌟 Project Overview

**TechFlow** is a modern, scalable, and SEO-friendly software house website designed for IT companies and digital agencies.  
It combines smooth animations, responsive layouts, and a clean architecture ready for backend integrations.

---

## ✨ Features

✔ Modern animated UI using **Framer Motion**  
✔ Fully responsive across all devices  
✔ SEO-optimized structure  
✔ Contact form with backend support  
✔ Blog with search & filtering  
✔ Portfolio & project showcase  
✔ Services pages  
✔ About page with team section

---

## 🧰 Tech Stack

### 🎨 Frontend

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion**
- **Lucide Icons**

### 🛠 Backend

- **Node.js**
- **MongoDB**
- **Mongoose**

---

## ⚙️ Getting Started

### 📌 Prerequisites

- Node.js **18+**
- MongoDB Atlas _(or local MongoDB)_

---

### 📥 Installation

1️⃣ Clone the repository:

```bash
git clone https://github.com/Tanseerhussain/software_house_website.git
```

2️⃣ Install dependencies and configure environment:

```bash
cd software_house_website-main
npm install
cp .env.example .env
# Fill in your Supabase credentials in .env
```

3️⃣ Run the development server:

```bash
npm run dev
```

---

## 🏢 Office Dashboard (Internal)

The project includes a **role-based internal office dashboard** at `/dashboard`, powered by **Supabase** (Auth, PostgreSQL, RLS, Storage).

### Dashboard URL

- **Login:** `/auth/login`
- **Dashboard:** `/dashboard`

### Environment Variables

| Variable                        | Description                                               |
| ------------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (browser-safe)                            |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only service role key                              |
| `NEXT_PUBLIC_SITE_URL`          | App URL for auth redirects (e.g. `http://localhost:3000`) |
| `DATABASE_URL`                  | Optional — direct PostgreSQL connection for migrations    |

> **Security:** Never commit real keys. Use placeholders in `.env.example`. Rotate keys if exposed.

### Database Setup

Run migrations in order via the [Supabase SQL Editor](https://supabase.com/dashboard) or `psql`:

```bash
npm run migrate
# or: node scripts/run-migrations.js
```

### Create First Admin

After running migrations, bootstrap the first admin user:

```bash
npm run bootstrap-admin -- admin@yourcompany.com "YourSecurePassword" "Admin Name"
```

Then sign in at `/auth/login`. Additional employees are **invite-only** — HR/Admin invites via **Dashboard → Employees → Invite Employee**.

---

### How to Open the Dashboard

1. Start the app: `npm run dev`
2. Open **http://localhost:3000/auth/login**
3. Sign in with your admin or employee credentials
4. You are redirected to **http://localhost:3000/dashboard**

A **Login** button also appears in the public website header (top-right). After signing in, it changes to **Dashboard** with your profile photo.

---

### Auth Flow (One-Time Login & Signup)

Registration is **invite-only** — there is no public signup form.

| Step | Who | What happens |
| ---- | --- | ------------ |
| 1 | **Admin/HR** | Runs `npm run bootstrap-admin` (first admin) or invites via **Dashboard → Employees → Invite Employee** |
| 2 | **Employee** | Receives invite email from Supabase |
| 3 | **Employee** | Clicks link → `/auth/callback` → `/auth/register` to set password (one time) |
| 4 | **Employee** | Redirected to `/dashboard` — profile auto-created via database trigger |
| 5 | **Everyone** | Future visits: **Login** at `/auth/login` only |

After login, your **profile, role, and avatar** sync everywhere:

- Dashboard sidebar & navbar
- Public website header (Login → Dashboard + avatar)
- Profile page (`/dashboard/profile`)

---

### Images & Supabase Storage Buckets

Images are **not stored in Git** — they live in **Supabase Storage** (created by migration `004_seed_data.sql`):

| Bucket | Purpose | Who can upload |
| ------ | ------- | -------------- |
| `avatars` | Profile photos | Each user uploads their own |
| `news-images` | Office news cover images | HR / Admin |
| `cms-images` | Public site portfolio, blog, team, client logos | Admin (CMS) |

**How images reflect on the site:**

1. Upload avatar at **Dashboard → Profile** → `avatars/{user-id}/avatar.{ext}`
2. Public URL saved to `profiles.avatar_url` — shown in dashboard navbar and public header when logged in
3. **Dashboard → News → New Post** — upload cover image → `news-images` bucket → `office_news.cover_image_url`
4. **Dashboard → CMS** — upload images for portfolio, blog, team, and client logos → `cms-images` bucket → stored URLs in CMS tables (live on public site via Realtime)

Images are **not in Git**; only URLs are stored in PostgreSQL. Run migration `008_cms_storage.sql` if the `cms-images` bucket is missing.

To verify buckets: Supabase Dashboard → **Storage** → `avatars`, `news-images`, `cms-images`.

---

### Roles & Access

| Role         | Access                                                             |
| ------------ | ------------------------------------------------------------------ |
| **admin**    | Full system: users, roles, departments, settings, audit logs       |
| **hr**       | Employees, attendance reports, announcements, news, leave approval |
| **manager**  | Team attendance, pending leave approvals, team reports             |
| **employee** | Own profile, check-in/out, announcements, news, leave requests     |

### How Roles Are Assigned

Roles are **never chosen by the employee** at signup (security). They are set in one of two ways:

| Method | Who | Role dropdown | Stored in |
| ------ | --- | ------------- | --------- |
| **Bootstrap script** | First setup | N/A — always `admin` | `profiles.role` via `npm run bootstrap-admin` |
| **Invite Employee** | Admin or HR | **Dashboard → Employees → Invite Employee → Role** | `profiles.role` before invite email is sent |

**Flow:**

1. **Admin/HR** opens **Dashboard → Employees → Invite Employee**
2. Selects role from dropdown: **Admin**, **HR**, **Manager**, or **Employee**
3. Clicks **Send Invite** — role is saved to Supabase `profiles` table
4. **Invitee** opens email link → **Complete Signup** page shows their **assigned role (read-only dropdown)**
5. Invitee sets password → logs in with that role enforced by RLS + middleware

To change someone's role later: **Dashboard → Employees → [person] → Edit** (HR/Admin only).

### Dashboard Modules

| Module | Route | Roles |
| ------ | ----- | ----- |
| Overview | `/dashboard` | All |
| Attendance | `/dashboard/attendance` | All |
| Announcements | `/dashboard/announcements` | All (HR/Admin create) |
| Office News | `/dashboard/news` | All (HR/Admin create) |
| Employees | `/dashboard/employees` | Manager+ view, HR/Admin manage |
| Leave | `/dashboard/leave` | All |
| Departments | `/dashboard/departments` | HR, Admin |
| Reports | `/dashboard/reports` | Manager, HR, Admin |
| Settings | `/dashboard/settings` | Admin |
| **Website CMS** | `/dashboard/cms` | Admin |
| **Contact Inbox** | `/dashboard/messages` | HR, Admin |
| Profile | `/dashboard/profile` | All |

---

### Website CMS (Real-Time Public Site)

Admins can manage all public website content from **Dashboard → Website CMS** (`/dashboard/cms`).

| CMS Section | What you can edit | Public page |
| ----------- | ----------------- | ----------- |
| Hero & Stats | Homepage headline, CTAs, statistics | `/` |
| Branding | Company name, tagline, footer | All pages |
| Services | Service cards (draft/published) | `/`, `/services` |
| Portfolio | Project showcase | `/portfolio` |
| Blog | Public blog posts | `/blog` |
| Team | About page team members | `/about` |
| Contact | Email, phone, address, hours | `/contact` |
| Client Logos | Trusted-by marquee | `/` |

**How live updates work:**

1. Admin saves changes in **Website CMS**
2. Content is stored in Supabase (`site_settings`, `site_services`, etc.)
3. Cache is invalidated instantly (`revalidateTag` + `revalidatePath`)
4. Open website tabs refresh automatically via **Supabase Realtime** (no manual reload)

Run CMS migrations after pulling updates:

```bash
npm run migrate
```

---

### Real-Time Contact Messaging

Visitors submit the form at **`/contact`**. Messages are stored in Supabase and appear instantly in the admin inbox.

| Step | Who | What happens |
| ---- | --- | ------------ |
| 1 | **Visitor** | Fills out the contact form on `/contact` |
| 2 | **System** | Message saved to `contact_messages` (status: `new`) |
| 3 | **Admin/HR** | Sees it live at **Dashboard → Contact Inbox** (`/dashboard/messages`) |
| 4 | **Admin/HR** | Reads, replies (internal notes), archives, or opens email client |

**Live features:**

- New messages trigger a **toast notification** in the dashboard inbox
- **Bell badge** includes unread contact message count (Admin/HR)
- **Contact page info** (email, phone, address, hours) updates live from **Website CMS → Contact**

---

### Quick Commands

```bash
npm run dev              # Start website + dashboard
npm run migrate          # Run Supabase SQL migrations
npm run bootstrap-admin -- admin@appric.com "Password" "Admin Name"
```

**Login URL:** http://localhost:3000/auth/login

### Dev Default Credentials

For local development only — create via bootstrap script. **Never use default passwords in production.**

```bash
npm run migrate
npm run bootstrap-admin -- admin@appric.com "YourPassword" "APPRIC Admin"
```
