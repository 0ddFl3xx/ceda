"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from "lucide-react";

const cedaNews = [
  {
    category: "Agency update",
    date: "1 Apr 2026",
    title: "CEDA announces new Board of Directors",
    excerpt: "A new board brings experience in enterprise development, innovation and strategic leadership to guide the Agency’s work.",
    image: "https://www.ceda.co.bw/sites/default/files/styles/630x490/public/CEDA%20Board%20Memebers_232.jpg?itok=85_4I0Zd",
    imageAlt: "CEDA Board of Directors",
    href: "https://www.ceda.co.bw/ceda-announces-new-board-directors",
  },
  {
    category: "Agribusiness",
    date: "19 May 2026",
    title: "CEDA launches a revamped Poultry Financial Suite",
    excerpt: "The new suite aims to strengthen citizen participation across Botswana’s poultry value chain.",
    image: "https://www.ceda.co.bw/sites/default/files/styles/390x240/public/703715817_1413775747443531_7357655241376220288_n_0.jpg?itok=TTPNBYj2",
    imageAlt: "CEDA poultry finance programme launch",
    href: "https://www.ceda.co.bw/ceda-officially-launched-revamped-poultry-financial-suite",
  },
  {
    category: "Community",
    date: "4 Dec 2025",
    title: "Tutume branch officially opens",
    excerpt: "CEDA’s 14th branch extends access to business support and services in the Tutume area.",
    image: "https://www.ceda.co.bw/sites/default/files/styles/390x240/public/597671624_1279079664246474_8849870724456199716_n.jpg?itok=GLG5VKUQ",
    imageAlt: "CEDA Tutume branch opening",
    href: "https://www.ceda.co.bw/node/77604",
  },
  {
    category: "Enterprise development",
    date: "10 Aug 2026",
    title: "CEDA embraces value chain funding",
    excerpt: "A shift towards connected value chains is intended to build more resilient opportunities for entrepreneurs.",
    image: "https://www.ceda.co.bw/sites/default/files/styles/390x240/public/CEDA%20Board%20Memebers_232.jpg?itok=yJbUednJ",
    imageAlt: "CEDA leadership discussing enterprise development",
    href: "https://dailynews.gov.bw/news-detail/92627",
  },
];

function NewsImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#F8F9FA] ${className}`}>
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 800px" className="object-cover transition-transform duration-500 hover:scale-[1.03]" />
    </div>
  );
}

function ExternalArticleLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className={className}>{children}</a>;
}

