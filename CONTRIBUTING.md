# Contributing to Real Estate CRM

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript (Strict)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Auth**: NextAuth v5 (Credentials + OTP)
- **Package Manager**: **pnpm only** (enforced via `.gitignore` blocking npm/yarn lockfiles)

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/haider-kashan/real-estate-crm.git
cd real-estate-crm

# 2. Install dependencies (MUST use pnpm)
pnpm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Generate Prisma client
pnpm exec prisma generate

# 5. Run database migrations
pnpm exec prisma db push

# 6. Start development server
pnpm dev
```

## Git Branching Strategy

We follow a simplified **Git Flow** model:

```
main (production) ← dev (integration) ← feat/your-feature
```

### Branch Types

| Prefix | Purpose | Merges Into |
|--------|---------|-------------|
| `feat/` | New features | `dev` |
| `fix/` | Bug fixes | `dev` |
| `hotfix/` | Urgent production fixes | `main` (then backport to `dev`) |
| `chore/` | Refactors, docs, tooling | `dev` |

### Workflow

1. **Always branch from `dev`** (never from `main` directly):
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feat/my-new-feature
   ```

2. **Make your changes**, commit with descriptive messages:
   ```bash
   git add .
   git commit -m "feat: add scheduled follow-ups tab"
   ```

3. **Push and open a Pull Request** to `dev`:
   ```bash
   git push origin feat/my-new-feature
   # Then open a PR on GitHub: feat/my-new-feature → dev
   ```

4. **CI runs automatically** — lint and build must pass before merging.

5. **When `dev` is stable**, open a PR from `dev` → `main` for production release.

### Rules

- ❌ **Never push directly to `main`** — always use Pull Requests.
- ❌ **Never use `npm` or `yarn`** — only `pnpm`.
- ✅ **Always run `pnpm lint` and `pnpm build`** before pushing.
- ✅ **Always update `.env.example`** when adding new environment variables.

## Commit Message Convention

We use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <short description>

feat:     A new feature
fix:      A bug fix
docs:     Documentation only
chore:    Build process, tooling, or maintenance
refactor: Code change that neither fixes a bug nor adds a feature
style:    Formatting, missing semicolons, etc. (not CSS)
test:     Adding or fixing tests
```

## Environment Variables

All required environment variables are documented in [`.env.example`](.env.example). When adding a new variable:

1. Add it to `.env.example` with a placeholder value and a comment explaining its purpose.
2. Add it to your local `.env` / `.env.development` with the real value.
3. If it's needed in production, add it to Vercel's environment variables dashboard.

## Project Structure

```
├── app/
│   ├── components/     # Shared UI components
│   ├── lib/            # Utilities, Prisma client, auth actions
│   ├── admin/          # Admin analytics (restricted to ADMIN_EMAIL)
│   ├── leads/          # Lead CRUD routes
│   ├── login/          # Auth pages
│   ├── register/
│   ├── verify/         # OTP verification
│   ├── forgot-password/
│   ├── reset-password/
│   ├── profile/
│   ├── sales/
│   ├── rentals/
│   ├── analytics/
│   ├── actions.ts      # Server actions
│   ├── layout.tsx      # Root layout (mobile-first, max-w-md)
│   └── page.tsx        # Dashboard
├── prisma/
│   └── schema.prisma   # Database schema
├── auth.ts             # NextAuth server config (Prisma + bcrypt)
├── auth.config.ts      # NextAuth edge config (route protection)
├── proxy.ts            # Edge middleware
└── .github/
    └── workflows/
        └── ci.yml      # CI pipeline (lint + build)
```
