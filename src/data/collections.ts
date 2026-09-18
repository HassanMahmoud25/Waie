import type { Collection } from "@/types/collection";

/**
 * Editorial collections require actual curatorial judgment (a human picking
 * a themed set of episodes and writing copy for why they belong together) —
 * that isn't something derivable from the YouTube channel's public metadata,
 * so importing real content intentionally leaves this empty rather than
 * inventing curation that doesn't exist. An editor can add real collections
 * later through the same shape.
 */
export const collections: Collection[] = [];
