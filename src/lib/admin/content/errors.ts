/**
 * Shared error type for the admin content layer (episodes/series/topics) --
 * thrown for expected validation/business-rule failures (not found, invalid
 * relation, unsafe delete, ...) so the Server Action layer can turn it into a
 * clean user-facing message instead of a generic 500. Extracted from
 * lib/admin/content/episodes.ts (Phase 3A) so series.ts/topics.ts (Phase 3C)
 * can reuse the exact same error without importing from episodes.ts.
 */
export class AdminContentError extends Error {}
