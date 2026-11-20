# Architecture decisions

## Initial build decisions

- Keep the existing root-level `app/`, `db/`, and `lib/` structure. Do not move the app into `src/` as part of the lifecycle work.
- Keep the existing public landing page and shared global support controls unchanged while implementing authenticated workflows.
- Use Better Auth for sessions and identity, Drizzle for application data, and Neon Postgres as configured by the project.
- Use a Neon serverless `Pool` for application database access because lifecycle writes need interactive transactions. Keep `casing: "snake_case"` consistent between Drizzle and drizzle-kit.
- Use database-backed roles and permissions. New registrations receive `submitter`; staff roles are granted by an administrator. Add `consultant` for the call-centre queue and `committee_member` for read-only progress monitoring.
- Use Gmail SMTP via an app password for email verification and notifications. Keep any development mail fallback local-only and clearly labelled.
- Keep self-registration email-only for the first release. Phone numbers are not collected at signup until a verified add-phone/account-settings flow is ready; Twilio remains optional and must not block account creation.
- Evaluators are assigned by administrators. Scores are criterion-specific and the overall score is the weighted total using the criteria version active for that evaluation.
- Chat consultants are a distinct `consultant` role with a queue/dashboard, not a submitter or evaluator capability. Chat availability is configurable in system settings.
- The schema overview supplied by the project owner is the source for the data model. The implementation will add only changes needed by the application and will record them here.

## Known route decision

The public navigation omits Innovation Calls as a standalone marketing page, per the earlier product direction. Authenticated submitters can still discover open calls as part of the submission workflow. The data model continues to support multiple calls.
