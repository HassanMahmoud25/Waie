import { PrismaClient } from "@prisma/client";

/**
 * Lazy, memoized PrismaClient.
 *
 * Constructing PrismaClient eagerly at module load would mean simply
 * *importing* this file crashes whenever `prisma generate` hasn't been run
 * yet (its generated output doesn't exist), even on code paths that never
 * end up querying the database (e.g. a build step that only imports types).
 *
 * Wrapping access in a Proxy defers the real `new PrismaClient()` call
 * until a property on `prisma` is actually touched (e.g. `prisma.episode`),
 * which only happens inside the Prisma repository's own method bodies --
 * never merely from importing this module. That also means a missing
 * DATABASE_URL surfaces only once a page actually tries to read content,
 * as a clear, deliberate error rather than a build-time crash.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not configured. The database is the only source of content -- " +
        "set DATABASE_URL (see .env.example) before running the app.",
    );
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getPrismaClient() as object, prop, receiver);
  },
});
