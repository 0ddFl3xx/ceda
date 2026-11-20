import Link from "next/link";
import { Clock3, Mail, Phone, ShieldCheck } from "lucide-react";

const responseTargets = [
  { topic: "Account access", target: "1 working day" },
  { topic: "Submission or review issue", target: "2 working days" },
  { topic: "General portal question", target: "3 working days" },
];

export default function SupportPage() {
  return <main id="main-content" className="flex-1 bg-[#FFFDFC] px-4 py-10 sm:px-6 sm:py-14">
    <div className="mx-auto max-w-5xl">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ceda-burgundy">Help and support</p>
        <h1 className="mt-2 text-3xl font-bold text-ceda-ink sm:text-4xl">Get help with the innovation portal</h1>
        <p className="mt-4 text-base leading-7 text-ceda-body">Contact CEDA for account access, submission questions, or help using the prototype. Include your submission reference when your request is about an application.</p>
      </header>

      <section aria-labelledby="support-contact-heading" className="mt-8 grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-ceda-line bg-white p-6 shadow-sm">
          <h2 id="support-contact-heading" className="flex items-center gap-2 text-lg font-bold text-ceda-ink"><Phone aria-hidden="true" className="h-5 w-5 text-ceda-burgundy" />Call CEDA</h2>
          <a className="mt-4 inline-flex min-h-12 items-center font-semibold text-ceda-burgundy underline underline-offset-4" href="tel:+2673170895">+267 317 0895</a>
          <p className="mt-1 text-sm text-ceda-muted">CEDA general enquiries</p>
        </article>
        <article className="rounded-2xl border border-ceda-line bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ceda-ink"><Mail aria-hidden="true" className="h-5 w-5 text-ceda-burgundy" />Email CEDA</h2>
          <a className="mt-4 inline-flex min-h-12 items-center font-semibold text-ceda-burgundy underline underline-offset-4" href="mailto:feedback@ceda.co.bw">feedback@ceda.co.bw</a>
          <p className="mt-1 text-sm text-ceda-muted">For a portal issue, include the page and a short description.</p>
        </article>
      </section>

      <section aria-labelledby="response-targets-heading" className="mt-8 rounded-2xl border border-ceda-line bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-3"><Clock3 aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-ceda-burgundy" /><div><h2 id="response-targets-heading" className="text-xl font-bold text-ceda-ink">Prototype response targets</h2>
          <p className="mt-2 rounded-xl border border-amber-700/25 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Demo placeholders:</strong> These turnaround targets are for demonstrating the support flow. CEDA must approve service hours, ownership, and response commitments before they are presented as official.</p>
          <ul className="mt-4 divide-y divide-ceda-line">{responseTargets.map(({ topic, target }) => <li key={topic} className="flex min-h-14 flex-col justify-center gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span className="font-semibold text-ceda-ink">{topic}</span><span className="text-ceda-body">Target reply: {target}</span></li>)}</ul>
        </div></div>
      </section>

      <section aria-labelledby="privacy-support-heading" className="mt-8 rounded-2xl border border-ceda-line bg-[#FFF9F4] p-6 sm:p-8">
        <h2 id="privacy-support-heading" className="flex items-center gap-2 text-xl font-bold text-ceda-ink"><ShieldCheck aria-hidden="true" className="h-5 w-5 text-ceda-burgundy" />Privacy or data concern</h2>
        <p className="mt-2 text-sm leading-6 text-ceda-body">This prototype does not yet have a dedicated privacy-request process. Contact CEDA through the public contact channels and ask to be directed to the appropriate privacy contact. Please do not include passwords or confidential business information in support messages.</p>
        <Link href="/privacy" className="mt-4 inline-flex min-h-12 items-center font-semibold text-ceda-burgundy underline underline-offset-4">Read the prototype privacy information</Link>
      </section>
    </div>
  </main>;
}
