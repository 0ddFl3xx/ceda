export const builtinRoles = [
  { key: "submitter", name: "Submitter", description: "Creates and tracks ideas.", permissions: ["idea:submit", "idea:view_own", "feedback:reply"] },
  { key: "evaluator", name: "Evaluator", description: "Reviews assigned ideas and scores criteria.", permissions: ["evaluation:view_assigned", "evaluation:score", "feedback:create"] },
  { key: "adjudicator", name: "Adjudicator", description: "Makes final decisions on evaluated ideas.", permissions: ["adjudication:view_queue", "adjudication:decide"] },
  { key: "admin", name: "Administrator", description: "Manages users, content and portal configuration.", permissions: ["admin:manage_users", "admin:configure", "admin:reports", "idea:view_all", "workflow:advance"] },
  { key: "consultant", name: "Service Consultant", description: "Responds to portal users through the live chat queue.", permissions: ["chat:manage"] },
  { key: "committee_member", name: "Committee Member", description: "Monitors idea progress without evaluation details.", permissions: ["idea:view_committee", "idea:subscribe"] },
] as const;
