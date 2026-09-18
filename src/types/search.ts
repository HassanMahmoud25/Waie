import type { Episode } from "./episode";
import type { Series } from "./series";
import type { Topic } from "./topic";

export type SearchResults = {
  episodes: Episode[];
  series: Series[];
  topics: Topic[];
};
