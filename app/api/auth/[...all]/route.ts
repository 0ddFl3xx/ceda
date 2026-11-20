import { toNextJsHandler } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { signupSchema } from "@/lib/auth-validation";
import { provisionSubmitter } from "@/lib/server/auth-provisioning";
import { ensureBuiltinRoles } from "@/lib/server/builtin-roles";
import { db } from "@/db";
import { user } from "@/db/auth-schema";

const handlers = toNextJsHandler(auth);

async function handle(request: Request, method: keyof typeof handlers) {
  const url = new URL(request.url);
  if (method === "POST" && url.pathname.endsWith("/sign-up/email")) {
    let body: unknown;
    try {
      body = await request.clone().json();
    } catch {
      return Response.json({ message: "Invalid request body." }, { status: 400 });
    }
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ message: "Enter your name, a valid email, a password of at least 12 characters, and accept the privacy notice." }, { status: 400 });
    }
    const normalizedEmail = parsed.data.email.trim().toLowerCase();

    // Seed roles before Better Auth creates an account, so a missing role can
    // never leave a registered user without the submitter access they need.
    try {
      await db.transaction((tx) => ensureBuiltinRoles(tx));
    } catch {
      return Response.json({ message: "Account setup is temporarily unavailable. Please try again shortly." }, { status: 503 });
    }

    const authRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(parsed.data),
    });
    const response = await handlers.POST(authRequest);
    if (!response.ok) {
      // A previous signup attempt may have created the auth user before role
      // provisioning failed. Repair that account when the same person retries.
      if (response.status === 422) {
        const [existingUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, normalizedEmail)).limit(1);
        if (existingUser) {
          const provisioned = await provisionSubmitter({
            userId: existingUser.id,
            consentedAt: new Date(),
            ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip"),
            userAgent: request.headers.get("user-agent"),
          });
          if (!provisioned) return accountSetupUnavailable();
        } else {
          console.error("Signup retry found no persisted user row after Better Auth returned an existing-account response.");
          return accountSetupUnavailable();
        }
      }
      return response;
    }

    const result = await response.clone().json().catch(() => null);
    if (typeof result?.user?.id === "string") {
      // With requireEmailVerification enabled, Better Auth deliberately returns
      // a synthetic user ID for duplicate emails. Resolve the persisted user
      // by normalized email before provisioning any application records.
      const [persistedUser] = await db.select({ id: user.id, email: user.email })
        .from(user).where(eq(user.email, normalizedEmail)).limit(1);
      if (!persistedUser) {
        console.error("Signup returned a user-shaped response, but no persisted account matches its email.");
        return accountSetupUnavailable();
      }

      if (persistedUser.id !== result.user.id) {
        try {
          await auth.api.sendVerificationOTP({
            body: { email: persistedUser.email, type: "email-verification" },
            headers: request.headers,
          });
        } catch (error) {
          console.error("Could not resend the verification code for an existing account.", error);
          return Response.json({ message: "We could not send a verification code. Please try again shortly." }, { status: 503 });
        }
      }

      const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
      const provisioned = await provisionSubmitter({
        userId: persistedUser.id,
        consentedAt: new Date(),
        ipAddress: forwarded ?? request.headers.get("x-real-ip"),
        userAgent: request.headers.get("user-agent"),
      });
      if (!provisioned) {
        console.error("Signup returned a user ID that is missing from the shared auth and portal database connection.");
        return accountSetupUnavailable();
      }
    }
    return response;
  }

  return handlers[method](request);
}

function accountSetupUnavailable() {
  return Response.json({
    message: process.env.NODE_ENV === "production"
      ? "Account setup is temporarily unavailable. Please try again shortly."
      : "Signup could not finish saving account details. Restart the development server and try again. If it persists, inspect the signup database transaction.",
  }, { status: 503 });
}

export const GET = (request: Request) => handle(request, "GET");
export const POST = (request: Request) => handle(request, "POST");
export const PATCH = (request: Request) => handle(request, "PATCH");
export const PUT = (request: Request) => handle(request, "PUT");
export const DELETE = (request: Request) => handle(request, "DELETE");
