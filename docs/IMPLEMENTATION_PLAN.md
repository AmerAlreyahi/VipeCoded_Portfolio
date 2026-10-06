# Implementation Plan

Step-by-step guide to take this portfolio from a fresh clone to a live site on **Supabase + Vercel + Resend**.
Estimated time: 30–45 minutes. Every step links straight to the page you need.

> **About the Supabase links:** links containing `/project/_/` open Supabase's project picker. Pick your project once and you land on the right page.

## Overview

| Order | Service | What it does here | Cost |
|------:|---------|-------------------|------|
| 1 | [Supabase](https://supabase.com/dashboard) | Database (content), Auth + MFA (admin login), Storage (images, CV) | Free tier is enough |
| 2 | [Resend](https://resend.com) | Delivers contact-form messages to your inbox | Free tier is enough |
| 3 | [Vercel](https://vercel.com) | Hosts the Next.js site | Free Hobby tier is enough |

**Variables you will collect**

| Variable | Where it comes from | Used for |
|----------|--------------------|----------|
| `SUPABASE_URL` | Supabase → Project Settings → API | Reading content, admin auth |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase → API Keys (`sb_publishable_…`) | Same (safe for browsers; protected by RLS) |
| `ADMIN_EMAILS` | You choose | Who may enter `/admin` |
| `RESEND_API_KEY` | Resend → API Keys (`re_…`) | Sending contact emails (server only) |
| `CONTACT_EMAIL` | Your inbox | Where messages arrive |
| `RESEND_FROM_EMAIL` | Your verified Resend domain | Sender, e.g. `Portfolio <contact@yourdomain.com>` |
| `GITHUB_USERNAME`, `GITHUB_TOKEN` | Optional | Import projects from GitHub (server only) |

> **Never** commit `.env.local`. Only `.env.exmp` (empty placeholders) is tracked by git.

---

## Phase 0 — Run it locally (no accounts needed)

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Without Supabase credentials, development mode shows built-in **sample content**, so you can see the whole UI immediately. Production never serves sample data.

---

## Phase 1 — Supabase

### 1.1 Create the project
1. Open **[Create a new project](https://supabase.com/dashboard/new)**, choose an organization, name it, set a strong database password (store it in a password manager), pick the region closest to your visitors.
2. Wait about a minute for provisioning.

### 1.2 Create tables, policies and storage
1. Open the **[SQL Editor → New query](https://supabase.com/dashboard/project/_/sql/new)**.
2. Paste the whole of [`supabase/seed.sql`](../supabase/seed.sql) and click **Run**.

This creates every table, enables Row Level Security (public read, **admin-only write**), creates the `portfolio` storage bucket with admin-only upload, and inserts fictional sample content.

> ⚠️ `seed.sql` **drops and recreates** the portfolio tables. Run it on a new project. For an existing project, run only [`supabase/security-hardening.sql`](../supabase/security-hardening.sql) to tighten the policies without touching data.

### 1.3 Create your admin user
1. Open **[Authentication → Users](https://supabase.com/dashboard/project/_/auth/users)** → **Add user → Create new user**.
2. Enter your email and a strong, unique password. Tick **Auto Confirm User**.

### 1.4 Allow-list yourself for database and storage writes
Back in the **[SQL Editor](https://supabase.com/dashboard/project/_/sql/new)** run (use the **same email** as above):

```sql
INSERT INTO public.portfolio_admins (email)
VALUES (lower('you@yourdomain.com'))
ON CONFLICT (email) DO NOTHING;
```

Access is checked in **two independent places**: the app (`ADMIN_EMAILS`) and the database (`portfolio_admins`). Both must contain your email.

### 1.5 Lock down sign-ups
Open **[Authentication → Sign In / Providers](https://supabase.com/dashboard/project/_/auth/providers)** and turn **off** "Allow new users to sign up". Only users you create manually can sign in.

### 1.6 Enable multi-factor authentication
Turn on MFA (TOTP) for the project, then enroll your authenticator app the first time you sign in to `/admin`. Reference: [Supabase MFA guide](https://supabase.com/docs/guides/auth/auth-mfa).

### 1.7 Copy your API values
Open **[Project Settings → API Keys](https://supabase.com/dashboard/project/_/settings/api-keys)** and copy:
- **Project URL** → `SUPABASE_URL`
- **Publishable key** (`sb_publishable_…`) → `SUPABASE_PUBLISHABLE_KEY`

> 🚫 Do **not** use or copy the `secret` / `service_role` key. This app does not need it, and it must never be put in a `NEXT_PUBLIC_*` variable or committed.

### 1.8 Redirect URLs (do this after Vercel gives you a URL — Phase 3.5)
Open **[Authentication → URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration)**:
- **Site URL:** `https://your-domain.com`
- **Redirect URLs:** add `https://your-domain.com/**` and `http://localhost:3000/**`

Password-reset and sign-in links use `/auth/callback` and `/admin/reset-password`, so they must be allowed here.

---

## Phase 2 — Resend (contact form)

### 2.1 Account and domain
1. **[Sign up](https://resend.com/signup)** for Resend.
2. Open **[Domains](https://resend.com/domains)** → **Add Domain**, enter your domain (a subdomain such as `mail.yourdomain.com` is fine).
3. Add the DNS records Resend shows (SPF, DKIM, optional DMARC) at your DNS provider and click **Verify**. See Resend's [domain guide](https://resend.com/docs/dashboard/domains/introduction).

> Quick test without a domain: Resend's shared sender `onboarding@resend.dev` can deliver to **your own** account email only. Use it just for a smoke test, then switch to your domain.

### 2.2 API key
Open **[API Keys](https://resend.com/api-keys)** → **Create API Key** with **Sending access** only → copy the `re_…` value (shown once) → `RESEND_API_KEY`.

### 2.3 Sender and recipient
- `RESEND_FROM_EMAIL=Portfolio <contact@yourdomain.com>` (must use the verified domain)
- `CONTACT_EMAIL=you@yourdomain.com` (the inbox that receives messages; replies go to the visitor automatically)

You can inspect every delivery under **[Emails](https://resend.com/emails)**.

> Supabase Auth emails (password reset, etc.) are separate. For production volume, add custom SMTP under **[Authentication → Emails](https://supabase.com/dashboard/project/_/auth/smtp)**; Resend offers SMTP credentials for this.

---

## Phase 3 — Vercel

### 3.1 Put the code on GitHub
Make sure the [pre-publish checklist](#pre-publish-checklist) below is done, then push the repo.

### 3.2 Import the project
1. Open **[Add New Project](https://vercel.com/new)** and import your GitHub repository.
2. Framework preset: **Next.js** (auto-detected). Leave build settings as default.

### 3.3 Environment variables
Before the first deploy, expand **Environment Variables** and add all of these (Production, Preview and Development):

```
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
ADMIN_EMAILS
RESEND_API_KEY
CONTACT_EMAIL
RESEND_FROM_EMAIL
GITHUB_USERNAME     (optional)
GITHUB_TOKEN        (optional, read-only)
```

Docs: [Vercel environment variables](https://vercel.com/docs/environment-variables). You can edit them later under *Project → Settings → Environment Variables*; **redeploy** afterwards so changes apply.

> The build reads your content from Supabase, so `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` must be set **before** the first deploy.

### 3.4 Deploy
Click **Deploy**. When it finishes you get a `*.vercel.app` URL.

### 3.5 Finish Supabase redirects
Go back to **Phase 1.8** and enter your Vercel URL (and custom domain, if any).

### 3.6 Custom domain (optional)
In the Vercel project open **Settings → Domains**, add your domain and create the DNS record Vercel displays. See [Vercel domains](https://vercel.com/docs/domains). Update the Supabase URLs from 1.8 to match.

---

## Phase 4 — Make it yours

1. Open `https://your-domain.com/admin/login`, sign in, complete MFA.
2. Replace **all** sample content: name, bio, roles, avatar, projects, career, skills, social links, email, CV (EN/AR), site title and favicon.
3. Changes appear on the public site immediately (the cache is cleared on every save; otherwise it refreshes every 60 seconds).

---

## Verification checklist

- [ ] `https://your-domain.com` loads with **your** content, not "Sample Developer"
- [ ] Language switch (EN ⇄ AR/RTL) and theme switch work
- [ ] Contact form: send a message → arrives in `CONTACT_EMAIL` → visible under [Resend Emails](https://resend.com/emails)
- [ ] `/admin` signed out redirects to `/admin/login`
- [ ] Signing in with an email **not** in `ADMIN_EMAILS` is refused
- [ ] Image and CV upload work from the admin panel
- [ ] Open the site on a phone: no sideways scrolling

## Pre-publish checklist

Run through this before making the GitHub repository public.

- [ ] `git ls-files | grep -i "\.env"` shows only `.env.exmp`
- [ ] `.env.exmp` has empty values only
- [ ] No `service_role` / `sb_secret_` key, Resend key (`re_…`) or GitHub token anywhere: `git grep -nE "sb_secret|service_role|re_[A-Za-z0-9]{20,}|ghp_|github_pat_"` returns nothing
- [ ] Sample data in `supabase/seed.sql` and `lib/demoContent.ts` is fictional (it uses `example.com`)
- [ ] Your real name, email, phone, CV and photo live **only** in Supabase (via the admin panel), never in the repo
- [ ] Git author identity: commits publish the author email. To hide it, set a GitHub no-reply address *before* committing: `git config user.email "<id>+<username>@users.noreply.github.com"` (see [GitHub email settings](https://github.com/settings/emails))
- [ ] [`LICENSE`](../LICENSE) (MIT) is present and the README credits the original dashboard source

## Security model (what protects the admin)

| Layer | Protection |
|-------|-----------|
| Login | Supabase Auth, sign-ups disabled, MFA |
| Pages | Proxy redirects anyone who is not signed in **and** in `ADMIN_EMAILS` |
| API routes | Every `/api/admin-*` route calls `requireAdmin()` (401/403 otherwise) |
| Database / Storage | Row Level Security: public read, writes only for emails in `portfolio_admins` |
| Uploads | Type and size checks; run with the admin's own session (no master key) |
| Secrets | Server-only env vars; the browser only receives the publishable key |
| Contact form | Server-side Resend call, origin check, input validation, honeypot field, HTML escaping |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Site shows "Portfolio content is unavailable" | `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` missing in Vercel, or `seed.sql` not run. Fix, then redeploy |
| Admin login redirects back with `error=forbidden` | Email missing from `ADMIN_EMAILS` (then redeploy) |
| Saving or uploading fails with a permission error | Email missing from `portfolio_admins` (step 1.4) |
| Password reset link goes to the wrong site | Update Site URL / Redirect URLs (step 1.8) |
| "The contact form is not configured yet" | Set `RESEND_API_KEY`, `CONTACT_EMAIL`, `RESEND_FROM_EMAIL`, then redeploy |
| Resend rejects the email | `RESEND_FROM_EMAIL` domain is not verified yet |
| Edits do not show on the site | Wait up to 60 s, then hard-refresh |
