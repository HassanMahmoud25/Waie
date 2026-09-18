import { prisma } from "@/lib/db/prisma";

/** ASCII-only slugification. Arabic titles collapse to "" -- callers fall back to a videoId-based slug. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * A slug guaranteed not to collide with an existing episode. Most Waie
 * titles are Arabic, so `base` is usually the videoId fallback already
 * (globally unique) and this resolves on the first try; the numeric suffix
 * loop only matters for the rare Latin-script title.
 */
export async function uniqueEpisodeSlug(preferredBase: string): Promise<string> {
  let candidate = preferredBase;
  let n = 1;
  while (await prisma.episode.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    n += 1;
    candidate = `${preferredBase}-${n}`;
  }
  return candidate;
}

export async function uniqueSeriesSlug(preferredBase: string): Promise<string> {
  let candidate = preferredBase;
  let n = 1;
  while (await prisma.series.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    n += 1;
    candidate = `${preferredBase}-${n}`;
  }
  return candidate;
}
