import type { Metadata } from "next";
import {
  IBM_Plex_Sans_Arabic,
  Cairo,
  Noto_Naskh_Arabic,
} from "next/font/google";
import { siteConfig } from "@/config/site";
import { bootInlineScript } from "@/lib/boot/config";
import { BootOverlay } from "@/components/boot/boot-overlay";
import { GlobalPlayer } from "@/components/media/global-player";
import "./globals.css";

/**
 * Content comes from Postgres, so render on request instead of querying the
 * database during `next build` (an unreachable/slow DB would hang the deploy).
 */
export const dynamic = "force-dynamic";

/** UI, navigation, body copy, metadata — the everyday reading face. */
const bodyFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

/**
 * Display, H1/H2 — confident, editorial headlines. Cairo reads contemporary
 * and premium rather than monumental/inscriptional (Kufi-style faces tend
 * to read as formal/governmental in Arabic contexts) — a deliberate choice
 * to move the whole product away from that "official portal" feeling.
 */
const displayFont = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

/** Long-form reading only (episode transcripts) — a traditional Naskh serif. */
const readingFont = Noto_Naskh_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-reading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "ar_AR",
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    // og:image comes from app/opengraph-image.png (and twitter:image from
    // app/twitter-image.png): Next emits absolute, content-hashed URLs from
    // metadataBase, so scrapers re-fetch when the artwork changes.
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the boot script below sets `data-boot` on
    // <html> before React hydrates, which React would otherwise flag as an
    // attribute the server didn't render.
    <html
      lang="ar"
      dir="rtl"
      className={`${bodyFont.variable} ${displayFont.variable} ${readingFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootInlineScript }} />
      </head>
      <body className="header-glow">
        <BootOverlay />
        {children}
        {/* Outside every route group so playback and its controls survive navigation between them. */}
        <GlobalPlayer />
      </body>
    </html>
  );
}
