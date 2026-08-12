# API & Data Fetching Reference

The EstatePulse operates as a modern Next.js monolith. To maximize type safety and reduce client-side JavaScript, we favor **Server Actions** over traditional REST endpoints for all internal client-to-server communication. Traditional API routes (`app/api/`) are strictly reserved for external webhooks, automated cron jobs, and NextAuth.js.

---

## 1. Internal API: Next.js Server Actions

Server Actions are asynchronous TypeScript functions executed on the server. They are called directly from Client Components (e.g., `LeadClient.tsx`, `PipelineClient.tsx`) to mutate data without requiring manual `fetch` calls or API route setup.

### Location

- **Global Actions:** `app/actions.ts`
- **Domain-Specific Actions:** `app/lib/lead-actions.ts`, `app/lib/auth-actions.ts`

### Core Lead Actions

#### `getLeads()`

Fetches the latest leads for the authenticated user's dashboard.

- **Returns:** `Promise<Lead[]>`
- **Cache Strategy:** Utilizes Next.js `unstable_cache` scoped by `VERCEL_ENV` and user ID to prevent data bleeding between branches while ensuring fast subsequent loads.

#### `getLead(id: number)`

Fetches deep relational data for a specific lead, including chronological logs and invoice history.

- **Parameters:** `id` (Lead ID)
- **Returns:** `Promise<Lead & { logs: Note[], invoices: Invoice[] } | null>`

#### `updateLead(id: number, data: Partial<Lead>)`

Updates core lead data (budget, status, property type) and triggers path revalidation.

- **Parameters:** `id` (Lead ID), `data` (Payload)
- **Returns:** `{ success: boolean, error?: string }`

### Activity & Financial Actions

#### `updateLeadStickyNote(id: number, content: string)`

Updates the static, general-purpose sticky note attached to a lead profile.

- **Parameters:** `id` (Lead ID), `content` (Markdown/Text string)
- **Returns:** `{ success: boolean }`

#### `addLeadActivityLog(leadId: number, userId: string, type: string, content: string)`

Appends a new chronological event (Call, WhatsApp, Meeting) to the lead's activity timeline.

- **Returns:** `{ success: boolean, logId?: number }`

#### `updateInvoiceStatus(invoiceId: string, status: 'paid' | 'pending')`

Toggles the financial status of a commission invoice.

- **Parameters:** `invoiceId` (String CUID), `status` (Target status)
- **Side Effects:** Triggers `revalidatePath('/leads/[id]')` to update the UI instantly.
- **Returns:** `{ success: boolean }`

---

## 2. External API: REST Endpoints

Traditional API endpoints located in the `app/api/` directory. These are exposed for third-party integrations and automated serverless triggers.

### Vercel Cron Routes

These routes are secured via Vercel's `CRON_SECRET` environment variable to prevent unauthorized public execution.

#### `GET /api/cron/morning-briefing`

- **Purpose:** Triggers the daily 8:00 AM aggregation script. Scans the database for leads requiring follow-ups today and dispatches a consolidated HTML email itinerary to the agent via Nodemailer.
- **Authorization:** Requires `Bearer <CRON_SECRET>`

#### `GET /api/cron/lead-health-check`

- **Purpose:** Background job that scans for cooling leads (e.g., `lastContactDate` > 7 days) and updates internal flags or dispatches warning notifications to the agent.
- **Authorization:** Requires `Bearer <CRON_SECRET>`

### Authentication Routes

#### `POST/GET /api/auth/[...nextauth]`

- **Purpose:** Dynamic route handler managed by Auth.js (NextAuth v5). Handles OAuth callbacks (Google), credentials verification, session management, and CSRF token generation.
- **Documentation:** Refer to [Auth.js official documentation](https://authjs.dev/).

---

## 3. Error Handling & Type Safety

By heavily utilizing Server Actions alongside Prisma, this application achieves **End-to-End Type Safety**.

- **Compile-Time Verification:** If the database schema changes in `schema.prisma`, TypeScript will immediately flag errors in the Server Actions, which in turn flags errors in the React Client Components.
- **Action Responses:** All mutating Server Actions follow a standard JSON response pattern to allow the frontend to handle errors gracefully without relying on HTTP status codes:
  ```typescript
  type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
  };
  ```
