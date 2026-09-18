import { Search } from "lucide-react";

/** Plain GET form — works without JavaScript, and /search reads `q` server-side. */
export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form
      action="/search"
      role="search"
      className="glass mt-8 flex max-w-2xl items-stretch gap-1.5 rounded-full p-1.5 sm:p-2"
    >
      <label htmlFor="search-input" className="sr-only">
        ابحث في وعي
      </label>
      <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full bg-white/45 px-4">
        <Search size={19} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
        <input
          id="search-input"
          name="q"
          defaultValue={defaultValue}
          placeholder="ابحث عن صحابي، فكرة، أو حلقة..."
          className="w-full min-w-0 bg-transparent py-3 text-[.95rem] font-bold outline-none placeholder:font-normal placeholder:text-[var(--muted)] sm:text-base"
        />
      </div>
      <button className="btn btn-ink shrink-0 rounded-full px-5 sm:px-7" type="submit">
        <Search size={16} /> <span className="hidden sm:inline">بحث</span>
      </button>
    </form>
  );
}
