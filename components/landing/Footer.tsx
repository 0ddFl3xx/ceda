import Image from "next/image";
import Link from "next/link";
import { AtSign, Play, UsersRound } from "lucide-react";

const copyrightYear = 2026;

const columns = [
  {
    title: "Platform",
    links: [
      ["News & Updates", "/news"],
      ["Submit Idea", "/submit"],
      ["Track Submission", "/track"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About CEDA", "/about"],
      ["Guidelines", "/guidelines"],
      ["FAQ", "/faq"],
      ["Help & Support", "/support"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Terms of Use", "/terms"],
      ["Privacy Policy", "/privacy"],
      ["Data Protection Act 2024", "/privacy"],
    ],
  },
] as const;

const socialIcons = [
  { label: "Social profile placeholder 1", Icon: AtSign },
  { label: "Social profile placeholder 2", Icon: UsersRound },
  { label: "Social profile placeholder 3", Icon: Play },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-sm text-slate-600">
      <div className="mx-auto grid max-w-[1380px] grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:gap-8 lg:px-8 lg:py-16">
        <div className="space-y-4 lg:col-span-2">
          <Link href="/" className="relative block h-12 w-36" aria-label="CEDA Innovation Portal home">
            <Image src="/assets/ceda logo.png" alt="CEDA" fill sizes="144px" className="object-contain object-left" />
          </Link>
          <p className="max-w-sm leading-6">
            Citizen Entrepreneurial Development Agency supports citizen entrepreneurs and innovation across Botswana.
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-ceda-burgundy">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-ceda-orange" />
            <span>Data Protection Act 2024</span>
          </div>
          <ul className="flex gap-2" aria-label="CEDA social media placeholders">
            {socialIcons.map(({ label, Icon }) => (
              <li key={label}>
                <span
                  role="img"
                  aria-label={`${label} profile placeholder`}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-slate-500"
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-ceda-ink">{column.title}</h2>
            <ul className="space-y-3">
              {column.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="transition hover:text-ceda-burgundy focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-ceda-ink">Contact</h2>
          <ul className="space-y-3">
            <li><a className="hover:text-ceda-burgundy" href="mailto:innovation@ceda.co.bw">innovation@ceda.co.bw</a></li>
            <li>Gaborone, Botswana</li>
            <li>CEDA Head Office</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {copyrightYear} Citizen Entrepreneurial Development Agency. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-ceda-burgundy">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-ceda-burgundy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
