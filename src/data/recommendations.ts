import type { Recommendation } from "@/types/recommendation";

/**
 * Mock "التوصيات" content for `ep-107` (سلسلة الصحابة | أبو عبيدة بن الجراح),
 * covering every recommendation type the redesigned tab supports -- used to
 * evaluate the card grid with realistic, varied content until real
 * per-episode recommendations are extracted and an editor takes over. URLs
 * are placeholders; nothing here should be treated as a real citation.
 *
 * Real recommendations require actually watching and annotating each
 * episode -- not something derivable from YouTube's public metadata. This
 * file stays mock-only; production rows come from the admin (or an
 * extraction pipeline) into the `Recommendation` table.
 */
export const recommendations: Recommendation[] = [
  {
    id: "rec-1",
    episodeId: "ep-107",
    type: "YOUTUBE",
    title: "لماذا لُقّب أبو عبيدة بـ«أمين هذه الأمة»؟",
    description: "",
    reason: "شرح لحديث «أمين هذه الأمة» وسياقه، وهو المحور الذي تبني عليه الحلقة.",
    source: "قناة تعليمية",
    imageUrl: "https://i.ytimg.com/vi/V8iZ3uTnS70/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=example00001",
    timestampSeconds: 245,
    order: 1,
  },
  {
    id: "rec-2",
    episodeId: "ep-111",
    type: "SOUNDCLOUD",
    title: "خطبة: القيادة بالتواضع",
    description: "",
    reason: "مقطع صوتي قصير يتناول نفس المعنى الذي تطرقت له الحلقة عن قيادة أبي عبيدة.",
    source: "مقاطع صوتية دعوية",
    url: "https://soundcloud.com/example-audio/humble-leadership-clip",
    metadata: { duration: "12 دقيقة" },
    order: 2,
  },
  {
    id: "rec-3",
    episodeId: "ep-110",
    type: "BOOK",
    title: "صور من حياة الصحابة",
    description: "",
    reason: "كتاب يجمع سِيَر عدد من الصحابة بأسلوب قصصي مبسّط، ومنهم أبو عبيدة بن الجراح.",
    author: "عبدالرحمن رأفت الباشا",
    imageUrl: "/series/companions.png",
    url: "https://example.com/books/seer-al-sahaba",
    order: 3,
  },
  {
    id: "rec-4",
    episodeId: "ep-109",
    type: "WEBSITE",
    title: "أبو عبيدة بن الجراح في كتب السيرة",
    description: "",
    reason: "مقالة تجمع الروايات الواردة عن الصحابي وسياقها التاريخي.",
    source: "موسوعة السيرة والتاريخ الإسلامي",
    url: "https://example.com/articles/abu-ubaidah",
    metadata: { readTime: "6 دقائق قراءة" },
    order: 4,
  },
  {
    id: "rec-5",
    episodeId: "ep-108",
    type: "FACEBOOK",
    title: "منشور: قصة طاعون عمواس ووفاة أبي عبيدة",
    description: "",
    reason: "منشور يوثّق أحداث طاعون عمواس الذي ذكرته الحلقة في سياق وفاة أبي عبيدة.",
    source: "صفحة وعي",
    url: "https://facebook.com/example.page/posts/000000",
    order: 5,
  },
  {
    id: "rec-6",
    episodeId: "ep-107",
    type: "INSTAGRAM",
    title: "مقتطف مرئي من الحلقة",
    description: "",
    reason: "مقطع قصير من الحلقة بصياغة مناسبة للمشاركة السريعة.",
    source: "حساب وعي",
    url: "https://instagram.com/p/CExample000/",
    timestampSeconds: 1830,
    order: 6,
  },
  {
    id: "rec-7",
    episodeId: "ep-106",
    type: "PODCAST",
    title: "حلقة: القيادة والأمانة في زمن الأزمات",
    description: "",
    reason: "حلقة من بودكاست آخر تتناول القيادة بالأمانة من زاوية مختلفة.",
    source: "بودكاست آخر",
    url: "https://podcasts.example.com/trustworthy-leadership-episode",
    metadata: { duration: "34 دقيقة" },
    order: 7,
  },
  {
    id: "rec-8",
    episodeId: "ep-105",
    type: "EXTERNAL",
    title: "معركة اليرموك: ملخص تاريخي",
    description: "",
    reason: "رابط مرجعي لمن أراد التوسّع في سياق المعركة التي قادها أبو عبيدة.",
    source: "موقع مرجعي",
    url: "https://example.com/history/yarmouk",
    order: 8,
  },
];
