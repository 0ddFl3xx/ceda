# CEDA Innovation Management Portal

Next.js 16 App Router application with Drizzle ORM, Neon Postgres and Better Auth. The app uses root-level `app/`, `db/`, `lib/` and `components/` directories.

## Local setup

1. Install dependencies and copy the environment template:

```powershell
npm install
Copy-Item .env.example .env.local
```

2. Fill in `.env.local` with a Neon Postgres URL, a random `BETTER_AUTH_SECRET` of at least 32 characters, and Gmail SMTP credentials. Use a Gmail App Password for `GMAIL_APP_PASSWORD`, not your account password. In local development, missing Gmail settings use a console OTP fallback. Production fails closed if Gmail credentials are missing.

3. Generate and apply the database migration, then seed configuration:

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
```

The seed creates built-in roles and permissions, the 2026 CEDA Innovation Management Portal Hackathon call, a workflow, evaluation criteria, categories, and a required technical proposal URL field. Review seed configuration before running it against production.

4. Start the development server:

```powershell
npm run dev
```

To give the first verified account administrator access, set `CEDA_BOOTSTRAP_ADMIN_EMAIL` in `.env.local` to that account's email and run `npm run db:bootstrap-admin` once. The command initializes built-in roles and records the initial role assignment in the audit log. Afterwards, administrators can assign staff roles in `/admin/users`.

## Checks

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

`typecheck` runs `next typegen` first so removed routes do not remain in generated route definitions.

## Authentication notes

- New accounts require an email and password, explicit Data Protection Act 2024 consent, and a six-digit email verification code.
- Sign-in supports email/password and passkeys. Passkeys require `PASSKEY_RP_ID` and `PASSKEY_ORIGIN` to match the deployed domain.
- Development may print OTP codes to the server console when Gmail SMTP is not configured. This fallback is disabled in production.
- Seed built-in roles before registering accounts. Self-registration grants only the submitter role; staff roles are assigned by administrators.
- Phone number collection during registration is temporarily disabled, so signup works without Twilio credentials. The prototype supports password change, role assignment, evaluator self-claim, in-app notifications, and email lifecycle/chat alerts when Gmail SMTP is configured and recipients opt in. SMS alerts, secure file upload, and phone verification are not connected.

## Architecture notes

See [docs/decisions.md](docs/decisions.md) for initial decisions, [docs/build-log.md](docs/build-log.md) for phase status, and [docs/demo-runbook.md](docs/demo-runbook.md) for the role-by-role lifecycle walkthrough. Schema changes are recorded as Drizzle migrations; review migration files before applying them to any configured database.

See [docs/implementation-plan.md](docs/implementation-plan.md) for the requirements-driven delivery order and current implementation status.
