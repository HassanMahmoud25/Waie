"use client";

import { useCallback } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { listQuickTopicsAction, searchContentAction } from "@/app/(site)/search/actions";
import { getEpisodesByIdsAction, getSeriesCoverThumbnailsAction } from "@/lib/library/actions";
import { queryKeys, normalizeSearchQuery } from "@/lib/query/keys";
import { SEARCH_GC_TIME, STALE_TIME } from "@/lib/query/client";
import { clearViewerQueries, invalidateAfterMutation, type ContentMutation } from "@/lib/query/invalidate";
import type { Episode } from "@/types/episode";

/**
 * Shared query hooks for server state the client fetches itself. Each hook
 * owns its key (lib/query/keys.ts), so every component asking for the same
 * data shares one request and one cache entry -- and a component that
 * remounts (navigating away and back) renders the cached data immediately
 * instead of its skeleton.
 */

/** Quick-browse topic chips in the search modal. */
export function useQuickTopics(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.topics.quickList(),
    queryFn: () => listQuickTopicsAction(),
    staleTime: STALE_TIME.topics,
    enabled,
  });
}

/**
 * Live search results (pass the already-debounced query). Keyed by the
 * normalized query, so a response that arrives late can never be shown for a
 * newer query, and retyping a recent query is served from the cache. Bounded
 * by SEARCH_GC_TIME plus a hard entry cap (lib/query/client.ts).
 */
export function useSearchResults(query: string) {
  const normalized = normalizeSearchQuery(query);
  return useQuery({
    queryKey: queryKeys.search.results(normalized),
    queryFn: () => searchContentAction(normalized),
    enabled: normalized.length > 0,
    staleTime: STALE_TIME.search,
    gcTime: SEARCH_GC_TIME,
  });
}

/**
 * Published episodes by id (Library's saved/completed lists, Continue
 * Watching). `isLoaded` is true once there's something real to render --
 * including "nothing to fetch" and "the fetch failed", so a failed lookup
 * renders the page without those cards instead of an endless skeleton.
 */
export function useEpisodesByIds(ids: readonly string[]) {
  const query = useQuery({
    queryKey: queryKeys.episodes.byIds(ids),
    queryFn: () => getEpisodesByIdsAction([...ids]),
    enabled: ids.length > 0,
    // A save/unsave changes the id set (and so the key): keep the previous
    // list on screen while the new one loads instead of dropping to a skeleton.
    placeholderData: keepPreviousData,
  });
  const episodes: Episode[] = ids.length > 0 ? (query.data ?? []) : [];
  return { episodes, isLoaded: ids.length === 0 || query.data !== undefined || query.isError };
}

/** Cover thumbnails for a set of series (Library's followed series). */
export function useSeriesCoverThumbnails(seriesIds: readonly string[]) {
  const query = useQuery({
    queryKey: queryKeys.series.coverThumbnails(seriesIds),
    queryFn: () => getSeriesCoverThumbnailsAction([...seriesIds]),
    enabled: seriesIds.length > 0,
    placeholderData: keepPreviousData,
  });
  const thumbnails: Record<string, string> = seriesIds.length > 0 ? (query.data ?? {}) : {};
  return { thumbnails, isLoaded: seriesIds.length === 0 || query.data !== undefined || query.isError };
}

/** For admin editors: call after a successful mutation to invalidate exactly the client queries it affects. */
export function useInvalidateAfterMutation() {
  const client = useQueryClient();
  return useCallback((mutation: ContentMutation) => invalidateAfterMutation(client, mutation), [client]);
}

/** For login/logout: drops the previous viewer's id-keyed lookups. */
export function useClearViewerQueries() {
  const client = useQueryClient();
  return useCallback(() => clearViewerQueries(client), [client]);
}
