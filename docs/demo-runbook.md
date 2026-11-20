# End-to-end role walkthrough

Use six distinct, verified accounts for the cleanest demonstration: submitter, administrator, evaluator, adjudicator, committee member, and service consultant. The same verified account can hold more than one role and select a workspace from `/dashboard`, but separate people better demonstrate the intended separation of duties.

## Prepare the demo

1. Copy `.env.example` to `.env.local` and set the database URL, a random `BETTER_AUTH_SECRET`, and the local portal URL. Add Gmail SMTP credentials if verification codes should arrive by email; in local development the fallback code is printed in the dev server log.
2. Run `npm run db:migrate`, then `npm run db:seed`.
3. Register and verify an account to act as the administrator. Set `CEDA_BOOTSTRAP_ADMIN_EMAIL` to that verified email and run `npm run db:bootstrap-admin` once.
4. Register and verify the other accounts. As administrator, open **Manage users and roles** at `/admin/users` and assign the evaluator, adjudicator, committee member, and consultant roles to the matching accounts.
5. Confirm the seeded innovation opportunity is open and has evaluation stages, active scoring criteria, and at least one active submission category.
6. As administrator, open `/admin/categories` to add or edit a test category. In the call editor, add or reorder a stage, then edit a criterion before any score has been recorded. Scored criteria are locked and should be archived instead.
7. As administrator, open `/admin/content/faqs` and confirm the seeded questions can be edited, unpublished, and republished. The public FAQ is at `/faq`.

## Submission through award

1. **Submitter:** Sign in and choose **Submitter dashboard**. Create an idea, complete the configured fields and terms, save the draft, then submit it. Confirm it appears in the dashboard and has a reference number and initial status.
2. **Evaluator:** Sign in and open **Evaluation queue**. Claim an available submission, inspect its full form answers and supporting links, add a private evaluator note, score every active criterion, and submit the review. The submission moves through evaluation stages automatically.
3. **Evaluator:** When the next evaluation stage is ready, an in-app notification and email are sent to evaluator-role accounts; an evaluator claims it from the shared queue. The submission moves to adjudication after its final evaluation stage.
5. **Adjudicator:** Open `/adjudicator`, review scores and proposal details, then approve the idea with a rationale of at least 20 characters.
6. **Administrator:** Open **Grant awards** at `/admin/awards`, add a title and optional tier/details. Granting the award records the recognition, advances the idea to the award stage, and notifies the submitter in the portal.
7. **Submitter:** Reopen the submission detail page and confirm its final status, progress timeline, and award.
8. **Submitter:** Open `/notifications` to read in-portal alerts. Open `/account/settings` to manage in-portal and email delivery preferences. Email requires working Gmail SMTP credentials; SMS is not connected.

## Feedback loop

Use another test submission. After evaluation, have the adjudicator choose **Request changes** and enter actionable rationale. The submitter should see public feedback and a resubmission form. Submit a revised version and confirm the version number increases while the old version remains in history. The revised submission returns to the evaluator queue for a new claim.

## Committee monitoring

Sign in as committee member and open `/committee`. Confirm submitted ideas show their reference, opportunity, stage, and public status. Follow an idea, advance its workflow as administrator/evaluator/adjudicator, then confirm an in-app notification appears for the committee account. Committee screens do not expose scores, answers, submitter identity, or internal notes.

## Consultant chat

Sign in as submitter and open the CEDA Consultant chat. Start a conversation and send a message. Sign in as consultant and open `/consultant`; claim the waiting conversation, reply, and close it. Return to the submitter account to confirm the reply and closed state appear. The queue uses prototype office hours (weekdays, 09:00–16:00 Africa/Gaborone time).

## Expected prototype limits

- Idea-follow alerts are persisted in-app. Lifecycle and consultant chat alerts are available in-app and by email when the recipient has verified their email and enabled email notifications. SMS is not connected.
- Social sign-in buttons are visual placeholders and do not authenticate.
- The supporting-material fields accept links; secure file upload is not implemented.
- External verification email needs working Gmail SMTP credentials; local development otherwise prints the code to the server console.
- Cross-browser interaction, live passkey hardware, and production hosting are separate verification tasks.
