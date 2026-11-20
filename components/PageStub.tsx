import Link from "next/link";

interface PageStubProps {
  title: string;
  description: string;
  privacyNote?: boolean;
}

export function PageStub({ title, description, privacyNote = false }: PageStubProps) {
  return (
    <main id="main-content" className="flex-1 bg-white px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-[1380px]">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-ceda-burgundy">CEDA Innovation Portal</p>
        <h1 className="text-3xl font-bold tracking-tight text-ceda-ink sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ceda-muted">{description}</p>
        {privacyNote && (
          <aside className="mt-8 max-w-2xl rounded-xl border border-ceda-line bg-surface-muted p-5 text-sm leading-6 text-ceda-body">
            <h2 className="font-semibold text-ceda-ink">Your information and the Data Protection Act 2024</h2>
            <p className="mt-2">Registration is planned to collect only the information needed to provide portal access. Personal information will be handled in line with Botswana’s Data Protection Act 2024.</p>
            <Link href="/privacy" className="mt-3 inline-flex font-semibold text-ceda-burgundy underline underline-offset-4">Read the privacy information</Link>
          </aside>
        )}
      </div>
    </main>
  );
}
