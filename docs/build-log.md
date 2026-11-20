# Build log

## Phase 0 — Repository and transaction foundation

### Built

- Confirmed the application uses root-level `app/`, `db/`, and `lib/` directories. The public landing page was preserved.
- Switched the Drizzle client from Neon HTTP to the Neon serverless Pool driver to support interactive transactions.
- Recorded the identity, role, email, scoring, and chat decisions in `docs/decisions.md`.

### How to try it

- Set `DATABASE_URL` in `.env.local` and use the server-side Drizzle client from `db/index.ts`.

### Unverified

- Interactive transactions have not been exercised against the configured database.

## Phase 1 — Accounts, authentication, roles

### Built so far

- Configured Better Auth with email/password, one-time email codes, a phone-verification plugin reserved for future account settings, and passkey sign-in.
- Added Gmail SMTP delivery through `GMAIL_USER` and `GMAIL_APP_PASSWORD`; outside production, missing Gmail credentials use a console-only code fallback.
- Added an optional Twilio SMS provider with a development-only console fallback and Botswana mobile validation. Phone entry is disabled during registration until a verified account-settings flow exists.
- Added registration with privacy consent, submitter role/profile provisioning, and an audit record in a database transaction.
- Registration is email-only for now. The phone field was removed after Better Auth correctly rejected setting an unverified phone directly; Twilio is not required to create an account.
- Added login, passkey sign-in, forgot/reset password pages, server-side role checks, forbidden page, and role-aware dashboard routing.
- Added all six built-in system roles and their permissions plus the starter call, workflow stages, criteria, categories, and a required technical proposal field. The seed has now been run successfully against the configured database.
- Signup initializes built-in role definitions before creating the auth user; retrying a prior signup repairs its submitter assignment and presents the email verification flow.
- Fixed seed startup so `.env.local` loads before the Neon pool is constructed; the `db:seed` script now runs successfully from the command line.
- Added a Vitest alias matching the app's `@/` imports.

### How to try it

- Configure `DATABASE_URL`, `BETTER_AUTH_URL`, and a random `BETTER_AUTH_SECRET` of at least 32 characters.
- Configure `GMAIL_USER` and `GMAIL_APP_PASSWORD` to receive email verification codes. Without them, codes print only in development logs.
- Twilio credentials are not needed for registration. Add `TWILIO_*` credentials only when phone verification is enabled in account settings.
- `npm run db:seed` is idempotent and has been applied to the configured database.
- Run `npm run dev`, then visit `/signup`, `/login`, and `/forgot-password`.

### Checks

- `npm run typecheck` — passed.
- `npm test` — passed (3 tests).
- `npm run lint` — passed with four existing warnings in public content components.
- `npm run build` — passed. Production requires a real `BETTER_AUTH_SECRET`; the build uses a build-only placeholder when the environment does not provide one.

### Remaining in this phase / unverified

- Add account settings for changing password, managing passkeys and phone number, notification preferences, and revoking other sessions.
- Add email-code and SMS-code sign-in flows and passkey autofill.
- Seed demo identities through Better Auth and provide an admin role-assignment path before staff workspaces are used. The six role definitions and permissions exist now, but no evaluator/admin/consultant/committee users have been assigned those roles.
- Gmail, Twilio, browser passkeys, and actual sign-in/verification have not been tested with live provider credentials.
- The configured database already has most application tables, but its existing schema does not align cleanly with the generated migration history. A migration attempt encountered an existing enum, while a strict schema diff proposed unrelated constraint changes. That diff was aborted without applying changes. Inspection found the `passkey` table missing and auth timestamps without time zones; no schema migrations were applied. The idempotent seed itself succeeded after fixing dotenv import order.
- No phase commit was created because the working tree contains broad pre-existing modified and untracked project files. Only staging the work from this run cannot be established safely from the current Git baseline.

The first identity and public-site phase remains in progress. Later slices are recorded below.

## Phase 2 — Submission foundation and call configuration

### Built

- Added an admin bootstrap command that requires a verified account and assigns the initial admin role. Added a protected user/role assignment screen for later staff onboarding.
- Added protected call creation with a default configurable workflow, call status changes, and admin-managed submission fields.
- Added the submitter form driven by the active call's configured fields, with server-side validation and category checks.
- Submission creation now writes idea version 1, initial stage history, owner subscription, in-app notification, and audit record in a single transaction.
- Added an owner-only dashboard and submission detail page.
- Added a database readiness endpoint and baseline security headers.
- Cleared the Gmail user and app-password values from `.env.example`; the previously exposed app credential still needs revocation or rotation by its owner.

### Read-only database inspection

- `npx.cmd tsx db/schema-baseline-check.mts` found 34 of 35 expected tables. The configured database is missing the Better Auth `passkey` table. No schema mutation or migration was performed.
- The existing migration history is not yet reconciled with the configured database. Inspect migration tracking and prepare a reviewed repair before applying any migration.

### Unverified / next

- Typecheck, lint, build, and browser flow have not been run for this phase.
- Draft editing, file storage, external notification delivery and complete verification remain open.
- New admin and submission flows require a configured verified administrator account; set `CEDA_BOOTSTRAP_ADMIN_EMAIL` and run `npm run db:bootstrap-admin` after verifying the target account.

## Phase 3 — Review lifecycle and operations

### Built

