import { config } from "dotenv";
config({ path: ".env.local" });
import { and, eq } from "drizzle-orm";

const stages = [
  { key: "submitted", name: "Submitted", type: "intake" as const, position: 0 },
  { key: "screening", name: "Screening", type: "screening" as const, position: 1 },
  { key: "level_1", name: "Level 1 Evaluation", type: "evaluation" as const, position: 2 },
  { key: "level_2", name: "Level 2 Evaluation", type: "evaluation" as const, position: 3 },
  { key: "adjudication", name: "Adjudication", type: "adjudication" as const, position: 4 },
  { key: "feedback", name: "Feedback", type: "feedback" as const, position: 5 },
  { key: "decision", name: "Decision", type: "decision" as const, position: 6 },
  { key: "award", name: "Award", type: "award" as const, position: 7, isTerminal: true },
];

let closeDatabase: () => Promise<void> = async () => {};

async function seed() {
  // Load .env.local before constructing the Neon Pool. Static imports would
  // evaluate db/index.ts before the dotenv.config() call above.
  const [{ db }, { categories, criteria, faqs, formFields, innovationCalls, workflowStages }, { ensureBuiltinRoles }] = await Promise.all([
    import("./index"),
    import("./schema"),
    import("../lib/server/builtin-roles"),
  ]);
  closeDatabase = () => db.$client.end();

  await db.transaction(async (tx) => {
    await ensureBuiltinRoles(tx);

    await tx.insert(categories).values([
      { name: "Digital Advancement", description: "Technology enabled services and products.", position: 0 },
      { name: "Sustainable Development", description: "Ideas that support long term social and environmental value.", position: 1 },
      { name: "Enterprise Growth", description: "Practical approaches to business growth and job creation.", position: 2 },
    ]).onConflictDoNothing();

    const slug = "ceda-innovation-management-portal-hackathon-2026";
    await tx.insert(innovationCalls).values({
      title: "CEDA Innovation Management Portal Hackathon",
      slug,
      description: "Design a secure, accessible platform for idea submission, evaluation, feedback, adjudication and recognition.",
      status: "open",
      opensAt: new Date("2026-11-13T06:00:00.000Z"),
      closesAt: new Date("2026-11-23T15:00:00.000Z"),
    }).onConflictDoNothing({ target: innovationCalls.slug });
    const [call] = await tx.select({ id: innovationCalls.id }).from(innovationCalls).where(eq(innovationCalls.slug, slug)).limit(1);
    if (!call) throw new Error("Unable to seed the CEDA hackathon call.");

    for (const stage of stages) {
      await tx.insert(workflowStages).values({ callId: call.id, ...stage }).onConflictDoNothing();
    }
    const evaluationStages = await tx.select({ id: workflowStages.id }).from(workflowStages)
      .where(and(eq(workflowStages.callId, call.id), eq(workflowStages.type, "evaluation")));
    for (const stage of evaluationStages) {
      for (const [position, name] of ["Solution fit", "Security and privacy", "User experience", "Scalability and delivery"].entries()) {
        const [existing] = await tx.select({ id: criteria.id }).from(criteria).where(and(eq(criteria.stageId, stage.id), eq(criteria.name, name))).limit(1);
        if (!existing) {
          await tx.insert(criteria).values({ stageId: stage.id, name, description: `Score the proposal's ${name.toLowerCase()}.`, maxScore: 10, weight: "1.00", position });
        }
      }
    }
    await tx.insert(formFields).values({
      callId: call.id,
      key: "technical_proposal_url",
      label: "Technical proposal link",
      helpText: "Provide a viewable link to your technical proposal.",
      type: "url",
      required: true,
      position: 0,
    }).onConflictDoNothing();

    const starterFaqs = [
      { topic: "Using the Portal", question: "How do I track a submission?", answer: "Sign in to the submitter dashboard to see its current status and progress timeline. Followed ideas also receive in-portal notifications when the workflow changes." },
      { topic: "Using the Portal", question: "Can I revise a submission?", answer: "If an adjudicator requests changes, respond to the feedback and submit a new version. Earlier versions remain part of the submission history." },
      { topic: "Using the Portal", question: "Can I upload supporting files?", answer: "Direct file upload is not available in this prototype. Use the configured link fields for supporting material." },
      { topic: "Using the Portal", question: "Are email or SMS status alerts available?", answer: "In-portal notifications are recorded for submission and workflow changes. Email and SMS alert delivery are not connected in this prototype." },
      { topic: "Using the Portal", question: "Who can view evaluation scores?", answer: "Scores are available to assigned evaluators and adjudicators. Committee monitoring shows workflow status only." },
      { topic: "Privacy", question: "Is this prototype ready for confidential or personal information?", answer: "No. The portal is a prototype. Its privacy, security, retention and compliance controls need review before real personal or confidential business information is entered." },
    ];
    for (const faq of starterFaqs) {
      const [existing] = await tx.select({ id: faqs.id }).from(faqs).where(eq(faqs.question, faq.question)).limit(1);
      if (!existing) await tx.insert(faqs).values({ ...faq, position: starterFaqs.indexOf(faq), isPublished: true });
    }
  });

  console.info("CEDA portal roles, call, workflow and starter configuration seeded.");
  await db.$client.end();
}

seed().catch(async (error: unknown) => {
  console.error("Portal seed failed.", error);
  await closeDatabase();
  process.exitCode = 1;
});
