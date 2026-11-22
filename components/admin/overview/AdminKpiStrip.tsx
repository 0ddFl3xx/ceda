import Link from "next/link";
import { ChevronRight, ClipboardCheck, Inbox, Megaphone, Users } from "lucide-react";
import type { AdminOverviewData } from "@/lib/server/admin-overview";

type AdminKpiStripProps = Pick<
  AdminOverviewData,
  | "calls"
  | "openCallsCount"
  | "draftCallsCount"
  | "activePipelineCount"
  | "awardsCount"
  | "totalSubmissions"
  | "pendingReviewsCount"
  | "openChatsCount"
  | "changesRequestedCount"
  | "totalUsersCount"
  | "staffUsersCount"
>;

export function AdminKpiStrip({
  calls,
  openCallsCount,
  draftCallsCount,
  activePipelineCount,
  awardsCount,
  totalSubmissions,
  pendingReviewsCount,
  openChatsCount,
  changesRequestedCount,
  totalUsersCount,
  staffUsersCount,
}: AdminKpiStripProps) {
  const kpiCards = [
    {
      label: "Open calls",
      value: openCallsCount,
      detail:
        draftCallsCount > 0
          ? `${calls.length} total (${draftCallsCount} in draft)`
          : `${calls.length} ${calls.length === 1 ? "programme" : "programmes"} configured`,
      icon: Megaphone,
      iconTone: "bg-[#F3E9E5] text-ceda-burgundy",
      href: "#calls-heading",
      actionLabel: "Jump to calls",
    },
    {
      label: "Active submissions",
      value: activePipelineCount,
      detail:
        awardsCount > 0
          ? `${awardsCount} awarded out of ${totalSubmissions} total`
          : `${totalSubmissions} ${totalSubmissions === 1 ? "submission" : "submissions"} recorded`,
      icon: Inbox,
      iconTone: "bg-ceda-cream-mid text-[#C56500]",
      href: "/admin/reviews",
      actionLabel: "Review pipeline",
    },
    {
      label: "Pending reviews",
      value: pendingReviewsCount,
      detail:
        openChatsCount > 0
          ? `${openChatsCount} live support ${openChatsCount === 1 ? "chat" : "chats"} open`
          : changesRequestedCount > 0
            ? `${changesRequestedCount} awaiting applicant revision`
            : "All assigned evaluations up to date",
      icon: ClipboardCheck,
      iconTone: "bg-[var(--status-info-bg)] text-[#315EDB]",
      href: "/admin/reviews",
      actionLabel: "Open queue",
    },
    {
      label: "Registered accounts",
      value: totalUsersCount,
      detail: `${staffUsersCount} staff ${staffUsersCount === 1 ? "member" : "members"} with workspace access`,
      icon: Users,
      iconTone: "bg-[var(--status-success-bg)] text-[#13844A]",
      href: "/admin/users",
      actionLabel: "Manage roles",
    },
  ];

  return (
    <section aria-label="Portal overview metrics">
      <div className="grid grid-cols-1 gap-ds-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.label}
              className="row-span-3 grid grid-rows-subgrid gap-y-ds-2 rounded-card border border-ceda-line bg-white p-ds-5 shadow-xs"
            >
              <div className="flex items-center justify-between gap-ds-3">
                <span className="text-sm font-semibold text-ceda-body">{card.label}</span>
                <span
                  aria-hidden="true"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.iconTone}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
              </div>

              <p className="self-center py-1 text-3xl font-extrabold tabular-nums tracking-tight text-ceda-ink">
                {card.value}
              </p>

              <div className="flex items-end justify-between gap-ds-2 border-t border-ceda-line/60 pt-ds-3">
                <p className="min-w-0 text-xs leading-5 text-ceda-muted">{card.detail}</p>
                <Link
                  href={card.href}
                  aria-label={`${card.actionLabel} (${card.label})`}
                  className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-ceda-burgundy hover:underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-orange"
                >
                  <span>View</span>
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
