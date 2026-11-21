import Link from "next/link";
import { Suspense } from "react";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { WorkspacePageSkeleton } from "@/components/workspace/WorkspacePageSkeleton";
import { requireRole } from "@/lib/authorization";
import {
  createFaq,
  deleteFaq,
  updateFaq,
} from "@/app/(workspace)/(dashboards)/admin/content/faqs/actions";

const controlClass =
  "mt-1 min-h-12 w-full rounded-lg border border-[#9A8175] bg-white px-3 text-base text-ceda-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ceda-burgundy";

export default function AdminFaqPage({
  searchParams,
}: PageProps<"/admin/content/faqs">) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton variant="list" />}>
      <FaqAdminContent searchParams={searchParams} />
    </Suspense>
  );
}

async function FaqAdminContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole("admin", "/admin/content/faqs");
  const [items, query] = await Promise.all([
    db
      .select()
      .from(faqs)
      .orderBy(asc(faqs.topic), asc(faqs.position), asc(faqs.question)),
    searchParams,
  ]);
  const notice =
    query.notice === "saved"
      ? "FAQ saved and the public page refreshed."
      : query.notice === "deleted"
        ? "FAQ removed from the public page."
        : query.error === "notfound"
          ? "That FAQ no longer exists. Reload the page."
          : query.error
            ? "Check the question, answer, topic and order fields."
            : "";

  return (
    <main
      id="main-content"
      className="flex-1 bg-[#FFFDFC] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-250">
        <Link
          href="/admin"
          className="text-sm font-semibold text-ceda-burgundy underline underline-offset-4">
          ← Back to administration
        </Link>
        <header className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ceda-burgundy">
            Portal content
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ceda-ink">Manage FAQs</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ceda-muted">
            Published questions appear on the public FAQ page. Answers are
            rendered as plain text, so links should be entered as full URLs.
          </p>
        </header>
        {notice && (
          <p
            className="mt-5 rounded-xl border border-ceda-line bg-white p-4 text-sm text-ceda-body"
            role="status">
            {notice}
          </p>
        )}
        <section
          className="mt-7 rounded-2xl border border-ceda-line bg-white p-5 shadow-sm sm:p-7"
          aria-labelledby="create-faq-heading">
          <h2
            id="create-faq-heading"
            className="text-xl font-bold text-ceda-ink">
            Add a question
          </h2>
          <form
            action={createFaq}
            aria-labelledby="create-faq-heading"
            className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="new-faq-question"
                className="block text-sm font-semibold text-ceda-ink">
                Question
              </label>
              <input
                id="new-faq-question"
                name="question"
                required
                maxLength={500}
                className={controlClass}
              />
            </div>
            <div>
              <label
                htmlFor="new-faq-topic"
                className="block text-sm font-semibold text-ceda-ink">
                Topic{" "}
                <span className="font-normal text-ceda-muted">(optional)</span>
              </label>
              <input
                id="new-faq-topic"
                name="topic"
                maxLength={100}
                className={controlClass}
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="new-faq-answer"
                className="block text-sm font-semibold text-ceda-ink">
                Answer
              </label>
              <textarea
                id="new-faq-answer"
                name="answer"
                required
                maxLength={5000}
                rows={4}
                className={controlClass}
              />
            </div>
            <div>
              <label
                htmlFor="new-faq-position"
                className="block text-sm font-semibold text-ceda-ink">
                Order within topic
              </label>
              <input
                id="new-faq-position"
                name="position"
                type="number"
                min={0}
                max={100000}
                defaultValue={0}
                className={controlClass}
              />
            </div>
            <label className="flex min-h-12 items-center gap-3 self-end text-sm font-semibold text-ceda-ink">
              <input
                type="checkbox"
                name="isPublished"
                value="true"
                defaultChecked
                className="h-5 w-5 accent-[#7A1F14]"
              />
              Publish on public FAQ page
            </label>
            <button
              type="submit"
              className="min-h-12 w-fit rounded-full bg-ceda-burgundy px-5 text-sm font-bold text-white hover:bg-[#5C150D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy">
              Add FAQ
            </button>
          </form>
        </section>
        <section className="mt-9 space-y-4" aria-label="Existing FAQs">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-ceda-line bg-white p-5 shadow-sm sm:p-6">
              <form
                action={updateFaq}
                aria-label={`Edit FAQ: ${item.question}`}
                className="grid gap-4 md:grid-cols-2">
                <input type="hidden" name="faqId" value={item.id} />
                <div>
                  <label
                    htmlFor={`faq-question-${item.id}`}
                    className="block text-sm font-semibold text-ceda-ink">
                    Question
                  </label>
                  <input
                    id={`faq-question-${item.id}`}
                    name="question"
                    required
                    maxLength={500}
                    defaultValue={item.question}
                    className={controlClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`faq-topic-${item.id}`}
                    className="block text-sm font-semibold text-ceda-ink">
                    Topic
                  </label>
                  <input
                    id={`faq-topic-${item.id}`}
                    name="topic"
                    maxLength={100}
                    defaultValue={item.topic ?? ""}
                    className={controlClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor={`faq-answer-${item.id}`}
                    className="block text-sm font-semibold text-ceda-ink">
                    Answer
                  </label>
                  <textarea
                    id={`faq-answer-${item.id}`}
                    name="answer"
                    required
                    maxLength={5000}
                    rows={4}
                    defaultValue={item.answer}
                    className={controlClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`faq-position-${item.id}`}
                    className="block text-sm font-semibold text-ceda-ink">
                    Order within topic
                  </label>
                  <input
                    id={`faq-position-${item.id}`}
                    name="position"
                    type="number"
                    min={0}
                    max={100000}
                    defaultValue={item.position}
                    className={controlClass}
                  />
                </div>
                <label className="flex min-h-12 items-center gap-3 self-end text-sm font-semibold text-ceda-ink">
                  <input
                    type="checkbox"
                    name="isPublished"
                    value="true"
                    defaultChecked={item.isPublished}
                    className="h-5 w-5 accent-[#7A1F14]"
                  />
                  Published
                </label>
                <div className="flex flex-wrap gap-3 md:col-span-2">
                  <button
                    type="submit"
                    className="min-h-12 rounded-full bg-ceda-burgundy px-5 text-sm font-bold text-white hover:bg-[#5C150D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy">
                    Save changes
                  </button>
                </div>
              </form>
              <form
                action={deleteFaq}
                aria-label={`Delete FAQ: ${item.question}`}
                className="mt-3">
                <input type="hidden" name="faqId" value={item.id} />
                <button
                  type="submit"
                  className="min-h-11 rounded-full border border-red-800/30 px-4 text-sm font-semibold text-red-900 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800">
                  Delete question
                </button>
              </form>
              <p className="mt-2 text-xs text-ceda-muted">
                {item.isPublished
                  ? "Visible publicly"
                  : "Hidden from the public page"}
              </p>
            </article>
          ))}
        </section>
        {!items.length && (
          <p className="mt-5 rounded-xl bg-white p-5 text-sm text-ceda-muted">
            No questions have been created yet.
          </p>
        )}
      </div>
    </main>
  );
}
