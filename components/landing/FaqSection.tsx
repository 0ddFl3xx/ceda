"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "Who is eligible to participate in CEDA innovation calls?",
    a: "Eligible participants must be Batswana Youth Companies with young citizens aged between 18 and 35 years holding more than 50% equity/shareholding. Interdisciplinary teams with technical, business, and DevOps proficiencies are strongly encouraged to collaborate.",
  },
  {
    q: "How does the portal safeguard intellectual property and personal data?",
    a: "This prototype uses role-based workspaces and records key workflow actions. It is not a statement of legal compliance or a guarantee of end-to-end encryption. Review the privacy notice and security controls before using real personal or confidential business information.",
  },
  {
    q: "Can I receive feedback and revise my submission?",
    a: "Yes. An adjudicator can request changes, and the submitter can respond with a new, versioned submission. Updates appear in the portal and can be emailed when the account has a verified address, email alerts are enabled, and portal SMTP is configured. SMS and direct file uploads are not connected; supporting material can be shared as a link.",
  },
  {
    q: "Are there any application or subscription fees?",
    a: "The prototype does not charge or process application fees. Following a submission is free and records in-portal notifications when its workflow changes. Email alerts are available when configured and enabled; SMS is not connected.",
  },
  {
    q: "How can I contact the relevant regulatory and innovation authorities?",
    a: "Contact details for CEDA, Botswana Digital & Innovation Hub, and CIPA are listed below. For current business hours and service information, use each authority's official website.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faqs" className="py-20 bg-[#FFF9F4] border-b border-[#7A1F14]/15">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF0E2] border border-[#7A1F14]/20 px-3.5 py-1 text-xs font-bold text-[#7A1F14]">
            <HelpCircle className="h-3.5 w-3.5 text-[#E8710A]" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#37231A] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#573E32] leading-relaxed">
            Everything you need to know about eligibility, review pipelines, and submission compliance.
          </p>
        </div>

        {/* Accordion List */}
        <div className="mt-12 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-[#7A1F14]/15 bg-white overflow-hidden transition shadow-sm hover:border-[#E8710A]/50"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-6 text-left text-sm sm:text-base font-bold text-[#37231A] hover:text-[#7A1F14] transition"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#7A1F14] transition-transform duration-200 ${
                      isOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-[#573E32] leading-relaxed border-t border-[#7A1F14]/10 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Regulatory Authorities Contacts Card */}
        <div className="mt-14 rounded-3xl bg-[#FFF0E2] border border-[#7A1F14]/20 p-8 shadow-sm">
          <h3 className="text-base font-bold text-[#37231A] mb-2">
            Regulatory & Support Contacts in Botswana
          </h3>
          <p className="text-xs text-[#573E32] mb-6">
            Need in-person or direct agency assistance? Reach out to our participating stakeholders:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1.5 bg-white/70 p-4 rounded-2xl border border-white">
              <strong className="text-[#37231A] block font-bold text-sm">CEDA Head Office</strong>
              <p className="text-[#573E32]">CBD, Gaborone, Botswana</p>
              <a className="block text-[#7A1F14] font-bold underline underline-offset-2" href="tel:+2673170895">+267 317 0895</a>
              <a className="block text-[#E8710A] font-medium underline underline-offset-2" href="mailto:feedback@ceda.co.bw">feedback@ceda.co.bw</a>
              <a className="inline-block pt-1 text-[#573E32] underline underline-offset-2" href="https://www.ceda.co.bw/contact-us" target="_blank" rel="noreferrer">Official CEDA contact page</a>
            </div>
            <div className="space-y-1.5 bg-white/70 p-4 rounded-2xl border border-white">
              <strong className="text-[#37231A] block font-bold text-sm">BDIH Innovation Desk</strong>
              <p className="text-[#573E32]">Plot 69184, Block 8, Gaborone</p>
              <a className="block text-[#7A1F14] font-bold underline underline-offset-2" href="tel:+2673913289">+267 391 3289</a>
              <a className="block text-[#E8710A] font-medium underline underline-offset-2" href="mailto:info@bih.co.bw">info@bih.co.bw</a>
              <a className="inline-block pt-1 text-[#573E32] underline underline-offset-2" href="https://www.bih.co.bw/contact-us/" target="_blank" rel="noreferrer">Official BDIH contact page</a>
            </div>
            <div className="space-y-1.5 bg-white/70 p-4 rounded-2xl border border-white">
              <strong className="text-[#37231A] block font-bold text-sm">Companies and Intellectual Property Authority</strong>
              <p className="text-[#573E32]">Plot 54358, Prime Plaza, CBD, Gaborone</p>
              <a className="block text-[#7A1F14] font-bold underline underline-offset-2" href="tel:+2673673700">+267 367 3700</a>
              <a className="block text-[#E8710A] font-medium underline underline-offset-2" href="mailto:info@cipa.co.bw">info@cipa.co.bw</a>
              <a className="inline-block pt-1 text-[#573E32] underline underline-offset-2" href="https://www.cipa.co.bw/" target="_blank" rel="noreferrer">Official CIPA website</a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
