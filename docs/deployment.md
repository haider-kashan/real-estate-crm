# Deployment Guide

This document outlines the standard operating procedures for deploying the EstatePulse to production. The application is hosted on **Vercel** (compute/hosting) and **Supabase** (database).

---

## 1. Infrastructure Overview

- **Hosting:** Vercel (Edge Network & Serverless Functions)
- **Database:** Supabase (PostgreSQL)
- **Connection Pooling:** Supabase IPv4 `pgbouncer` (Transaction Mode)
- **Domain Management:** Managed via Vercel Domains

## 2. Supabase (Database) Production Setup

Before deploying the Next.js application, the production database must be provisioned.

1.  Create a new project in your Supabase Dashboard.
2.  Navigate to **Project Settings -> Database**.
3.  **Retrieve Connection Strings:**
    - _Transaction Pooler (`DATABASE_URL`):_ Used for runtime queries. Ensure port `6543` and `?pgbouncer=true` are in the string.
    - _Session/Direct (`DIRECT_URL`):_ Used for Prisma migrations. Uses port `5432`.
4.  **Run Production Migrations:**
    From your local machine, push the schema to production using the direct URL:
    ```bash
    # Swap your local .env values for production momentarily, then run:
    pnpm exec prisma db push
    ```

## 3. Vercel (Next.js) Deployment

Deployment to Vercel is fully automated via GitHub integration.

### Step 1: Link the Repository

1.  Log in to the Vercel Dashboard.
2.  Click **Add New -> Project**.
3.  Import the `real-estate-crm` repository from GitHub.
4.  Leave the framework preset as **Next.js**.

### Step 2: Configure Environment Variables

Before clicking deploy, you MUST add the production environment variables.

| Variable Name     | Value / Description                                    | Environment Scope |
| :---------------- | :----------------------------------------------------- | :---------------- |
| `DATABASE_URL`    | Supabase pooled connection string (port 6543)          | Production        |
| `DIRECT_URL`      | Supabase direct connection string (port 5432)          | Production        |
| `AUTH_SECRET`     | 32-byte base64 string for NextAuth v5                  | Production        |
| `AUTH_URL`        | `https://your-production-domain.com`                   | Production        |
| `AUTH_TRUST_HOST` | `true` (Required when hosting on Vercel)               | Production        |
| `ADMIN_EMAIL`     | The email address granted access to `/admin` analytics | Production        |
| `SMTP_HOST`       | e.g., `smtp.gmail.com`                                 | Production        |
| `SMTP_PORT`       | e.g., `587`                                            | Production        |
| `SMTP_USER`       | Your email service account address                     | Production        |
| `SMTP_PASS`       | Your email service App Password                        | Production        |
| `CRON_SECRET`     | Secure string protecting cron and keep-alive routes    | Production        |

_Note: Ensure your testing variables are strictly scoped to the "Preview" environment to prevent Next.js data leakage across deployment branches._

### Step 3: Build & Deploy

Click **Deploy**. Vercel will automatically run `pnpm install` and `pnpm build`.

---

## 4. Configuring Vercel Cron Jobs

The application relies on serverless cron jobs for automated email briefings, health checks, and database keep-alives (preventing Supabase pauses). These are defined in the `vercel.json` file in the root directory.

1.  Ensure your `vercel.json` includes your required triggers. For example:
    ```json
    {
      "crons": [
        {
          "path": "/api/keep-alive",
          "schedule": "0 0 * * *"
        },
        {
          "path": "/api/cron/morning-briefing",
          "schedule": "0 8 * * *"
        }
      ]
    }
    ```
2.  Once deployed, Vercel will automatically read this file and register the cron triggers. You can verify their status in the Vercel Dashboard under the **Settings -> Cron Jobs** tab.

## 5. CI/CD Pipeline & Rollbacks

- **Automated Deployments:** Any code merged into the `main` branch automatically triggers a production build.
- **Preview Deployments:** Any PR or commit pushed to the `dev` branch generates a unique Preview URL connected to the testing database.
- **Instant Rollbacks:** If a production bug occurs, navigate to Vercel Deployments, click the three dots (`...`) next to the last stable build, and select **Promote to Production** for a zero-downtime rollback.
