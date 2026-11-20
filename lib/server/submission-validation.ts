import "server-only";

export type SubmissionAnswerField = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  options: string[] | null;
};

export function validateDynamicAnswers(formData: FormData, fields: SubmissionAnswerField[]) {
  const answers: Record<string, unknown> = {};
  const fieldErrors: Record<string, string> = {};

  for (const field of fields) {
    const raw = formData.getAll(`answer:${field.key}`);
    if (field.type === "checkbox") {
      const checked = raw.some((value) => value === "on" || value === "true");
      if (field.required && !checked) fieldErrors[field.key] = `${field.label}: this field is required.`;
      else answers[field.key] = checked;
      continue;
    }

    const values = raw.filter((value): value is string => typeof value === "string").map((value) => value.trim());
    const nonEmpty = values.filter(Boolean);
    if (field.required && !nonEmpty.length) {
      fieldErrors[field.key] = `${field.label}: this field is required.`;
      continue;
    }
    if (field.type === "multiselect") {
      if (field.options?.length && nonEmpty.some((value) => !field.options?.includes(value))) fieldErrors[field.key] = `${field.label}: choose only listed options.`;
      else answers[field.key] = nonEmpty;
      continue;
    }

    const value = nonEmpty[0] ?? "";
    if (value.length > 4000) {
      fieldErrors[field.key] = `${field.label}: keep this answer under 4,000 characters.`;
      continue;
    }
    if (value && field.type === "url") {
      try {
        const url = new URL(value);
        if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Unsupported URL protocol");
      } catch {
        fieldErrors[field.key] = `${field.label}: enter a valid web address, including https://.`;
        continue;
      }
    }
    if (value && field.type === "number") {
      const number = Number(value);
      if (!Number.isFinite(number)) {
        fieldErrors[field.key] = `${field.label}: enter a valid number.`;
        continue;
      }
      answers[field.key] = number;
      continue;
    }
    if (value && field.type === "date" && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00`)))) {
      fieldErrors[field.key] = `${field.label}: enter a valid date.`;
      continue;
    }
    if (value && field.type === "select" && field.options?.length && !field.options.includes(value)) {
      fieldErrors[field.key] = `${field.label}: choose one of the listed options.`;
      continue;
    }
    answers[field.key] = value;
  }

  return { answers, fieldErrors };
}
