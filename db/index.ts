import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// The live Better Auth tables use timestamp without time zone for UTC values.
// Node parses those as local time by default, which shifted OTP/session expiry
// dates on machines outside UTC. Force UTC before the first database read.
process.env.TZ = "UTC";

// Neon HTTP cannot run interactive transactions. Use the serverless driver's
// Pool so lifecycle services can keep related writes in one transaction.
const globalForDb = globalThis as typeof globalThis & { cedaDbPool?: Pool };

export const pool =
  globalForDb.cedaDbPool ??
  new Pool({ connectionString: process.env.DATABASE_URL ?? "" });

if (process.env.NODE_ENV !== "production") globalForDb.cedaDbPool = pool;

export const db = drizzle({ client: pool, schema, casing: "snake_case" });
