"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

const DEBOUNCE_MS = 300;

/**
 * Debounced, URL-driven (`?q=`) search box for the admin episodes list.
 * Preserves whatever other params (e.g. `?status=`) are already in the URL.
 */
export function EpisodeSearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === defaultValue.trim()) return;

    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      const query = params.toString();
      startTransition(() => {
        router.push(query ? `/admin/episodes?${query}` : "/admin/episodes");
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
    // Only the debounced value should re-trigger this -- searchParams/router/defaultValue
    // changing mid-typing (e.g. from our own push) must not cancel the pending debounce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function clear() {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/admin/episodes?${query}` : "/admin/episodes");
    });
  }

  return (
    <div className="relative">
      <label htmlFor="episodeSearch" className="sr-only">
        ابحث عن حلقة
      </label>
      <Search
        size={17}
        className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        aria-hidden="true"
      />
      <input
        id="episodeSearch"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="ابحث بالعنوان، أو الرابط المختصر، أو رقم الحلقة..."
        className="admin-field ps-11 pe-11"
      />
      {isPending ? (
        <Loader2
          size={16}
          className="absolute end-4 top-1/2 -translate-y-1/2 animate-spin text-[var(--muted)]"
          aria-hidden="true"
        />
      ) : value ? (
        <button
          type="button"
          onClick={clear}
          className="absolute end-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[var(--glass-light-strong)] hover:text-[var(--ink)]"
          aria-label="مسح البحث"
        >
          <X size={15} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
