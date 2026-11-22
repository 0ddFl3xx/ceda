"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { addFormField } from "@/app/(workspace)/(dashboards)/admin/calls/actions";
import { FieldErrorMessage, FormErrorAnnouncer } from "@/components/ui/FormErrorFeedback";
import { addFormFieldSchema, type AddFormFieldValues } from "@/lib/form-schemas";
import { zodResolver } from "@/lib/zod-resolver";
import { CALL_CONFIG_FIELD_CLASS } from "./styles";

export function AddCallFormFieldForm({ callId }: { callId: string }) {
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, submitCount },
  } = useForm<AddFormFieldValues>({
    resolver: zodResolver(addFormFieldSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      key: "",
      label: "",
      helpText: "",
      sectionKey: "general_information",
      type: "text",
      options: "",
      required: false,
    },
  });

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("callId", callId);
    formData.set("key", values.key);
    formData.set("label", values.label);
    formData.set("helpText", values.helpText);
    formData.set("sectionKey", values.sectionKey);
    formData.set("type", values.type);
    formData.set("options", values.options);
    if (values.required) formData.set("required", "on");
    startTransition(async () => {
      await addFormField(formData);
      reset();
    });
  });

  return (
    <>
      <FormErrorAnnouncer errors={errors} submitCount={submitCount} />
      <form
        noValidate
        onSubmit={onSubmit}
        aria-labelledby="add-field-heading"
        className="mt-6 space-y-4 rounded-2xl border border-ceda-line bg-[#FFF9F4] p-5 sm:p-6"
      >
        <h3 id="add-field-heading" className="font-bold text-ceda-ink">
          Add a form field
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="key" className="text-sm font-semibold text-ceda-ink">
              Field key
            </label>
            <p id="key-help" className="mt-1 text-xs text-ceda-muted">
              Lowercase letters, numbers, and underscores.
            </p>
            <input
              id="key"
              maxLength={80}
              aria-invalid={errors.key ? "true" : "false"}
              aria-describedby={errors.key ? "key-help key-error" : "key-help"}
              className={CALL_CONFIG_FIELD_CLASS}
              {...register("key")}
            />
            <FieldErrorMessage id="key-error" message={errors.key?.message} />
          </div>
          <div>
            <label htmlFor="label" className="text-sm font-semibold text-ceda-ink">
              Label
            </label>
            <input
              id="label"
              maxLength={255}
              aria-invalid={errors.label ? "true" : "false"}
              aria-describedby={errors.label ? "label-error" : undefined}
              className={CALL_CONFIG_FIELD_CLASS}
              {...register("label")}
            />
            <FieldErrorMessage id="label-error" message={errors.label?.message} />
          </div>
        </div>
        <div>
          <label htmlFor="helpText" className="text-sm font-semibold text-ceda-ink">
            Help text
          </label>
          <textarea
            id="helpText"
            maxLength={2000}
            rows={2}
            aria-invalid={errors.helpText ? "true" : "false"}
            aria-describedby={errors.helpText ? "helpText-error" : undefined}
            className={CALL_CONFIG_FIELD_CLASS}
            {...register("helpText")}
          />
          <FieldErrorMessage id="helpText-error" message={errors.helpText?.message} />
        </div>
        <div>
          <label htmlFor="sectionKey" className="text-sm font-semibold text-ceda-ink">
            Application section
          </label>
          <select id="sectionKey" className={CALL_CONFIG_FIELD_CLASS} {...register("sectionKey")}>
            <option value="general_information">General Information</option>
            <option value="solution_status">Solution Status</option>
            <option value="solution_overview">Solution Overview</option>
            <option value="type_of_innovation">Type of Innovation</option>
            <option value="additional_information">Additional Information</option>
            <option value="solution_documents">Solution Documents</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="type" className="text-sm font-semibold text-ceda-ink">
              Field type
            </label>
            <select id="type" className={CALL_CONFIG_FIELD_CLASS} {...register("type")}>
              <option value="text">Short text</option>
              <option value="textarea">Long text</option>
              <option value="url">Web address</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Choose one</option>
              <option value="multiselect">Choose multiple</option>
              <option value="checkbox">Confirmation</option>
            </select>
          </div>
          <div>
            <label htmlFor="options" className="text-sm font-semibold text-ceda-ink">
              Choices (for select fields)
            </label>
            <p id="options-help" className="mt-1 text-xs text-ceda-muted">
              Separate choices with commas.
            </p>
            <input
              id="options"
              maxLength={2000}
              aria-invalid={errors.options ? "true" : "false"}
              aria-describedby={
                errors.options ? "options-help options-error" : "options-help"
              }
              className={CALL_CONFIG_FIELD_CLASS}
              {...register("options")}
            />
            <FieldErrorMessage id="options-error" message={errors.options?.message} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-ceda-ink">
          <input
            type="checkbox"
            className="h-5 w-5 accent-ceda-burgundy"
            {...register("required")}
          />
          Required answer
        </label>
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-full bg-ceda-burgundy px-5 text-sm font-bold text-white hover:bg-[#5C150D] disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add field"}
        </button>
      </form>
    </>
  );
}
