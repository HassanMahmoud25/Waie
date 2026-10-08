import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Nothing here is meant to be framed by another site (clickjacking on /admin, login).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // The browser default, made explicit: YouTube embeds need the origin as referrer.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  images: { remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }] },
  experimental: {
    // Every page renders on request (force-dynamic in app/layout.tsx), and
    // Next 15 keeps dynamic pages in the client Router Cache for 0s by
    // default -- so each navigation re-ran every query and re-showed the
    // route's loading.tsx, even straight back to a page just seen. Revisits
    // within this window render instantly from the cache. An entry expires
    // this long after it was first shown (reuse doesn't extend it), and
    // mutations purge the whole cache early (revalidatePath / cookie changes
    // in Server Actions). components/shared/router-cache-freshness.tsx adds a
    // background refresh on the same cadence. Keep `dynamic` equal to
    // ROUTER_CACHE_MAX_AGE_MS there.
    staleTimes: { dynamic: 900, static: 300 },
  },
};

export default nextConfig;
