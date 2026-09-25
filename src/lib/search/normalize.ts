/**
 * Arabic-aware, script-tolerant text normalization for search matching (used
 * by contentRepository.search() -- see prisma-content-repository.ts). Kept
 * separate from lib/audio/podcast-feed.ts's normalizeTitle, which is tuned
 * for exact-key title matching and strips every space/punctuation mark; this
 * one preserves word boundaries (as single spaces) so substring/prefix
 * search over multi-word text stays meaningful.
 */

const ARABIC_INDIC_DIGITS = /[٠-٩۰-۹]/g;

/** Arabic-Indic (٠-٩) and Extended Arabic-Indic (۰-۹) digits -> ASCII 0-9. Every other character passes through unchanged. */
export function toAsciiDigits(value: string): string {
  return value.replace(ARABIC_INDIC_DIGITS, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code - (code >= 0x06f0 ? 0x06f0 : 0x0660));
  });
}

/** Tashkeel/diacritics (fatha..sukun, tanwin, superscript alef) plus tatweel. */
const DIACRITICS_AND_TATWEEL = /[ً-ٰٟـ]/g;

/**
 * Full search-normalization pass: digit script, diacritics, common Arabic
 * orthographic variants (hamza forms, alef maksura, taa marbuta), case, and
 * punctuation/whitespace -- so "١٢", "ابن", "أحمد" and their common spelling
 * variants compare equal to their ASCII/unvocalized/alternate-letter forms.
 */
export function normalizeSearchText(value: string): string {
  return toAsciiDigits(value.normalize("NFKC"))
    .replace(DIACRITICS_AND_TATWEEL, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
