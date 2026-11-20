"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Bell, CheckCircle2, Clock3, FileText, PlusCircle, RefreshCw, Trophy, Users } from "lucide-react";

type Idea = { id: string; referenceNo: string; status: string; updatedAt: Date; callTitle: string; title: string | null; summary: string | null };
type Props = { name: string; ideas: Idea[] };

function statusGroup(status: string) {
  if (status === "draft") return "drafts";
  if (["submitted", "in_review", "changes_requested"].includes(status)) return "review";
  return "decided";
}

function countStatus(ideas: Idea[], group: string) {
  return ideas.filter((idea) => statusGroup(idea.status) === group).length;
}

export function SubmitterDashboard({ name, ideas }: Props) {
  const [tab, setTab] = useState("drafts");
  const filtered = ideas.filter((idea) => statusGroup(idea.status) === tab);
  const displayName = name.trim().split(/\s+/)[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return <main id="main-content" className="flex-1 bg-[#F7F8F9]">
    <header className="border-b border-slate-100 bg-white px-4 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
        <div className="flex items-center gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ceda-burgundy text-xl font-bold text-white" aria-hidden="true">{name.trim().split(/\s+/).map((word) => word[0]).slice(0, 2).join("").toUpperCase()}</div><div><p className="text-sm text-ceda-muted">{greeting}, {displayName}</p><h1 className="text-2xl font-bold text-ceda-ink">{name || "Innovator"}</h1><p className="mt-1 text-sm text-ceda-muted">Your innovation workspace</p></div></div>
        <button type="button" onClick={() => window.location.reload()} aria-label="Refresh dashboard" className="flex h-11 w-11 items-center justify-center rounded-full text-slate-400 hover:bg-surface-muted hover:text-ceda-burgundy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy"><RefreshCw aria-hidden="true" className="h-5 w-5" /></button>
      </div>
    </header>

    <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-8 sm:py-9 lg:px-10">
      <div className="grid gap-4">
        <Link href="/submit" className="flex min-h-28 w-full items-center gap-5 rounded-2xl border border-ceda-burgundy bg-white p-6 text-ceda-ink shadow-sm transition hover:bg-[#FFF9F4] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF1E4] text-ceda-burgundy"><PlusCircle aria-hidden="true" className="h-6 w-6" /></span><span><strong className="block text-lg">Submit an idea</strong><span className="mt-1 block text-sm text-ceda-muted">Start a new innovation submission</span></span></Link>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Submission summary">
        {[
          { label: "Submitted", value: ideas.filter((idea) => idea.status !== "draft").length, icon: FileText, tone: "bg-[#F3E9E5] text-ceda-burgundy" },
          { label: "Drafts", value: countStatus(ideas, "drafts"), icon: Clock3, tone: "bg-[#FFF1E4] text-[#C56500]" },
          { label: "In review", value: countStatus(ideas, "review"), icon: Trophy, tone: "bg-[#EEF0FA] text-[#315EDB]" },
          { label: "Completed", value: ideas.filter((idea) => ["approved", "rejected", "awarded", "withdrawn"].includes(idea.status)).length, icon: CheckCircle2, tone: "bg-[#E8F5ED] text-[#13844A]" },
        ].map((stat) => <article key={stat.label} className="flex min-h-28 items-center gap-4 rounded-2xl border border-white bg-white p-4 shadow-sm sm:p-6"><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}><stat.icon aria-hidden="true" className="h-6 w-6" /></span><span><strong className="block text-2xl font-bold text-ceda-ink">{stat.value}</strong><span className="text-sm text-ceda-muted">{stat.label}</span></span></article>)}
      </section>

      <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)]">
        <section className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm" aria-labelledby="applications-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><h2 id="applications-heading" className="text-lg font-bold text-ceda-ink">My applications</h2><Link href="/submit" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ceda-burgundy px-4 text-sm font-bold text-white hover:bg-[#5C150D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy"><PlusCircle aria-hidden="true" className="h-4 w-4" />New submission</Link></div>
          <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-4" role="group" aria-label="Filter applications">
            {[{ key: "drafts", label: "Drafts" }, { key: "review", label: "In review" }, { key: "decided", label: "Decided" }].map((item) => <button key={item.key} type="button" aria-pressed={tab === item.key} onClick={() => setTab(item.key)} className={`relative min-h-12 shrink-0 px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ceda-burgundy ${tab === item.key ? "text-ceda-burgundy after:absolute after:inset-x-2 after:bottom-0 after:border-b-[3px] after:border-ceda-burgundy" : "text-slate-500 hover:text-ceda-ink"}`}>{item.label}<span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{countStatus(ideas, item.key)}</span></button>)}
          </div>
          {filtered.length ? <ul className="divide-y divide-slate-100">{filtered.map((idea) => <li key={idea.id}><Link href={idea.status === "draft" ? `/submit?draft=${idea.id}` : `/dashboard/submissions/${idea.id}`} className="block px-5 py-5 transition hover:bg-[#FFFCFA] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-ceda-burgundy sm:px-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="text-xs font-bold uppercase tracking-wide text-ceda-burgundy">{idea.referenceNo}</span><h3 className="mt-1 text-lg font-bold text-ceda-ink">{idea.title || "Untitled submission"}</h3></div><span className="rounded-full bg-[#FFF1E4] px-3 py-1.5 text-xs font-semibold capitalize text-ceda-ink">{idea.status.replaceAll("_", " ")}</span></div><p className="mt-2 line-clamp-2 text-sm leading-6 text-ceda-muted">{idea.summary || "Continue your application where you left off."}</p><p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>{idea.callTitle}</span><span aria-hidden="true">·</span><span>Updated {idea.updatedAt.toLocaleDateString("en-BW", { dateStyle: "medium", timeZone: "Africa/Gaborone" })}</span><ArrowRight aria-hidden="true" className="ml-auto h-4 w-4" /></p></Link></li>)}</ul> : <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-slate-300"><Clock3 aria-hidden="true" className="h-7 w-7" /></span><h3 className="mt-4 font-semibold text-slate-700">{tab === "drafts" ? "No drafts yet" : tab === "review" ? "Nothing in review" : "No decisions yet"}</h3><p className="mt-1 max-w-md text-sm leading-6 text-ceda-muted">{tab === "drafts" ? "Start an application and it will be saved here as you go." : tab === "review" ? "Submitted applications will appear here while they are being reviewed." : "Completed applications and their decisions will appear here."}</p>{tab === "drafts" && <Link href="/submit" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-ceda-burgundy px-5 text-sm font-bold text-white hover:bg-[#5C150D]"> <PlusCircle aria-hidden="true" className="h-4 w-4" />Start an application</Link>}</div>}
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-white bg-white p-5 shadow-sm"><h2 className="flex items-center gap-3 font-bold text-ceda-ink"><Trophy aria-hidden="true" className="h-5 w-5 text-slate-300" />Active opportunities</h2><p className="mt-4 text-sm leading-6 text-ceda-muted">Explore open opportunities and find the right place for your idea.</p><Link href="/submit" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-ceda-burgundy hover:underline">Browse opportunities <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></section>
          <section className="rounded-2xl border border-white bg-white p-5 shadow-sm"><h2 className="flex items-center gap-3 font-bold text-ceda-ink"><Users aria-hidden="true" className="h-5 w-5 text-slate-300" />My teams</h2><p className="mt-3 text-sm leading-6 text-ceda-muted">Team collaboration features are coming soon.</p></section>
          <section className="rounded-2xl border border-white bg-white p-5 shadow-sm"><h2 className="flex items-center gap-3 font-bold text-ceda-ink"><Bell aria-hidden="true" className="h-5 w-5 text-slate-300" />Recent activity</h2>{ideas.length ? <ul className="mt-4 space-y-4">{ideas.slice(0, 3).map((idea) => <li key={idea.id} className="border-l-2 border-[#F4B58A] pl-3"><p className="text-sm font-semibold text-ceda-ink">{idea.status === "draft" ? "Draft saved" : `Application ${idea.status.replaceAll("_", " ")}`}</p><p className="mt-1 text-xs text-ceda-muted">{idea.title || idea.referenceNo}</p></li>)}</ul> : <p className="mt-3 text-sm leading-6 text-ceda-muted">Your submission updates will appear here.</p>}</section>
        </aside>
      </div>
    </div>
  </main>;
}
