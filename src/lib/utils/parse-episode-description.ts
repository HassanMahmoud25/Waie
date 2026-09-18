/**
 * Turns a raw YouTube episode description (plain text, occasionally with a
 * `[label](url)` markdown link) into a structured block list a component can
 * render as paragraphs, inline links, hashtag chips and grouped link rows --
 * without rewriting, reordering across the whole text, or dropping any of
 * the original wording. Structure is only ever inferred from lines that are
 * already adjacent in the source text, never assumed.
 */

export type DescriptionLinkCategory = "support" | "listen" | "social" | "contact" | "other";

export type DescriptionSegment =
  | { kind: "text"; value: string }
  | { kind: "link"; href: string; text: string }
  | { kind: "hashtag"; tag: string };

export interface DescriptionLinkItem {
  href: string;
  label: string;
  secondary: string;
  category: DescriptionLinkCategory;
}

export type DescriptionLinkEntry = { kind: "heading"; text: string } | { kind: "item"; item: DescriptionLinkItem };

export type DescriptionBlock =
  | { kind: "paragraph"; lines: DescriptionSegment[][] }
  | { kind: "links"; entries: DescriptionLinkEntry[] }
  | { kind: "hashtags"; tags: string[] };

const ALLOWED_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

const TOKEN_RE =
  /\[([^\]\n]{1,120})\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|tel:[^\s)]+)\)|(https?:\/\/[^\s<>"'()]+|www\.[^\s<>"'()]+)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|#([\p{L}\p{N}_]+)/gu;

const TRAILING_PUNCT = new Set([".", ",", ";", ":", "!", "?", ")", "]", "}", "»", '"', "'", "،", "؛", "؟"]);

const SUPPORT_HOSTS = ["patreon.com", "buymeacoffee.com", "ko-fi.com", "opencollective.com", "paypal.com", "paypal.me", "gofundme.com"];
const LISTEN_HOSTS = ["soundcloud.com", "spotify.com", "anchor.fm", "podcasts.apple.com", "music.apple.com", "anghami.com", "castbox.fm", "deezer.com"];
const SOCIAL_HOSTS = [
  "facebook.com",
  "fb.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "snapchat.com",
  "linkedin.com",
  "threads.net",
  "t.me",
  "telegram.me",
  "youtube.com",
  "youtu.be",
];

const CONTACT_KEYWORDS = ["تواصل", "اعلان", "إعلان", "contact", "تعاون", "business", "اتصل"];
const SUPPORT_KEYWORDS = ["دعم", "ادعم", "support", "تبرع", "donate"];
const LISTEN_KEYWORDS = ["اسمع", "استمع", "شاهد", "listen", "watch", "تفرج"];
const SOCIAL_KEYWORDS = ["سوشيال", "تابع", "social", "follow"];

const CATEGORY_HEADINGS: Partial<Record<DescriptionLinkCategory, string>> = {
  support: "ادعم البودكاست",
  listen: "استمع من هنا",
  social: "تابعنا على السوشيال ميديا",
  contact: "للتواصل",
};

const DISPLAY_NAMES: Record<string, string> = {
  "patreon.com": "Patreon",
  "buymeacoffee.com": "Buy Me a Coffee",
  "ko-fi.com": "Ko-fi",
  "paypal.com": "PayPal",
  "paypal.me": "PayPal",
  "gofundme.com": "GoFundMe",
  "opencollective.com": "Open Collective",
  "soundcloud.com": "SoundCloud",
  "spotify.com": "Spotify",
  "anchor.fm": "Anchor",
  "podcasts.apple.com": "Apple Podcasts",
  "music.apple.com": "Apple Music",
  "anghami.com": "Anghami",
  "castbox.fm": "Castbox",
  "deezer.com": "Deezer",
  "facebook.com": "Facebook",
  "fb.com": "Facebook",
  "instagram.com": "Instagram",
  "twitter.com": "Twitter",
  "x.com": "X",
  "tiktok.com": "TikTok",
  "snapchat.com": "Snapchat",
  "linkedin.com": "LinkedIn",
  "threads.net": "Threads",
  "t.me": "Telegram",
  "telegram.me": "Telegram",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
};

function normalizeHref(raw: string): string | null {
  const href = /^www\./i.test(raw) ? `https://${raw}` : raw;
  try {
    const url = new URL(href);
    if (!ALLOWED_SCHEMES.has(url.protocol)) return null;
    return href;
  } catch {
    return null;
  }
}

function getHostname(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./i, "");
  } catch {
    return href.replace(/^mailto:/, "").replace(/^tel:/, "");
  }
}

