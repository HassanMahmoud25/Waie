import { prismaContentRepository } from "./prisma-content-repository";

export type { ContentRepository } from "./content-repository";

/**
 * The single import site every page/component should use:
 *   import { contentRepository } from "@/lib/repositories";
 *
 * The database is the only source of content -- there is no static/demo
 * fallback. If DATABASE_URL isn't configured, lib/db/prisma.ts throws a
 * clear error the first time a query actually runs, rather than silently
 * serving stale static content.
 */
export const contentRepository = prismaContentRepository;
