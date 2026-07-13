# Real Estate CRM

[🔗 View Live Application](https://real-estate-crm-obsa.vercel.app/)

A comprehensive Software-as-a-Service (SaaS) CRM designed for real estate professionals. This platform centralizes lead management, automates follow-ups, generates financial documents, and proactively matches buyers with sellers in a unified, mobile-optimized workspace.

---

## Features & Business Logic

- **Centralized Agent Hub & Dual-System Logging:** A unified dashboard for lead interaction. Features a dual-logging architecture utilizing Prisma Model Aliasing: static "Sticky Notes" for general remarks and a chronological "Activity Timeline" for calls, messages, and meetings.
- **Algorithmic Lead Matching & WhatsApp Integration:** A memoized algorithm that scans the database to match inverse lead types (e.g., automatically matching a buyer with available sellers in the exact same location). Generates formatted WhatsApp messages for instant client outreach.
- **Interactive Financials with Optimistic UI:** A complete invoicing module to track commission receipts. Agents can toggle invoice statuses (e.g., "Pending" to "Paid") instantly via Optimistic UI state updates, while Next.js Server Actions safely mutate the PostgreSQL database in the background.
- **Client-Side PDF Generation:** Dynamically renders professional, branded PDF invoices entirely within the browser using `@react-pdf/renderer`, eliminating the need for external PDF API services.
- **Interactive Kanban Pipeline:** A drag-and-drop interface (`@hello-pangea/dnd`) for visually managing lead stages. State changes are backed by server actions to ensure data integrity.
- **Lead Health Scoring:** An automated scoring system that visually flags cooling leads (Green, Yellow, Red indicators) by analyzing a lead's `lastContactDate` against their current pipeline stage.
- **Automated Cron Workflows:** Serverless Vercel Cron routes integrated with Nodemailer (Resend/Mailtrap) to dispatch automated daily briefing emails and follow-up reminders.

---

## Technology Stack

This application is built as a full-stack monolith, utilizing Next.js as both the frontend client and the backend API/Action layer.

- **Core Framework:** Next.js 16 (App Router, Server Actions)
- **Language:** TypeScript (Strict)
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL (Hosted via Supabase)
- **ORM:** Prisma
- **Authentication:** NextAuth.js v5 (Auth.js)
- **Hosting:** Vercel

---

## Security & Authentication

The platform features an open but secure registration system:

- **Email Verification:** Users can register and authenticate via secure, one-time passwords (OTP) sent directly to their email.
- **Google OAuth:** Seamless sign-in utilizing Google credentials, with custom interceptors mapping Google IDs to strict PostgreSQL UUIDs.

---

## Local Development

We use `pnpm` exclusively to maintain a strict and consistent dependency tree.

Please read our **[CONTRIBUTING.md](./CONTRIBUTING.md)** for detailed instructions on our Git flow, branch management, and environment variable setup before opening a pull request.

```bash
# 1. Clone the repository
git clone [https://github.com/haider-kashan/real-estate-crm.git](https://github.com/haider-kashan/real-estate-crm.git)
cd real-estate-crm

# 2. Install dependencies (requires pnpm)
pnpm install

# 3. Setup environment variables
cp .env.example .env

# 4. Generate Prisma Client & push schema to your local/preview database
pnpm exec prisma generate
pnpm exec prisma db push

# 5. Start the development server
pnpm dev
```

---

## The Team

This system was architected and developed by a core team of three engineers, utilizing AI-assisted pair programming:

- **Mudassar Awan** - [Git Hub](https://github.com/mudassarawan01) - mudassarawan507@gmail.com
- **Abdullah Hassan** - [Git Hub](https://github.com/Abdullah4806-iiui) - mabdullahhassan.dev@gmail.com
- **Kashan Haider** - [Git Hub](https://github.com/haider-kashan) - thekashanhaider@gmail.com