function trimTrailingPunctuation(value: string): { clean: string; trailingLen: number } {
  let end = value.length;
  while (end > 0 && TRAILING_PUNCT.has(value[end - 1])) end--;
  return { clean: value.slice(0, end), trailingLen: value.length - end };
}

function tokenizeLine(line: string): DescriptionSegment[] {
  const segments: DescriptionSegment[] = [];
  let lastIndex = 0;
  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(line))) {
    const index = match.index;
    if (index > lastIndex) segments.push({ kind: "text", value: line.slice(lastIndex, index) });

    if (match[1] !== undefined && match[2] !== undefined) {
      const href = normalizeHref(match[2]);
      segments.push(href ? { kind: "link", href, text: match[1] } : { kind: "text", value: match[0] });
      lastIndex = index + match[0].length;
    } else if (match[3]) {
      const { clean, trailingLen } = trimTrailingPunctuation(match[3]);
      const href = normalizeHref(clean);
      segments.push(href ? { kind: "link", href, text: clean } : { kind: "text", value: clean });
      lastIndex = index + match[0].length - trailingLen;
    } else if (match[4]) {
      const href = normalizeHref(`mailto:${match[4]}`);
      segments.push(href ? { kind: "link", href, text: match[4] } : { kind: "text", value: match[4] });
      lastIndex = index + match[0].length;
    } else if (match[5]) {
      segments.push({ kind: "hashtag", tag: match[5] });
      lastIndex = index + match[0].length;
    }

    if (TOKEN_RE.lastIndex === index) TOKEN_RE.lastIndex++;
  }
  if (lastIndex < line.length) segments.push({ kind: "text", value: line.slice(lastIndex) });
  return segments;
}

function segmentToText(segment: DescriptionSegment): string {
  if (segment.kind === "text") return segment.value;
  if (segment.kind === "hashtag") return `#${segment.tag}`;
  return segment.text;
}

function cleanLabel(text: string): string {
  return text.replace(/[\s:：\-–—]+$/u, "").trim();
}

function detectCategory(href: string, hint: string): DescriptionLinkCategory {
  const lowerHint = hint.toLowerCase();
  if (href.startsWith("mailto:") || href.startsWith("tel:") || CONTACT_KEYWORDS.some((k) => lowerHint.includes(k))) {
    return "contact";
  }
  if (SUPPORT_KEYWORDS.some((k) => lowerHint.includes(k))) return "support";
  if (LISTEN_KEYWORDS.some((k) => lowerHint.includes(k))) return "listen";
  if (SOCIAL_KEYWORDS.some((k) => lowerHint.includes(k))) return "social";

  const host = getHostname(href);
  const hostMatches = (hosts: string[]) => hosts.some((h) => host === h || host.endsWith(`.${h}`));
  if (hostMatches(SUPPORT_HOSTS)) return "support";
  if (hostMatches(LISTEN_HOSTS)) return "listen";
  if (hostMatches(SOCIAL_HOSTS)) return "social";
  return "other";
}

function getDisplayName(href: string): string {
  const host = getHostname(href);
  const match = Object.keys(DISPLAY_NAMES).find((h) => host === h || host.endsWith(`.${h}`));
  return match ? DISPLAY_NAMES[match] : host;
}

/** A line that's just "label: url" (nothing meaningful after the link) reads as a clean, standalone link rather than prose. */
function extractLinkLine(rawLine: string): DescriptionLinkItem | null {
  const segments = tokenizeLine(rawLine);
  const linkIndexes = segments.reduce<number[]>((acc, s, i) => (s.kind === "link" ? [...acc, i] : acc), []);
  if (linkIndexes.length !== 1) return null;

  const linkIndex = linkIndexes[0];
  const link = segments[linkIndex] as Extract<DescriptionSegment, { kind: "link" }>;
  const before = segments.slice(0, linkIndex).map(segmentToText).join("");
  const after = segments.slice(linkIndex + 1).map(segmentToText).join("");
  if (after.trim().length > 0) return null;

  const label = cleanLabel(before);
  if (label.length > 70) return null;

  const category = detectCategory(link.href, label || link.text);
  const isContact = link.href.startsWith("mailto:") || link.href.startsWith("tel:");
  const secondary = isContact ? link.text : getHostname(link.href);

  return {
    href: link.href,
    label: label || (isContact ? link.text : getDisplayName(link.href)),
    secondary,
    category,
  };
}

