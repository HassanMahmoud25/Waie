import type { Episode } from "./episode";
import type { Series } from "./series";
import type { Topic } from "./topic";

export type SearchResults = {
  episodes: Episode[];
  series: Series[];
  topics: Topic[];
};

/** What the live search modal receives: the top episodes only, plus how many matched in total. */
export type SearchPreview = SearchResults & { totalEpisodes: number };
