/**
 * A reusable person who can appear in one or many episodes (see
 * prisma/schema.prisma's `Person` model). Deliberately separate from the
 * static Hosts system (`@/types/host`) -- a Person is an episode-level
 * participant record, not one of the show's three fixed hosts.
 */
export type Person = {
  id: string;
  name: string;
  imageUrl?: string | null;
};
