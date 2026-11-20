import Image from "next/image";
import { ArrowRight, BriefcaseBusiness, Compass, Handshake, Lightbulb, ShieldCheck } from "lucide-react";

const values = [
  { name: "Collaborative", description: "We value Botho, co-creation and strong relationships with clients and stakeholders.", icon: Handshake },
  { name: "Innovative", description: "We anticipate change, embrace creativity and respond to challenges with fresh solutions.", icon: Lightbulb },
  { name: "Courageous", description: "We take considered risks, learn from mistakes and speak openly in pursuit of our goals.", icon: Compass },
  { name: "Accountable", description: "We take ownership and act with openness, transparency, honesty and integrity.", icon: ShieldCheck },
];

export default function AboutPage() {
  return (
    <main id="main-content" className="flex-1 bg-white">
      <section className="px-4 pb-14 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-20">
        <div className="mx-auto grid max-w-[1380px] items-center gap-8 overflow-hidden rounded-2xl border border-ceda-line bg-white px-6 py-10 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-14">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ceda-orange">About CEDA</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight text-ceda-ink sm:text-5xl">Building opportunity for citizen enterprises</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ceda-muted">The Citizen Entrepreneurial Development Agency supports citizen-owned businesses in Botswana through financing and enterprise development support.</p>
            <p className="mt-4 inline-flex rounded-full bg-[#FFF1E4] px-3 py-1.5 text-xs font-bold text-ceda-burgundy">Established in 2001 · Citizen enterprise development</p>
            <a href="https://www.ceda.co.bw/about-ceda" target="_blank" rel="noreferrer" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-ceda-burgundy px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#5C150D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy">Read more about CEDA <ArrowRight aria-hidden="true" className="h-4 w-4" /><span className="sr-only"> (opens in a new tab)</span></a>
          </div>
          <div className="relative mx-auto flex min-h-[280px] w-full max-w-[560px] items-center justify-center sm:min-h-[360px]">
            <div aria-hidden="true" className="absolute inset-x-[8%] inset-y-[12%] rounded-[44%_56%_48%_52%] bg-[#FCEBDD]" />
            <div aria-hidden="true" className="absolute right-[8%] top-[14%] h-28 w-28 rounded-full bg-[#F4B58A]/50 blur-2xl" />
            <Image src="/assets/ceda%20hq.png" alt="CEDA Head Office in Botswana" fill priority sizes="(max-width: 1024px) 90vw, 40vw" className="relative object-contain p-4 sm:p-7" />
            <span className="absolute bottom-5 left-4 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-xs font-bold text-ceda-burgundy shadow-sm sm:bottom-8 sm:left-8">Citizen enterprise, built to last</span>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16" aria-labelledby="mandate-title">
        <div className="mx-auto grid max-w-[1180px] gap-6 md:grid-cols-2">
          <article className="rounded-2xl bg-[#F8F9FA] p-7 sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-ceda-burgundy shadow-sm"><BriefcaseBusiness aria-hidden="true" className="h-5 w-5" /></span>
            <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-ceda-orange">Our mandate</p>
            <h2 id="mandate-title" className="mt-2 text-2xl font-bold text-ceda-ink">Back viable citizen businesses</h2>
            <p className="mt-4 leading-7 text-ceda-muted">CEDA’s mandate is to empower citizen entrepreneurs by supporting projects that may not ordinarily receive financing from traditional institutions, contributing to business growth and jobs.</p>
          </article>
          <article className="rounded-2xl bg-[#7A1F14] p-7 text-white shadow-[0_16px_36px_rgba(122,31,20,0.12)] sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#F4B58A]"><Compass aria-hidden="true" className="h-5 w-5" /></span>
            <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#F4B58A]">Our mission</p>
            <h2 className="mt-2 text-2xl font-bold">Fund, grow and sustain</h2>
            <p className="mt-4 leading-7 text-white/80">CEDA’s mission is “To fund, grow and sustain a thriving SMME sector in Botswana.” Its vision is to build an innovative, competitive and impactful SMME sector.</p>
          </article>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16" aria-labelledby="what-we-do-title">
        <div className="mx-auto max-w-[1380px]">
          <div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-ceda-orange">How CEDA supports businesses</p><h2 id="what-we-do-title" className="mt-2 text-3xl font-bold text-ceda-ink">More than finance</h2><p className="mt-3 leading-7 text-ceda-muted">Business growth often needs funding, preparation and guidance. CEDA’s support is designed around those connected needs.</p></div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { title: "Financing", text: "Funding supports viable citizen businesses in agriculture, property and manufacturing, services and other eligible areas." },
              { title: "Business development", text: "Training and mentoring help entrepreneurs strengthen practical business skills and decision-making." },
              { title: "Enterprise growth", text: "CEDA works to help local businesses become sustainable, competitive contributors to Botswana’s economy." },
            ].map((item, index) => <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_28px_rgba(51,31,23,0.05)]"><span className="text-xs font-black tracking-[0.14em] text-ceda-orange">0{index + 1}</span><h3 className="mt-3 text-xl font-bold text-ceda-ink">{item.title}</h3><p className="mt-3 text-sm leading-6 text-ceda-muted">{item.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#F8F9FA] px-4 py-14 sm:px-6 lg:px-8 lg:py-18" aria-labelledby="values-title">
        <div className="mx-auto max-w-[1380px]">
          <div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-ceda-orange">What guides us</p><h2 id="values-title" className="mt-2 text-3xl font-bold text-ceda-ink">CEDA values</h2></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {values.map(({ name, description, icon: Icon }) => <article key={name} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF1E4] text-ceda-burgundy"><Icon aria-hidden="true" className="h-5 w-5" /></span><h3 className="mt-4 font-bold text-ceda-ink">{name}</h3><p className="mt-2 text-sm leading-6 text-ceda-muted">{description}</p></article>)}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-5 rounded-2xl border border-ceda-line bg-white p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-ceda-orange">Official information</p><h2 className="mt-2 text-2xl font-bold text-ceda-ink">Read more about CEDA</h2><p className="mt-2 text-sm leading-6 text-ceda-muted">Explore the Agency’s background, statements, guidelines and services.</p></div>
          <a href="https://www.ceda.co.bw/about-ceda" target="_blank" rel="noreferrer" className="inline-flex min-h-11 w-fit shrink-0 items-center gap-2 rounded-full border border-ceda-line bg-[#FFF9F4] px-5 text-sm font-bold text-ceda-burgundy hover:bg-[#FFF1E4] focus-visible:outline-2 focus-visible:outline-ceda-burgundy">CEDA website <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
        </div>
      </section>
    </main>
  );
}
