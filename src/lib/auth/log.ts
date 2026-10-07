import { Prisma } from "@prisma/client";

/**
 * Server-side diagnostics for the auth actions, whose user-facing messages
 * stay deliberately generic. Logs enough to identify a failure (error class,
 * Prisma code + meta, message, stack) without ever logging what the call was
 * made with: a PrismaClientValidationError's message reprints the whole query
 * including its arguments (emails, password hashes, token hashes), so its
 * message is dropped. Callers must never pass passwords, tokens or session
 * cookies in `context`.
 */

/** Prisma codes meaning the database is missing a table/column the code expects. */
const SCHEMA_DRIFT_CODES = new Set(["P2021", "P2022"]);

export function logAuthError(context: string, error: unknown): void {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const drift = SCHEMA_DRIFT_CODES.has(error.code);
    console.error(`[auth] ${context} failed: Prisma ${error.code}`, {
      meta: error.meta,
      message: error.message.trim().split("\n").at(-1),
      ...(drift && {
        hint: "The database schema is behind this code -- apply pending migrations with `npx prisma migrate deploy`.",
      }),
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error(`[auth] ${context} failed: PrismaClientValidationError (message omitted -- it echoes query arguments)`);
    return;
  }

  if (error instanceof Error) {
    console.error(`[auth] ${context} failed: ${error.name}: ${error.message}`, error.stack?.split("\n").slice(1, 6).join("\n"));
    return;
  }

  console.error(`[auth] ${context} failed with a non-Error value of type ${typeof error}`);
}