- Added evaluator assignment and a role-protected review queue. Evaluators score configured criteria against a specific immutable idea version; completed stage assignments advance the workflow.
- Added adjudicator decisions and public change requests. A resubmission creates a new version and returns the idea to evaluation.
- Added a consultant queue with waiting/active conversations, consultant claiming, replies, office-hour messaging, and closure.
- Added protected audit viewing and first-pass aggregate reports for submission counts, status outcomes, call participation, and evaluator workload.
- Added an administrator bootstrap path for the first verified account; all added staff pages enforce roles server-side.

### Readiness status

- No typecheck, lint, build, or browser verification was run in this implementation pass.
- No migration or database schema mutation was applied. The configured database remains short the Better Auth `passkey` table and migration history needs reconciliation.
- The schema's dynamic FAQ/content/document tables do not yet have management screens. In-app notifications are recorded, but followed-idea controls and email/SMS delivery remain open.
- The previously exposed Gmail app credential still needs revocation or rotation by its owner.

## Auth timestamp compatibility fix

- Read-only inspection confirmed all existing Better Auth timestamp columns use `timestamp without time zone`, while the database session timezone is GMT. The Node driver parsed a database value of 13:00 as 11:00Z on the Africa/Gaborone workstation, which made five-minute verification codes appear expired.
- Updated the Better Auth Drizzle schema to match the live no-time-zone columns and pinned the server process timezone to UTC so those UTC wall-clock values round-trip correctly. No database migration was applied; a reviewed migration to `timestamptz` remains future schema cleanup.
- Updated submission reference year formatting to stay explicitly on Africa/Gaborone time.
- The fix has not been browser-verified; restart the dev server and request a fresh verification code before trying again.

## Lifecycle, content and verification update

- Added a committee monitoring page with follow/unfollow, status-only fields, audit records, and in-app alerts when followed ideas advance, receive a decision, are resubmitted, or receive an award.
- Added administrator award granting. Approval can now progress to the award stage, with an award history entry and submitter-visible recognition.
- Made the public FAQ database-backed and added administrator create/edit/publish/delete actions with audit logging. The seed now installs prototype-accurate questions. Authority contact details on the public page were checked against official CEDA, BDIH, and CIPA sources.
- Replaced the privacy placeholder with a factual notice describing the current prototype's stored data and known limits; the page explicitly requires CEDA privacy/legal review before launch.
- Replaced the false public promises of end-to-end encryption and email/SMS status alerts with accurate prototype behavior.
- Restored the missing Better Auth `passkey` table through migration `0004_restore_passkey_table.sql`; the live schema checker reports 35/35 tables and no column mismatches.
- Converted the 800×533 decorative hero animation from 3,763,342 bytes to an animated WebP of 1,438,886 bytes. Its rendered `scale-110` remains in place.
- Cleaned lint errors in the URL renderer, passkey capability check, and chat polling effects.

### Verification performed

- `npm run db:migrate` applied the additive passkey migration; running it again succeeded without adding another migration-history row.
- `npm run db:seed` succeeded against the configured database.
- `npx.cmd tsx db/schema-baseline-check.mts` reports all expected tables and columns match.
- `npm run typecheck`, `npm run lint`, `npm test` (3 tests), and `npm run build` pass.
- A production server smoke check returned HTTP 200 for `/faq` and `/api/health`; health reported the database ready.

### Not yet verified

- The multi-account browser walkthrough has not been run. Use `docs/demo-runbook.md` with six verified accounts to test the submitter, administrator, evaluator, adjudicator, committee member, and consultant paths interactively.
- Gmail delivery, passkey hardware, cross-browser behavior, and production hosting are not verified. In-portal alerts work; email/SMS status alerts and direct document uploads remain unimplemented.

## Account notification preferences

- Added account settings for in-portal, email, and SMS alert preferences. Preference changes are audited, and all workflow/chat notifications now pass through the in-portal preference gate.
- Email and SMS choices are saved as preferences only; the UI states delivery is not connected and phone verification is not available.
- Added unit coverage for suppressing in-app notifications when disabled and preserving the enabled-by-default behavior for users without a preference.
- Verification: `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass.

## Evaluator notes and workflow configuration

- Added evaluator-only feedback notes linked to the assignment's exact version and stage. The evaluator must own an active assignment; submitter feedback reads continue to exclude internal notes.
- Added admin workflow stage creation, name/description editing, position swapping, and criterion editing while no score exists. Scored criteria can be archived or restored, and cannot be edited in a way that would change historical score meaning.
- Verification: `npm run typecheck`, `npm run lint`, and `npm test` pass. Production build and the role-based interactive lifecycle still need their final checks.

## Support and turnaround details

- Added `/support` with CEDA phone and email channels, a privacy contact route, and response targets for account, submission, and general portal issues.
- Turnaround times are explicitly labeled demo placeholders; CEDA must approve the responsible team, service hours, and commitments before launch.

## Category configuration

- Added an administrator category workspace to create, edit, activate, and deactivate submission categories without a schema change.
- Deactivation removes a category from new submission choices while preserving the stored category reference on historical ideas.
- Verification after the evaluator/admin/support changes: `npm run typecheck`, `npm run lint`, `npm test` (5 tests), `npm run build`, and `git diff --check` passed. The production smoke test returned HTTP 200 for `/support` and database-ready for `/api/health`.
