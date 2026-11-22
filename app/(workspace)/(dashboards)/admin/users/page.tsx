import { Suspense } from "react";
import { AssignRoleForm } from "@/components/admin/AssignRoleForm";
import { WorkspacePageSkeleton } from "@/components/workspace/WorkspacePageSkeleton";
import { resolveUsersAdminNotice } from "@/lib/admin-messages";
import { requireRole } from "@/lib/authorization";
import { loadAdminUsersDirectory } from "@/lib/server/admin-governance";

export default function AdminUsersPage({
  searchParams,
}: PageProps<"/admin/users">) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton variant="list" />}>
      <AdminUsersContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminUsersContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole("admin", "/admin/users");
  const [{ users, roleOptions }, query] = await Promise.all([
    loadAdminUsersDirectory(100),
    searchParams,
  ]);
  const notice = resolveUsersAdminNotice(query);

  return (
    <main
      id="main-content"
      className="flex-1 bg-white px-gutter py-ds-6 sm:py-ds-8"
    >
      <div className="mx-auto w-full max-w-(--container-workspace)">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ceda-burgundy">
            Access control
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ceda-ink">
            Users and roles
          </h1>
          <p className="mt-2 text-sm text-ceda-muted">
            Assign staff workspace roles. New accounts receive only the
            submitter role.
          </p>
        </header>

        {notice ? (
          <p
            className="mt-5 rounded-xl border border-ceda-line bg-[#FFF9F4] p-4 text-sm text-ceda-body"
            role="status"
          >
            {notice}
          </p>
        ) : null}

        {!roleOptions.length ? (
          <p className="mt-5 rounded-xl border border-amber-700/30 bg-amber-50 p-4 text-sm text-amber-950">
            No roles are configured. Run the role seed before assigning staff
            access.
          </p>
        ) : null}

        <div className="mt-7 space-y-4">
          {users.map((account) => (
            <article
              key={account.id}
              className="rounded-2xl border border-ceda-line bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2
                    id={`user-title-${account.id}`}
                    className="font-bold text-ceda-ink"
                  >
                    {account.name}
                  </h2>
                  <p className="mt-1 text-sm text-ceda-muted">
                    {account.email} ·{" "}
                    {account.emailVerified
                      ? "Email verified"
                      : "Email not verified"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {account.currentRoles.length ? (
                      account.currentRoles.map((role) => (
                        <span
                          key={role.id}
                          className="rounded-full bg-[#FFF1E4] px-3 py-1 text-xs font-semibold text-ceda-burgundy"
                        >
                          {role.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-ceda-muted">
                        No roles assigned
                      </span>
                    )}
                  </div>
                </div>
                {account.availableRoles.length > 0 ? (
                  <AssignRoleForm
                    userId={account.id}
                    availableRoles={account.availableRoles}
                  />
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {users.length === 100 ? (
          <p className="mt-4 text-xs text-ceda-muted">
            Showing the 100 most recently created accounts.
          </p>
        ) : null}
      </div>
    </main>
  );
}
