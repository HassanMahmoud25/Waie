import { PrismaClient } from "@prisma/client";

/**
 * Lazy, memoized PrismaClient.
 *
 * Constructing PrismaClient eagerly at module load would mean simply
 * *importing* this file crashes whenever `prisma generate` hasn't been run
 * yet (its generated output doesn't exist) -- and lib/repositories/index.ts
 * imports the Prisma-backed repository unconditionally (ES imports are
 * evaluated regardless of which branch a later runtime check picks), so
 * that crash would happen even when DATABASE_URL isn't configured and the
 * app only intends to use the static fallback repository.
 *
 * Wrapping access in a Proxy defers the real `new PrismaClient()` call
 * until a property on `prisma` is actually touched (e.g. `prisma.episode`),
 * which only happens inside the Prisma repository's own method bodies --
 * never merely from importing this module. So: DATABASE_URL unset -> the
 * static repository is selected and this proxy is never invoked, no crash,
 * no `prisma generate` requirement. DATABASE_URL set but not yet
 * generated -> the error still surfaces, but only once a page actually
 * tries to read content, with the real "run prisma generate" message
 * intact rather than a build-time crash.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrismaClient(): PrismaClient {
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
