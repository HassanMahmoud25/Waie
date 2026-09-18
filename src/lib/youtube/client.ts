/**
 * Low-level, server-only boundary around the YouTube Data API v3.
 *
 * Nothing above this file ever sees an API key or a raw fetch call -- every
 * other module in lib/youtube/service.ts talks to `youtubeGet`/`paginateAll`
 * instead. Import this file only from server-side code (route handlers,
 * server actions, the sync layer); never from a Client Component.
 */

const API_BASE = "https://www.googleapis.com/youtube/v3";
const MAX_RETRIES = 3;

export class YouTubeApiError extends Error {
  status: number;
  reason?: string;
  retryable: boolean;

  constructor(message: string, status: number, reason?: string, retryable = false) {
    super(message);
    this.name = "YouTubeApiError";
    this.status = status;
    this.reason = reason;
    this.retryable = retryable;
  }
}

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error(
      "YOUTUBE_API_KEY is not configured. Add it to .env.local (server-side only -- never NEXT_PUBLIC_).",
    );
  }
  return key;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** A single YouTube API GET request, with bounded retry/backoff on transient failures. */
export async function youtubeGet<T>(
  path: string,
  params: Record<string, string>,
  attempt = 1,
): Promise<T> {
  const url = new URL(`${API_BASE}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("key", getApiKey());

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (response.ok) {
    return (await response.json()) as T;
  }

  const body = await response.json().catch(() => null);
  const reason: string | undefined = body?.error?.errors?.[0]?.reason;
  const message: string = body?.error?.message ?? `YouTube API request failed (${response.status})`;

  // 403/quotaExceeded and 400s are not retryable; 429 and 5xx usually are.
  const retryable = response.status === 429 || response.status >= 500;

  if (retryable && attempt < MAX_RETRIES) {
    await sleep(300 * 2 ** (attempt - 1));
    return youtubeGet<T>(path, params, attempt + 1);
  }

  throw new YouTubeApiError(message, response.status, reason, retryable);
}

type PageShape<T> = { items?: T[]; nextPageToken?: string };

/**
 * Drives a paginated YouTube list endpoint to completion -- callers never
 * assume a single page. Stops only when the API stops returning a
 * `nextPageToken`, so a channel with thousands of uploads is still fully
 * discovered.
 */
export async function paginateAll<T>(
  fetchPage: (pageToken?: string) => Promise<PageShape<T>>,
): Promise<T[]> {
  const results: T[] = [];
  let pageToken: string | undefined;

  do {
    const page = await fetchPage(pageToken);
    if (page.items) results.push(...page.items);
    pageToken = page.nextPageToken;
  } while (pageToken);

  return results;
}

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