/** A line that is *only* a link (nothing else on it), for pairing with a label sitting on the line above. */
function extractLoneLink(rawLine: string): Extract<DescriptionSegment, { kind: "link" }> | null {
  const segments = tokenizeLine(rawLine);
  if (segments.length !== 1 || segments[0].kind !== "link") return null;
  return segments[0];
}

/** Looks for a lone link right after a dangling label, tolerating a single blank formatting line in between (common in YouTube descriptions) but nothing further. */
function findLoneLinkAhead(
  lines: string[],
  startIndex: number,
): { link: Extract<DescriptionSegment, { kind: "link" }>; endIndex: number } | null {
  if (startIndex >= lines.length) return null;
  const direct = extractLoneLink(lines[startIndex]);
  if (direct) return { link: direct, endIndex: startIndex };

  if (lines[startIndex].trim() === "" && startIndex + 1 < lines.length) {
    const afterBlank = extractLoneLink(lines[startIndex + 1]);
    if (afterBlank) return { link: afterBlank, endIndex: startIndex + 1 };
  }
  return null;
}

/** True for a short line that's plain text ending in a colon -- e.g. "تابعنا على التليجرام:" -- signalling the link is on the next line rather than this one. */
function isDanglingLabelLine(rawLine: string): string | null {
  const trimmed = rawLine.trim();
  if (!trimmed || trimmed.length > 70 || !/[:：]\s*$/u.test(trimmed)) return null;
  const segments = tokenizeLine(trimmed);
  if (segments.some((s) => s.kind !== "text")) return null;
  const label = cleanLabel(trimmed);
  return label.length > 0 ? label : null;
}

function buildLinkEntries(items: DescriptionLinkItem[]): DescriptionLinkEntry[] {
  const entries: DescriptionLinkEntry[] = [];
  let i = 0;
  while (i < items.length) {
    let j = i + 1;
    while (j < items.length && items[j].category === items[i].category) j++;
    const run = items.slice(i, j);
    const heading = run.length > 1 ? CATEGORY_HEADINGS[run[0].category] : undefined;
    if (heading) entries.push({ kind: "heading", text: heading });
    for (const item of run) entries.push({ kind: "item", item });
    i = j;
  }
  return entries;
}

export function parseEpisodeDescription(raw: string): DescriptionBlock[] {
  const lines = raw.replace(/\r\n?/g, "\n").split("\n");

  const blocks: DescriptionBlock[] = [];
  let paragraphBuffer: DescriptionSegment[][] = [];
  let linkRun: DescriptionLinkItem[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      blocks.push({ kind: "paragraph", lines: paragraphBuffer });
      paragraphBuffer = [];
    }
  };
  const flushLinkRun = () => {
    if (linkRun.length > 0) {
      blocks.push({ kind: "links", entries: buildLinkEntries(linkRun) });
      linkRun = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushParagraph();
      flushLinkRun();
      i++;
      continue;
    }

    const words = trimmed.split(/\s+/);
    if (words.every((w) => /^#[\p{L}\p{N}_]+$/u.test(w))) {
      flushParagraph();
      flushLinkRun();
      blocks.push({ kind: "hashtags", tags: words.map((w) => w.slice(1)) });
      i++;
      continue;
    }

    // A short "label:" line immediately followed by a line that's nothing
    // but a URL -- the same "label: url" shape as extractLinkLine, just
    // split across two physical lines instead of one.
    const danglingLabel = isDanglingLabelLine(rawLine);
    const lookahead = danglingLabel ? findLoneLinkAhead(lines, i + 1) : null;
    if (danglingLabel && lookahead) {
      flushParagraph();
      const { link } = lookahead;
      const isContact = link.href.startsWith("mailto:") || link.href.startsWith("tel:");
      linkRun.push({
        href: link.href,
        label: danglingLabel,
        secondary: isContact ? link.text : getHostname(link.href),
        category: detectCategory(link.href, danglingLabel),
      });
      i = lookahead.endIndex + 1;
      continue;
    }

    const linkItem = extractLinkLine(rawLine);
    if (linkItem) {
      flushParagraph();
      linkRun.push(linkItem);
      i++;
      continue;
    }

    flushLinkRun();
    paragraphBuffer.push(tokenizeLine(rawLine));
    i++;
  }
  flushParagraph();
  flushLinkRun();

  return blocks;
}
