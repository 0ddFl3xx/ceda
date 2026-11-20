import { describe, expect, it } from "vitest";
import { insertInAppNotifications } from "@/lib/server/notifications";
import type { DatabaseTransaction } from "@/lib/server/audit";

describe("insertInAppNotifications", () => {
  it("suppresses disabled in-portal alerts and keeps enabled or unset preferences", async () => {
    const inserted: { userId: string; title?: string }[][] = [];
    const tx = {
      select: () => ({
        from: () => ({
          where: async () => [
            { userId: "muted-user", enabled: false },
            { userId: "enabled-user", enabled: true },
          ],
        }),
      }),
      insert: () => ({ values: async (events: { userId: string; title?: string }[]) => { inserted.push(events); } }),
    } as unknown as DatabaseTransaction;

    await insertInAppNotifications(tx, [
      { userId: "muted-user", type: "test", title: "Muted", body: "test" },
      { userId: "enabled-user", type: "test", title: "Enabled", body: "test" },
      { userId: "unset-user", type: "test", title: "Default enabled", body: "test" },
    ]);

    expect(inserted).toEqual([[{ userId: "enabled-user", type: "test", title: "Enabled", body: "test" }, { userId: "unset-user", type: "test", title: "Default enabled", body: "test" }]]);
  });

  it("does not issue an insert for an empty event list", async () => {
    const tx = { select: () => { throw new Error("No preference lookup expected"); }, insert: () => { throw new Error("No insert expected"); } } as unknown as DatabaseTransaction;
    await expect(insertInAppNotifications(tx, [])).resolves.toBeUndefined();
  });
});
