# Troubleshooting Guide

This document covers common errors encountered during local development and deployment of the Real Estate CRM.

## 1. Database Connection Errors (`P1001` / `P2024`)

**Symptom:** Prisma throws a connection pool timeout or cannot reach the database.
**Fix:**

- Ensure your `DATABASE_URL` in `.env` uses port `6543` and includes `?pgbouncer=true`.
- Ensure your `DIRECT_URL` uses port `5432` without pgbouncer.
- Check the Supabase Dashboard to ensure the database has not been paused due to inactivity.

## 2. NextAuth v5 Redirect Loops or `Missing Secret`

**Symptom:** Logging in redirects back to the login page infinitely, or terminal shows `MissingSecret` error.
**Fix:**

- Ensure `AUTH_SECRET` is set in your `.env` file (generated via `openssl rand -base64 32`).
- If deploying to Vercel, ensure `AUTH_TRUST_HOST=true` is set in the environment variables.

## 3. Server Actions Returning 500

**Symptom:** Clicking a button (e.g., updating a lead) fails silently or throws a generic 500 error.
**Fix:**

- Check the Vercel deployment logs or local terminal. Since Server Actions execute on the server, errors are not visible in the browser console.
- Verify that your Prisma schema is synced with the database (`pnpm exec prisma db push`).

## 4. SMTP Email Failures

**Symptom:** OTPs or lead briefings are not sending.
**Fix:**

- If using Gmail, ensure you have generated an **App Password** for `SMTP_PASS` and are not using your standard account password.
- Verify `SMTP_PORT` is set to `587` (TLS).
