import { staticContentRepository } from "./static-content-repository";
import { prismaContentRepository } from "./prisma-content-repository";

export type { ContentRepository } from "./content-repository";

/**
 * The single import site every page/component should use:
 *   import { contentRepository } from "@/lib/repositories";
 *
 * Selects the Prisma-backed repository once a real database is configured
 * (DATABASE_URL set), and falls back to the static in-memory demo content
 * otherwise -- so the app keeps working out of the box before anyone has
 * run the YouTube import.
 */
export const contentRepository = process.env.DATABASE_URL ? prismaContentRepository : staticContentRepository;
