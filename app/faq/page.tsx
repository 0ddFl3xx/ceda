import { asc, eq } from "drizzle-orm";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageStub } from "@/components/PageStub";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { FaqBrowser } from "@/components/faq/FaqBrowser";

export default function FaqPage() {
  return <Suspense fallback={<PageStub title="Frequently asked questions" description="Loading current answers…" />}><FaqContent /></Suspense>;
}

async function FaqContent() {
  await connection();
  const questions = await db.select({
    id: faqs.id,
    topic: faqs.topic,
    question: faqs.question,
    answer: faqs.answer,
  }).from(faqs).where(eq(faqs.isPublished, true)).orderBy(asc(faqs.topic), asc(faqs.position));

  return <FaqBrowser questions={questions} />;
}
