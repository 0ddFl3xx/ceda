import { notFound } from "next/navigation";
import { Suspense } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  criteria,
  evaluationScores,
  formFields,
  innovationCalls,
  workflowStages,
} from "@/db/schema";
import { requireRole } from "@/lib/authorization";
import { CallConfigHeader } from "@/components/admin/calls/config/CallConfigHeader";
import { CallConfigWizard } from "@/components/admin/calls/config/CallConfigWizard";
import type {
  CallConfigStepKey,
  CallStatusValue,
} from "@/components/admin/calls/config/types";
import { WorkspacePageSkeleton } from "@/components/workspace/WorkspacePageSkeleton";

function resolveInitialStep(
  rawStep: string | string[] | undefined,
  rawError: string | string[] | undefined,
): CallConfigStepKey {
  const step = Array.isArray(rawStep) ? rawStep[0] : rawStep;
  if (
    step === "fields" ||
    step === "stages" ||
    step === "criteria" ||
    step === "publish"
  ) {
    return step;
  }

  const error = Array.isArray(rawError) ? rawError[0] : rawError;
  if (error === "stage" || error === "stage_duplicate") return "stages";
  if (error === "criterion" || error === "criterion_locked") return "criteria";
  if (error === "status") return "publish";
  return "fields";
}

function resolveErrorMessage(rawError: string | string[] | undefined): string {
  const error = Array.isArray(rawError) ? rawError[0] : rawError;
  if (error === "duplicate")
    return "That field key is already in use for this call.";
  if (error === "options")
    return "Select fields need unique choices, separated by commas.";
  if (error === "field") return "Check the field key and label.";
  if (error === "criterion")
    return "Check the criterion name, maximum score, and weight.";
  if (error === "criterion_locked")
    return "This criterion already has scores. Archive it and add a new one so past reviews keep their original meaning.";
  if (error === "stage_duplicate")
    return "That workflow key is already used by another stage.";
  if (error === "stage") return "Check the stage name, key, and type.";
  if (error === "status") return "Choose a valid call status and date range.";
  return error ? "Check the configuration and try again." : "";
}

function formatCallDate(value: Date | null): string {
  if (!value) return "Not set";
  return value.toLocaleString("en-BW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Gaborone",
  });
}

export default function CallConfigurationPage({
  params,
  searchParams,
}: PageProps<"/admin/calls/[id]">) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton variant="detail" />}>
      <CallConfigurationContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CallConfigurationContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole("admin", "/admin");
  const [{ id }, query] = await Promise.all([params, searchParams]);

  const [call] = await db
    .select()
    .from(innovationCalls)
    .where(eq(innovationCalls.id, id))
    .limit(1);
  if (!call) notFound();

  const [fields, stages, scoringCriteria, scoredCriterionRows] =
    await Promise.all([
      db
        .select()
        .from(formFields)
        .where(eq(formFields.callId, id))
        .orderBy(asc(formFields.position)),
      db
        .select({
          id: workflowStages.id,
          key: workflowStages.key,
          name: workflowStages.name,
          description: workflowStages.description,
          type: workflowStages.type,
          position: workflowStages.position,
          isTerminal: workflowStages.isTerminal,
        })
        .from(workflowStages)
        .where(eq(workflowStages.callId, id))
        .orderBy(asc(workflowStages.position)),
      db
        .select({
          id: criteria.id,
          stageId: criteria.stageId,
          name: criteria.name,
          description: criteria.description,
          maxScore: criteria.maxScore,
          weight: criteria.weight,
          isArchived: criteria.isArchived,
          stageName: workflowStages.name,
        })
        .from(criteria)
        .innerJoin(workflowStages, eq(criteria.stageId, workflowStages.id))
        .where(eq(workflowStages.callId, id))
        .orderBy(asc(workflowStages.position), asc(criteria.position)),
      db
        .select({ criterionId: evaluationScores.criterionId })
        .from(evaluationScores)
        .innerJoin(criteria, eq(evaluationScores.criterionId, criteria.id))
        .innerJoin(workflowStages, eq(criteria.stageId, workflowStages.id))
        .where(eq(workflowStages.callId, id)),
    ]);

  const scoredCriterionIds = new Set(
    scoredCriterionRows.map(({ criterionId }) => criterionId),
  );

  const errorText = resolveErrorMessage(query.error);
  const initialStep = resolveInitialStep(query.step, query.error);

  const callSummary = {
    id: call.id,
    title: call.title,
    slug: call.slug,
    status: call.status as CallStatusValue,
    opensAtLabel: formatCallDate(call.opensAt),
    closesAtLabel: formatCallDate(call.closesAt),
  };

  const criteriaItems = scoringCriteria.map((criterion) => ({
    ...criterion,
    hasScores: scoredCriterionIds.has(criterion.id),
  }));

  return (
    <main
      id="main-content"
      className="flex-1 bg-[#F7F8F9] px-gutter py-ds-6 sm:py-ds-8"
    >
      <div className="mx-auto w-full max-w-(--container-workspace)">
        <CallConfigHeader
          call={callSummary}
          activeFieldsCount={fields.filter((field) => field.isActive).length}
          stagesCount={stages.length}
          activeCriteriaCount={
            criteriaItems.filter((item) => !item.isArchived).length
          }
        />

        {errorText ? (
          <p
            className="mt-5 rounded-xl border border-red-800/25 bg-red-50 p-4 text-sm text-red-900"
            role="alert"
          >
            {errorText}
          </p>
        ) : null}

        <CallConfigWizard
          call={callSummary}
          fields={fields}
          stages={stages}
          criteria={criteriaItems}
          initialStep={initialStep}
        />
      </div>
    </main>
  );
}