export function FeaturedNewsAndFeed() {
  const [featured, ...feed] = cedaNews;
  return (
    <section id="featured-announcements" className="scroll-reveal bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-[1380px] gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-8">
          <p className="mb-7 border-l-[3px] border-ceda-burgundy pl-4 text-xs font-extrabold uppercase tracking-[0.18em] text-ceda-ink">Featured announcement</p>
          <article className="scroll-reveal overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(51,31,23,0.07)]">
            <ExternalArticleLink href={featured.href} className="block">
              <NewsImage src={featured.image} alt={featured.imageAlt} className="aspect-[16/7] w-full" />
            </ExternalArticleLink>
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-[#7A1F14]/[0.07] px-3 py-1 font-semibold text-ceda-burgundy">{featured.category}</span>
                <span aria-hidden="true">·</span><time>{featured.date}</time>
              </div>
              <h2 className="mt-4 text-2xl font-bold leading-tight text-ceda-ink sm:text-3xl">{featured.title}</h2>
              <p className="mt-3 max-w-3xl leading-7 text-ceda-muted">{featured.excerpt}</p>
              <ExternalArticleLink href={featured.href} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-ceda-burgundy px-5 text-sm font-semibold text-white transition hover:bg-[#60170E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy">
                Read article <ArrowRight aria-hidden="true" className="h-4 w-4" /><span className="sr-only"> (opens in a new tab)</span>
              </ExternalArticleLink>
            </div>
          </article>
        </div>

        <aside className="lg:col-span-4">
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-ceda-ink">Innovation Feed</h2>
            <a href="https://www.ceda.co.bw/news" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-ceda-burgundy hover:text-[#60170E]">View all <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a>
          </div>
          <div className="space-y-3">
            {feed.map((item, index) => (
              <article key={item.title} className="scroll-reveal overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" style={{ "--reveal-order": index + 1 } as React.CSSProperties}>
                <ExternalArticleLink href={item.href} className="grid min-h-[112px] grid-cols-[112px_1fr] focus-visible:outline-2 focus-visible:outline-ceda-burgundy">
                  <NewsImage src={item.image} alt={item.imageAlt} className="h-full min-h-[112px] w-full" />
                  <span className="self-center p-4">
                    <span className="block text-[11px] font-semibold text-ceda-burgundy">{item.category} <span className="font-normal text-slate-400">· {item.date}</span></span>
                    <span className="mt-1 block text-sm font-bold leading-5 text-ceda-ink">{item.title}</span>
                  </span>
                </ExternalArticleLink>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

const leaderQuotes = [
  {
    name: "Nelson Mandela",
    role: "Former President of South Africa",
    quote: "Education is the most powerful weapon which you can use to change the world.",
    context: "On education as a force for change",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Nelson_Mandela_1994_(2).jpg?width=640",
    imageAlt: "Nelson Mandela",
    source: "https://www.nelsonmandela.org/nm100-education",
    sourceLabel: "Nelson Mandela Foundation",
    credit: "Portrait: John Mathew Smith · CC BY-SA 2.0",
    imageCreditHref: "https://commons.wikimedia.org/wiki/File:Nelson_Mandela_1994_(2).jpg",
  },
  {
    name: "Barack Obama",
    role: "Former President of the United States",
    quote: "We’re going to have to build, we’re going to have to innovate.",
    context: "Nelson Mandela Annual Lecture, 2018",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Official_portrait_of_Barack_Obama.jpg?width=640",
    imageAlt: "Barack Obama",
    source: "https://www.dailymaverick.co.za/article/2018-07-18-obamas-speech-at-the-2018-nelson-mandela-annual-lecture/",
    sourceLabel: "Nelson Mandela Annual Lecture transcript",
    credit: "Portrait: Pete Souza · CC BY 3.0",
    imageCreditHref: "https://commons.wikimedia.org/wiki/File:Official_portrait_of_Barack_Obama.jpg",
  },
  {
    name: "Kofi Annan",
    role: "Former UN Secretary-General",
    quote: "Knowledge is power. Information is liberating. Education is the premise of progress, in every society, in every family.",
    context: "World Summit on the Information Society, 2003",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Kofi_Annan_2012.jpg?width=640",
    imageAlt: "Kofi Annan",
    source: "https://digitallibrary.un.org/record/285642/files/Probation_international.pdf",
    sourceLabel: "United Nations Digital Library",
    credit: "Portrait: US Mission Geneva · Public domain",
    imageCreditHref: "https://commons.wikimedia.org/wiki/File:Kofi_Annan_2012.jpg",
  },
];

export function LeadershipMessage() {
  const [active, setActive] = useState(0);
  const current = leaderQuotes[active];
  const move = (step: number) => setActive((index) => (index + step + leaderQuotes.length) % leaderQuotes.length);

  return (
    <section className="scroll-reveal bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1380px]">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5C150D] via-[#7A1F14] to-[#3E120D] p-6 text-white shadow-[0_20px_50px_rgba(122,31,20,0.14)] sm:p-10 lg:px-16 lg:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full bg-[#F4B58A]/10 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(300px,0.75fr)_1.25fr] lg:gap-12" role="region" aria-roledescription="carousel" aria-label="Leaders on ideas and progress">
            <div className="flex items-center gap-5">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white/25 bg-white/10 sm:h-32 sm:w-32">
                <Image key={current.name} src={current.image} alt={current.imageAlt} fill sizes="128px" className="object-cover" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#F4B58A]">Ideas that move us forward</p>
                <h2 className="mt-2 text-lg font-bold sm:text-xl">{current.name}</h2>
                <p className="mt-1 text-sm text-white/70">{current.role}</p>
                <a href={current.imageCreditHref} target="_blank" rel="noreferrer" className="mt-2 block text-[11px] text-white/55 underline decoration-white/25 underline-offset-2 hover:text-white/80">{current.credit}<span className="sr-only"> (image license and source, opens in a new tab)</span></a>
              </div>
            </div>
            <div key={`quote-${active}`} className="leader-quote" role="group" aria-roledescription="slide" aria-label={`${active + 1} of ${leaderQuotes.length}`}>
              <blockquote className="border-l border-white/25 pl-6 text-lg italic leading-8 text-white/95 sm:text-xl sm:leading-9">“{current.quote}”</blockquote>
              <p className="mt-4 pl-6 text-sm text-white/65">{current.context} <span aria-hidden="true">·</span> <a className="underline decoration-white/40 underline-offset-4 hover:text-white" href={current.source} target="_blank" rel="noreferrer">{current.sourceLabel}<span className="sr-only"> (opens in a new tab)</span></a></p>
            </div>
          </div>
          <div className="relative mt-8 flex items-center justify-center gap-4">
            <button type="button" onClick={() => move(-1)} aria-label="Previous leader quote" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><ChevronLeft aria-hidden="true" className="h-5 w-5" /></button>
            <div className="flex items-center gap-2" role="group" aria-label="Choose a leader quote">
              {leaderQuotes.map((leader, index) => <button key={leader.name} type="button" onClick={() => setActive(index)} aria-label={`Show ${leader.name} quote`} aria-current={active === index ? "true" : undefined} className={`min-h-6 min-w-6 rounded-full p-2 focus-visible:outline-2 focus-visible:outline-white ${active === index ? "" : "opacity-55"}`}><span aria-hidden="true" className={`block h-2 rounded-full bg-white transition-all ${active === index ? "w-6" : "w-2"}`} /></button>)}
            </div>
            <button type="button" onClick={() => move(1)} aria-label="Next leader quote" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><ChevronRight aria-hidden="true" className="h-5 w-5" /></button>
          </div>
          <p className="sr-only" aria-live="polite">Showing {current.name}, quote {active + 1} of {leaderQuotes.length}</p>
        </div>
      </div>
    </section>
  );
}

export function HallOfInnovationSection() {
  return (
    <section className="scroll-reveal bg-[#F8F9FA] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1380px]">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm"><Trophy aria-hidden="true" className="h-6 w-6" /></span>
            <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-ceda-orange">Innovation Showcase</p><h2 className="mt-1 text-2xl font-bold text-ceda-ink sm:text-3xl">Competitions</h2></div>
          </div>
        </div>

        <article className="scroll-reveal grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(51,31,23,0.07)] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[300px] overflow-hidden bg-[#F8F9FA] sm:min-h-[380px]">
            <Image
              src="/assets/poster.jpg"
              alt="CEDA Innovation Portal Hackathon competition poster"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-contain p-4 sm:p-6"
            />
            <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-900"><span className="h-2 w-2 rounded-full bg-emerald-600" /> Ongoing</span>
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-ceda-orange">Current competition</p>
            <h3 className="mt-3 text-2xl font-bold leading-tight text-ceda-ink sm:text-3xl">CEDA Innovation Portal Hackathon</h3>
            <p className="mt-4 leading-7 text-ceda-muted">Design a user-friendly platform that carries Botswana’s ideas from secure submission through collaborative evaluation, feedback and recognition. Open to citizen youth-owned companies with more than 50% youth shareholding.</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ceda-body">
              <span className="inline-flex items-center gap-2"><CalendarDays aria-hidden="true" className="h-4 w-4 text-ceda-burgundy" /> 13–23 November 2026</span>
              <span>Online · Teams of 1–5</span>
            </div>
            <Link href="/guidelines" className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-ceda-burgundy px-5 text-sm font-semibold text-white transition hover:bg-[#60170E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy">Read hackathon guidelines <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
        </article>
      </div>
    </section>
  );
}
