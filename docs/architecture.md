# Architecture Overview

This document outlines the high-level architecture of the EstatePulse. The application is designed as a **Full-Stack Monolith** utilizing Next.js 16 (App Router). This structure allows us to maintain strict end-to-end type safety, colocate business logic with UI components, and streamline deployments.

## System Architecture Diagram

```mermaid
graph TD
    Client[Client Browser / Mobile] -->|HTTPS| Vercel[Vercel Edge Network]

    subgraph "Next.js Application (App Router)"
        direction TB
        RoutePages[Server Components \n page.tsx] --> ClientComps[Client Components \n *Client.tsx]

        ClientComps --> GlobalActions[Global Actions \n app/actions.ts]
        ClientComps --> LibActions[Domain Actions \n app/lib/*-actions.ts]

        API[API Routes \n app/api/] --> External[External Webhooks/Cron]
    end

    subgraph "Business Logic & Data Access"
        GlobalActions --> PrismaClient[Prisma Singleton \n app/lib/prisma.ts]
        LibActions --> PrismaClient
        RoutePages --> PrismaClient
    end

    subgraph "Database Layer"
        PrismaClient -->|pgbouncer pool| Supabase[(Supabase PostgreSQL)]
    end
```
