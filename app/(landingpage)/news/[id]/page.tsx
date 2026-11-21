import { Suspense } from "react";
import { PageStub } from "@/components/PageStub";

export default function NewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageStub title="Announcement" description="Loading announcement..." />}>
      <NewsArticleContent params={params} />
    </Suspense>
  );
}

async function NewsArticleContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PageStub title="Announcement" description={`Announcement ${id} will appear here.`} />;
}
