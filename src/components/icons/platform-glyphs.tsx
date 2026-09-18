/**
 * Generic, hand-drawn platform glyphs -- deliberately *not* the trademarked
 * logos, same spirit as the footer's original YouTube mark. Each one reads
 * as "video / cloud-audio / social post / photo" at a glance rather than
 * tracing a specific brand's artwork, so the recommendations grid can hint
 * at a platform without reproducing its logo.
 */

type GlyphProps = { size?: number; className?: string };

/** A rounded video-player frame with a play triangle. */
export function YoutubeGlyph({ size = 20, className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className} aria-hidden="true">
      <rect x="1.75" y="5.25" width="20.5" height="13.5" rx="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.1 9.15v5.7l5.1-2.85-5.1-2.85Z" fill="currentColor" />
    </svg>
  );
}

/** A cloud outline with waveform bars rising from its base. */
export function SoundcloudGlyph({ size = 20, className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className} aria-hidden="true">
      <path
        d="M6.5 16.5h10.75A3.75 3.75 0 0 0 20.5 12.9a3.6 3.6 0 0 0-2.68-3.48 4.75 4.75 0 0 0-9.2-1.02A3.5 3.5 0 0 0 4 11.25c0 .3.03.58.09.86A3.25 3.25 0 0 0 6.5 16.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8 13.5v2M10.35 12v3.5M12.7 11v4.5M15.05 12v3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A profile card -- face and two text lines -- standing in for a social-network post. */
export function FacebookGlyph({ size = 20, className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="3.5" width="19" height="17" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.75" cy="10.25" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 16.25c.55-2 2-3 3.25-3s2.7 1 3.25 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14.5 8.75h4M14.5 12h4M14.5 15.25h2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** The universal photo-placeholder mark (frame, sun, mountains) -- a generic stand-in for a visual/photo post. */
export function InstagramGlyph({ size = 20, className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="4" width="19" height="16" rx="3.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.25" cy="10" r="1.35" fill="currentColor" />
      <path
        d="M3.25 16.75 8 12.25a1.6 1.6 0 0 1 2.2-.05l2.55 2.35a1.6 1.6 0 0 0 2.2-.03l1.55-1.5a1.6 1.6 0 0 1 2.23 0l2.02 1.98"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
