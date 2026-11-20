import Link from "next/link";
import { Suspense } from "react";
import { asc } from "drizzle-orm";
import { PageStub } from "@/components/PageStub";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireRole } from "@/lib/authorization";
import { createCategory, setCategoryActive, updateCategory } from "@/app/admin/categories/actions";

const fieldClass = "mt-1 block min-h-12 w-full rounded-xl border border-[#9A8175] bg-white px-3.5 py-3 text-base text-ceda-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ceda-burgundy";

export default function AdminCategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  return <Suspense fallback={<PageStub title="Submission categories" description="Checking administrator access…" />}><CategoryContent searchParams={searchParams} /></Suspense>;
}

async function CategoryContent({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await requireRole("admin", "/admin/categories");
  const [categoryRows, query] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.position), asc(categories.name)),
    searchParams,
  ]);
  const error = query.error === "duplicate" ? "A category with that name already exists." : query.error ? "Check the category name and description." : "";

  return <main id="main-content" className="flex-1 bg-white px-4 py-10 sm:px-6 sm:py-14"><div className="mx-auto max-w-4xl">
    <Link href="/admin" className="text-sm font-semibold text-ceda-burgundy underline underline-offset-4">← Back to administration</Link>
    <header className="mt-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-ceda-burgundy">Portal configuration</p><h1 className="mt-2 text-3xl font-bold text-ceda-ink">Submission categories</h1><p className="mt-2 text-sm leading-6 text-ceda-muted">Manage the strategic priority choices shown on new submissions. Deactivated categories stay attached to earlier applications.</p></header>
    {error && <p className="mt-5 rounded-xl border border-red-800/25 bg-red-50 p-4 text-sm text-red-900" role="alert">{error}</p>}
    <section aria-labelledby="category-list-heading" className="mt-8"><h2 id="category-list-heading" className="text-xl font-bold text-ceda-ink">Current categories</h2>
      {categoryRows.length ? <ul className="mt-4 space-y-4">{categoryRows.map((category) => <li key={category.id} className={`rounded-2xl border border-ceda-line p-5 ${category.isActive ? "bg-white" : "bg-[#F7F8F9]"}`}>
        <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-bold text-ceda-ink">{category.name}</h3><span className={`text-xs font-semibold ${category.isActive ? "text-green-800" : "text-ceda-muted"}`}>{category.isActive ? "Active" : "Inactive"}</span></div>
        <form action={updateCategory} aria-label={`Edit ${category.name}`} className="space-y-3"><input type="hidden" name="categoryId" value={category.id} />
          <div><label htmlFor={`category-name-${category.id}`} className="text-sm font-semibold text-ceda-ink">Name</label><input id={`category-name-${category.id}`} name="name" required minLength={2} maxLength={150} defaultValue={category.name} className={fieldClass} /></div>
          <div><label htmlFor={`category-description-${category.id}`} className="text-sm font-semibold text-ceda-ink">Description</label><textarea id={`category-description-${category.id}`} name="description" maxLength={2000} rows={2} defaultValue={category.description ?? ""} className={fieldClass} /></div>
          <button type="submit" className="inline-flex min-h-12 items-center rounded-full border border-ceda-line px-5 text-sm font-bold text-ceda-burgundy">Save category</button>
        </form>
        <form action={setCategoryActive} className="mt-3"><input type="hidden" name="categoryId" value={category.id} /><input type="hidden" name="isActive" value={String(!category.isActive)} /><button type="submit" className="inline-flex min-h-12 items-center rounded-full border border-ceda-line px-5 text-sm font-semibold text-ceda-burgundy">{category.isActive ? "Deactivate" : "Activate"}</button></form>
      </li>)}</ul> : <p className="mt-4 rounded-xl bg-[#FFF9F4] p-5 text-sm text-ceda-muted">No categories are configured yet.</p>}
    </section>
    <section aria-labelledby="new-category-heading" className="mt-8 rounded-2xl border border-ceda-line bg-[#FFF9F4] p-6 sm:p-8">
      <h2 id="new-category-heading" className="text-xl font-bold text-ceda-ink">Add a category</h2>
      <form action={createCategory} aria-labelledby="new-category-heading" className="mt-4 space-y-4">
        <div><label htmlFor="new-category-name" className="text-sm font-semibold text-ceda-ink">Name</label><input id="new-category-name" name="name" required minLength={2} maxLength={150} className={fieldClass} /></div>
        <div><label htmlFor="new-category-description" className="text-sm font-semibold text-ceda-ink">Description</label><textarea id="new-category-description" name="description" maxLength={2000} rows={3} className={fieldClass} /></div>
        <button type="submit" className="inline-flex min-h-12 items-center rounded-full bg-ceda-burgundy px-6 text-sm font-bold text-white hover:bg-[#5C150D]">Create category</button>
      </form>
    </section>
  </div></main>;
}
