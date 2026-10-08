import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }] },
  experimental: {
    // Every page renders on request (force-dynamic in app/layout.tsx), and
    // Next 15 keeps dynamic pages in the client Router Cache for 0s by
    // default -- so each navigation re-ran every query and re-showed the
    // route's loading.tsx, even straight back to a page just seen. Revisits
    // within this window render instantly from the cache. Mutations still
    // purge it (revalidatePath / cookie changes in Server Actions), and
    // components/shared/router-cache-freshness.tsx bounds how stale it can
    // get, since Next extends the window on every reuse. Keep `dynamic` equal
    // to ROUTER_CACHE_MAX_AGE_MS there.
    staleTimes: { dynamic: 900, static: 300 },
  },
};

export default nextConfig;
