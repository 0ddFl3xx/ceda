# Hackathon implementation plan

This plan follows the supplied requirements sheet and the existing database schema. Keep the CEDA site palette, typography, and layout language consistent across public pages and authenticated workspaces. Before changing Next.js routes or UI, consult the installed Next.js docs; before building a web UI or client interaction, consult the local modern-web-guidance skill.

## Current delivery slice

- [x] Add a read-only database baseline check, restore the missing Better Auth `passkey` table with a reviewed additive migration, and confirm all 35 tables match the latest migration snapshot.
- [x] Remove populated Gmail fields from `.env.example`. The credential that was present must be revoked or rotated in the Gmail account; changing the example does not invalidate it.
- [x] Add a verified-account-only initial admin bootstrap command and protected admin user-role assignment screen.
- [x] Add admin call creation, a default data-driven review workflow, form-field configuration, and field activation controls.
- [x] Add dynamic submission fields with browser and server validation. A submission creates version 1, stage history, an owner alert subscription, an in-app notification, and an audit record in one transaction.
- [x] Save and resume submitter drafts; validate and submit the current version through the configured form.
- [x] Add a submitter dashboard and owner-only submission detail view.
- [x] Add evaluator assignment, criterion scoring, weighted totals, adjudication, public change requests, and immutable resubmission versions.
- [x] Add evaluator-only private notes tied to an exact idea version and stage, separate from submitter-visible change requests.
- [x] Add workflow stage creation, label/description editing, and reordering; scoring criteria can be edited before scoring and archived/restored without deleting score history.
- [x] Add the persistent consultant chat queue with office-hour messaging, assignment, replies, and closure.
- [x] Add protected audit and initial participation, outcome, and evaluator workload reports.
- [x] Add committee monitoring with follow/unfollow controls and in-app lifecycle notifications for followed ideas.
- [x] Complete the approval-to-award handoff with an administrator award screen, final workflow history, and submitter-visible recognition.
- [x] Make published FAQs database-driven and add audited administrator create, edit, publish, and delete actions.
- [x] Add a notification inbox, in-app/email delivery for lifecycle and consultant-chat events, and channel preferences. Email requires valid Gmail SMTP; SMS is not connected.
- [x] Replace the public FAQ's inaccurate encryption and email/SMS claims, and verify the displayed authority contacts against their official sites.
- [x] Replace the privacy placeholder with a factual prototype data-handling notice that clearly requires CEDA legal/privacy review before production use.
- [x] Add a support page with verified CEDA contact channels and visibly labeled prototype response targets pending CEDA approval.
- [x] Add audited category create/edit/activate controls; deactivation keeps historical submissions' category references intact.
- [x] Convert the decorative 800×533 hero animation from a 3.76 MB GIF to a 1.44 MB animated WebP without changing its rendered scale.
- [x] Add `/api/health` with a database readiness check and baseline security headers.
- [x] Confirm implementation with typecheck, lint, build, unit tests, and a live schema check. Interactive browser flows still need a manual run using [the demo runbook](demo-runbook.md).

## Remaining work, in dependency order

### 1. Stabilize identity and access

- Add account settings for password changes, passkey management, session revocation, and verified phone enrollment.
- Add email one-time-code sign-in and the phone/SMS flow if it is required for the scored demo; preserve email/password and passkeys.
- Harden per-idea authorization for collaborators and any remaining committee/administrative operations.

### 2. Finish the submission lifecycle

- Add adjudication rationale/history views.
- Add adjudication rationale/history views.
- Complete idea-level access rules for collaborators.
- Keep every lifecycle write transactional and append stage-history and audit records.

### 3. Complete administration and communication

- Manage documents, remaining public content, and workflow stage types; category administration and stage creation/name/description/order plus score-safe criterion edits are implemented.
- Add chat volume/wait-time reporting and ensure assigned agents see their active chats after refresh.
- Wire email/SMS delivery; preference capture and in-app delivery controls now work.
- Add admin management for FAQs, documents and page content; add a support page with approved response targets and regulator contact details.

### 4. Reporting, privacy, and operational readiness

- Extend reports with stage durations and richer outcome breakdowns.
- Obtain CEDA review/approval of the prototype privacy notice and terms; complete security controls including upload validation and abuse protection.
- Measure image and first-load performance and review remote imagery; the hero animation payload is optimized.
- Choose a hosting and object-storage configuration, document region and costs, deploy, and configure monitoring around the health endpoint. State availability based on measured operations rather than promise uninterrupted service.
- Run keyboard/accessibility review, responsive checks, and the requested Chrome, Edge, Firefox, Safari, and phone coverage.

### 5. Demo and presentation

- Create isolated, repeatable demo accounts for each role; the role-by-role setup and workflow are documented in [the demo runbook](demo-runbook.md).
- Prepare one end-to-end story from submission through evaluation, requested changes, resubmission, decision, and progress tracking.
- Select one or two useful innovation features (recommended: a clear stage timeline and an application completeness check), then prepare the proposal and presentation.

## Decisions to preserve

- Workflow stages, form fields, criteria, and roles remain data-driven.
- Resubmissions create a new `idea_versions` row; prior scored versions remain intact.
- Staff access is granted by administrators after the first verified administrator is bootstrapped from the command line.
- User-facing dates and call hours use `Africa/Gaborone`.
- Email-only registration remains the current product decision until the verified phone-enrollment flow is ready.
