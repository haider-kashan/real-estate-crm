# Security Policy

## Supported Versions

Currently, only the latest `main` branch and active production deployments receive security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Architecture & Authentication

This project uses **NextAuth v5 (Auth.js)** for authentication.

- **Session Strategy:** JWT (JSON Web Tokens).
- **Database:** PostgreSQL (Supabase) with Row Level Security (RLS) disabled at the database level, as all authorization logic is strictly handled via Prisma within Next.js Server Actions.
- **Role-Based Access:** The `/admin` route is protected and strictly checks the user's email against the `ADMIN_EMAIL` environment variable.

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please do not create a public GitHub issue.

Instead, send an email to the project maintainers directly (refer to the `ADMIN_EMAIL` in the environment configuration). We will triage the report and aim to respond within 48 hours. Please include:

- A description of the vulnerability.
- Steps to reproduce the issue.
- Potential impact.
