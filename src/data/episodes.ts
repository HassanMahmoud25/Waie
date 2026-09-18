import type { Episode } from "@/types/episode";

const thumbnail = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

/**
 * Real content imported from the official Waie YouTube channel
 * (https://www.youtube.com/@Waie). Extracted from the channel's public
 * Videos tab and its playlists (no YouTube API key was available for this
 * import, so data was read directly from the public pages/embedded page
 * data -- see the import summary for exact method and any caveats).
 *
 * - All 91 long-form videos public on the channel at import time.
 * - `description` is the real per-video description; most videos reuse the
 *   channel's own boilerplate text verbatim -- that is not a scraping
 *   artifact, the channel genuinely does not write unique descriptions for
 *   most uploads. Left as `""` for the handful of videos with none.
 * - `episodeNumber` is parsed from the title ("وعي ١٠٨ | ...") and is `null`
 *   for the one video with no episode number in its title.
 * - `seriesId`/`topicIds` are only set where the video is actually a member
 *   of one of the channel's 5 named playlists -- episodes outside any named
 *   playlist intentionally have `seriesId: ""` / `topicIds: []` rather than
 *   being force-fit into a series that doesn't reflect the channel's own
 *   organization.
 *
 * A 6th series, "الموسم الأول" (`series-season-one`), was added later: its
 * 22 episodes live on a different channel entirely (see the block comment
 * right before them, below) so they're appended after the @Waie videos
 * above rather than interleaved into the numbering/import-order those
 * follow. That brings the file to 113 episodes across 6 series total.
 */
export const episodes: Episode[] = [
  {
    id: "ep-111",
    slug: "waie-111",
    title: "وعي ١١١ | سلسلة الصحابة | عبدالله بن أم مكتوم رضي الله عنه",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "FAItItkSuVU",
    thumbnailUrl: thumbnail("FAItItkSuVU"),
    episodeNumber: 111,
    durationSeconds: 3941,
    publishedAt: new Date("2026-08-21T05:22:56-07:00"),
    status: "PUBLISHED",
    featured: true,
    seriesId: "series-companions",
    topicIds: ["topic-companions"],
  },
  {
    id: "ep-110",
    slug: "waie-110",
    title: "وعي ١١٠ | سلسلة الصحابة | السيدة فاطمة رضي الله عنها",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "V8iZ3uTnS70",
    thumbnailUrl: thumbnail("V8iZ3uTnS70"),
    episodeNumber: 110,
    durationSeconds: 4587,
    publishedAt: new Date("2026-07-24T06:51:18-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-companions",
    topicIds: ["topic-companions"],
  },
  {
    id: "ep-109",
    slug: "waie-109",
    title: "وعي ١٠٩ | سلسة الصحابة | طلحة بن عبيد الله رضي الله عنه",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "XQE91wxNAhU",
    thumbnailUrl: thumbnail("XQE91wxNAhU"),
    episodeNumber: 109,
    durationSeconds: 4079,
    publishedAt: new Date("2026-07-03T05:53:22-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-companions",
    topicIds: ["topic-companions"],
  },
  {
    id: "ep-108",
    slug: "waie-108",
    title: "وعي ١٠٨ | سلسلة الصحابة | الزبير بن العوام رضي الله عنه",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "MM1xqf5KiEM",
    thumbnailUrl: thumbnail("MM1xqf5KiEM"),
    episodeNumber: 108,
    durationSeconds: 4300,
    publishedAt: new Date("2026-06-19T03:08:56-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-companions",
    topicIds: ["topic-companions"],
  },
  {
    id: "ep-107",
    slug: "waie-107",
    title: "وعي ١٠٧ | سلسلة الصحابة | أبو عبيدة بن الجراح رضي الله عنه",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "6Y_mldxwNqo",
    thumbnailUrl: thumbnail("6Y_mldxwNqo"),
    episodeNumber: 107,
    durationSeconds: 5081,
    publishedAt: new Date("2026-05-22T05:27:03-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-companions",
    topicIds: ["topic-companions"],
  },
  {
    id: "ep-106",
    slug: "waie-106",
    title: "وعي ١٠٦ | سلسلة الصحابة | أُمُّ سُلَيْم رضي الله عنها",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "fGfozaBEUTU",
    thumbnailUrl: thumbnail("fGfozaBEUTU"),
    episodeNumber: 106,
    durationSeconds: 6235,
    publishedAt: new Date("2026-05-08T03:46:11-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-companions",
    topicIds: ["topic-companions"],
  },
  {
    id: "ep-105",
    slug: "waie-105",
    title: "وعي ١٠٥ | سلسلة الصحابة | أبو هريرة رضي الله عنه",
    description: "",
    youtubeVideoId: "hxymOgzwxzY",
    thumbnailUrl: thumbnail("hxymOgzwxzY"),
    episodeNumber: 105,
    durationSeconds: 5790,
    publishedAt: new Date("2026-04-24T04:20:27-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-companions",
    topicIds: ["topic-companions"],
  },
  {
    id: "ep-104",
    slug: "waie-104",
    title: "وعي ١٠٤ | سلسلة الصحابة | عبدالله بن مسعود رضي الله عنه",
    description: "",
    youtubeVideoId: "j5qOrqnDHyw",
    thumbnailUrl: thumbnail("j5qOrqnDHyw"),
    episodeNumber: 104,
    durationSeconds: 6540,
    publishedAt: new Date("2026-04-10T04:23:25-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-companions",
    topicIds: ["topic-companions"],
  },
  {
    id: "ep-103",
    slug: "waie-103",
    title: "وعي ١٠٣ | آخر رمضان",
    description: "",
    youtubeVideoId: "B9ysqlrrBwY",
    thumbnailUrl: thumbnail("B9ysqlrrBwY"),
    episodeNumber: 103,
    durationSeconds: 5229,
    publishedAt: new Date("2026-01-30T10:55:01-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-worship-seasons",
    topicIds: ["topic-worship-seasons"],
  },
  {
    id: "ep-102",
    slug: "waie-102",
    title: "وعي ١٠٢ | قصة التائب الصادق",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "leMPPBecQXM",
    thumbnailUrl: thumbnail("leMPPBecQXM"),
    episodeNumber: 102,
    durationSeconds: 5384,
    publishedAt: new Date("2026-01-02T03:22:03-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-101",
    slug: "waie-101",
    title: "وعي ١٠١ | نصيحة الى صانعي المحتوي",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "lx_SEKtGS6A",
    thumbnailUrl: thumbnail("lx_SEKtGS6A"),
    episodeNumber: 101,
    durationSeconds: 4948,
    publishedAt: new Date("2025-12-26T02:55:20-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-100",
    slug: "waie-100",
    title: "وعي ١٠٠ | السوشيال ميديا",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "WbkDwJgbe_w",
    thumbnailUrl: thumbnail("WbkDwJgbe_w"),
    episodeNumber: 100,
    durationSeconds: 6712,
    publishedAt: new Date("2025-12-19T06:22:40-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-99",
    slug: "waie-99",
    title: "وعي ٩٩ | خواطر من رحلة العمرة وتذكرة بصلاة الفجر",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "z0YTqJYkBgQ",
    thumbnailUrl: thumbnail("z0YTqJYkBgQ"),
    episodeNumber: 99,
    durationSeconds: 5260,
    publishedAt: new Date("2025-12-05T03:43:28-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-98",
    slug: "waie-98",
    title: "وعي ٩٨ | عودة وعي وشكلها الجديد",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "1ujt8svksqc",
    thumbnailUrl: thumbnail("1ujt8svksqc"),
    episodeNumber: 98,
    durationSeconds: 5195,
    publishedAt: new Date("2025-11-21T02:26:47-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-97",
    slug: "waie-97",
    title: "وعي ٩٧ - حفظ المجتمع والأسرة من خلال القرآن",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "b6bm2x1CDs8",
    thumbnailUrl: thumbnail("b6bm2x1CDs8"),
    episodeNumber: 97,
    durationSeconds: 7493,
    publishedAt: new Date("2025-08-15T11:14:38-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-96",
    slug: "waie-96",
    title: "وعي ٩٦ | مفاهيم عن المصيف، الترفيه، العبودية والتقوى.",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "f26X4qvz7E8",
    thumbnailUrl: thumbnail("f26X4qvz7E8"),
    episodeNumber: 96,
    durationSeconds: 8970,
    publishedAt: new Date("2025-07-25T02:55:58-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-95",
    slug: "waie-95",
    title: "وعي ٩٥ | ازاي المسلم يسافر صح",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "LkFPY261RiU",
    thumbnailUrl: thumbnail("LkFPY261RiU"),
    episodeNumber: 95,
    durationSeconds: 4787,
    publishedAt: new Date("2025-07-11T02:46:13-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-94",
    slug: "waie-94",
    title: "وعي ٩٤ | السر وراء يوم عرفة وعلاقته بالدعاء",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "ZSo0_0zxYHQ",
    thumbnailUrl: thumbnail("ZSo0_0zxYHQ"),
    episodeNumber: 94,
    durationSeconds: 5816,
    publishedAt: new Date("2025-06-02T10:44:37-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-worship-seasons",
    topicIds: ["topic-worship-seasons"],
  },
  {
    id: "ep-93",
    slug: "waie-93",
    title: "وعي ٩٣ | هل السُنّة مهمة، وإيه أثرها في حياتي؟",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "pcfZvfBdqtI",
    thumbnailUrl: thumbnail("pcfZvfBdqtI"),
    episodeNumber: 93,
    durationSeconds: 4774,
    publishedAt: new Date("2025-05-16T04:47:08-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-92",
    slug: "waie-92",
    title: "وعي ٩٢ | مكمل ازاي بعد رمضان؟",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "oNMPiHXoKQE",
    thumbnailUrl: thumbnail("oNMPiHXoKQE"),
    episodeNumber: 92,
    durationSeconds: 5969,
    publishedAt: new Date("2025-05-04T04:01:52-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-worship-seasons",
    topicIds: ["topic-worship-seasons"],
  },
  {
    id: "ep-91",
    slug: "waie-91",
    title: "وعي ٩١ | رمضان سؤال وجواب ٢",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "PB2aGWhRIOU",
    thumbnailUrl: thumbnail("PB2aGWhRIOU"),
    episodeNumber: 91,
    durationSeconds: 5430,
    publishedAt: new Date("2025-02-28T04:38:24-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-worship-seasons",
    topicIds: ["topic-worship-seasons"],
  },
  {
    id: "ep-90",
    slug: "waie-90",
    title: "وعي ٩٠ | رمضان سؤال وجواب ١",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "3XvnTZX7hV8",
    thumbnailUrl: thumbnail("3XvnTZX7hV8"),
    episodeNumber: 90,
    durationSeconds: 5120,
    publishedAt: new Date("2025-02-21T03:02:43-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-worship-seasons",
    topicIds: ["topic-worship-seasons"],
  },
  {
    id: "ep-89",
    slug: "waie-89",
    title: "وعي ٨٩ | فهم اوسع عن حقيقة الرزق - الرزق ١",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "DInXGEheBWo",
    thumbnailUrl: thumbnail("DInXGEheBWo"),
    episodeNumber: 89,
    durationSeconds: 6079,
    publishedAt: new Date("2025-01-31T04:12:55-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-88",
    slug: "waie-88",
    title: "وعي ٨٨ | هكسب ايه لو التزمت؟ - التدين و الالتزام ٤",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "zS1z_tXZyoc",
    thumbnailUrl: thumbnail("zS1z_tXZyoc"),
    episodeNumber: 88,
    durationSeconds: 6754,
    publishedAt: new Date("2025-01-24T04:02:28-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-commitment",
    topicIds: ["topic-commitment"],
  },
  {
    id: "ep-87",
    slug: "waie-87",
    title: "وعي ٨٧ | ازاي أمشي في طريق التدين - التدين و الالتزام ٣",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "fyKUvc6XkzA",
    thumbnailUrl: thumbnail("fyKUvc6XkzA"),
    episodeNumber: 87,
    durationSeconds: 6891,
    publishedAt: new Date("2025-01-10T04:35:30-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-commitment",
    topicIds: ["topic-commitment"],
  },
  {
    id: "ep-86",
    slug: "waie-86",
    title: "وعي ٨٦ | التدين مش اختيار - التدين و الالتزام ٢",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "N2I_DRBsSr8",
    thumbnailUrl: thumbnail("N2I_DRBsSr8"),
    episodeNumber: 86,
    durationSeconds: 6413,
    publishedAt: new Date("2024-12-27T05:33:42-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-commitment",
    topicIds: ["topic-commitment"],
  },
  {
    id: "ep-85",
    slug: "waie-85",
    title: "وعي ٨٥ | إيه هو التدين و يعني إيه ملتزم؟ - التدين و الالتزام ١",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "ZGyswgp9Kc8",
    thumbnailUrl: thumbnail("ZGyswgp9Kc8"),
    episodeNumber: 85,
    durationSeconds: 5481,
    publishedAt: new Date("2024-12-13T05:03:31-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-commitment",
    topicIds: ["topic-commitment"],
  },
  {
    id: "ep-84",
    slug: "waie-84",
    title: "وعي ٨٤ | أهمية القلب",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "tCPIDI1T544",
    thumbnailUrl: thumbnail("tCPIDI1T544"),
    episodeNumber: 84,
    durationSeconds: 4332,
    publishedAt: new Date("2024-11-08T02:02:52-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-83",
    slug: "waie-83",
    title: "وعي ٨٣ | دردشة ورد على الاسئلة",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "pgs31qmWciQ",
    thumbnailUrl: thumbnail("pgs31qmWciQ"),
    episodeNumber: 83,
    durationSeconds: 6200,
    publishedAt: new Date("2024-10-25T02:21:49-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-82",
    slug: "waie-82",
    title: "وعي ٨٢ | أحسن القصص | سيدنا يوسف عليه السلام ٦",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "tBM9Y1dgEJU",
    thumbnailUrl: thumbnail("tBM9Y1dgEJU"),
    episodeNumber: 82,
    durationSeconds: 6933,
    publishedAt: new Date("2024-09-20T05:56:08-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-81",
    slug: "waie-81",
    title: "وعي ٨١ | أحسن القصص | سيدنا يوسف عليه السلام ٥",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "fzo8wK-fFKs",
    thumbnailUrl: thumbnail("fzo8wK-fFKs"),
    episodeNumber: 81,
    durationSeconds: 5188,
    publishedAt: new Date("2024-08-16T03:11:49-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-80",
    slug: "waie-80",
    title: "وعي ٨٠ | أحسن القصص | سيدنا يوسف عليه السلام ٤",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "x1-On5TGS1M",
    thumbnailUrl: thumbnail("x1-On5TGS1M"),
    episodeNumber: 80,
    durationSeconds: 5143,
    publishedAt: new Date("2024-07-19T02:38:20-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-79",
    slug: "waie-79",
    title: "وعي ٧٩ | أحسن القصص | سيدنا يوسف عليه السلام ٣",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "A8pydJs-Rns",
    thumbnailUrl: thumbnail("A8pydJs-Rns"),
    episodeNumber: 79,
    durationSeconds: 5095,
    publishedAt: new Date("2024-06-07T05:45:44-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-78",
    slug: "waie-78",
    title: "وعي ٧٨ | أحسن القصص | سيدنا يوسف عليه السلام ٢",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "ztkN4WvbYy0",
    thumbnailUrl: thumbnail("ztkN4WvbYy0"),
    episodeNumber: 78,
    durationSeconds: 6426,
    publishedAt: new Date("2024-06-01T06:32:17-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-77",
    slug: "waie-77",
    title: "وعي ٧٧ | أحسن القصص | سيدنا يوسف عليه السلام ١",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "2Bs2ghPX6Vk",
    thumbnailUrl: thumbnail("2Bs2ghPX6Vk"),
    episodeNumber: 77,
    durationSeconds: 7506,
    publishedAt: new Date("2024-05-10T00:12:03-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-76",
    slug: "waie-76",
    title: "وعي ٧٦ | أحسن القصص | سيدنا إبراهيم عليه السلام ٤",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "VCJoOlftMZg",
    thumbnailUrl: thumbnail("VCJoOlftMZg"),
    episodeNumber: 76,
    durationSeconds: 7051,
    publishedAt: new Date("2024-03-08T02:30:15-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-75",
    slug: "waie-75",
    title: "وعي ٧٥ | أحسن القصص | سيدنا إبراهيم عليه السلام ٣",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "x1XX_S9N4oA",
    thumbnailUrl: thumbnail("x1XX_S9N4oA"),
    episodeNumber: 75,
    durationSeconds: 5836,
    publishedAt: new Date("2024-02-23T03:14:43-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-74",
    slug: "waie-74",
    title: "وعي ٧٤ | أحسن القصص | سيدنا إبراهيم عليه السلام ۲",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "tvGkYJ87YTo",
    thumbnailUrl: thumbnail("tvGkYJ87YTo"),
    episodeNumber: 74,
    durationSeconds: 5639,
    publishedAt: new Date("2024-02-09T03:24:54-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-73",
    slug: "waie-73",
    title: "وعي ٧۳ | أحسن القصص | سيدنا إبراهيم عليه السلام",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "pc4aUaoq5fc",
    thumbnailUrl: thumbnail("pc4aUaoq5fc"),
    episodeNumber: 73,
    durationSeconds: 5765,
    publishedAt: new Date("2024-01-26T01:27:03-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-72",
    slug: "waie-72",
    title: "وعي ٧٢ | من وحي فلسطىن :وقفات من سورة الحشر",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.\n\nقناة مصطفى خالد على تليجرام : https://t.me/mustafakhaled92",
    youtubeVideoId: "O-qf8IYLn5I",
    thumbnailUrl: thumbnail("O-qf8IYLn5I"),
    episodeNumber: 72,
    durationSeconds: 5496,
    publishedAt: new Date("2024-01-12T04:44:22-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-71",
    slug: "waie-71",
    title: "وعي ٧١ |  من وحي فلسطىن :وقفات من سورة آل عمران",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.\n\nقناة مصطفى خالد على تليجرام : https://t.me/mustafakhaled92",
    youtubeVideoId: "OUTHWsd4Pg4",
    thumbnailUrl: thumbnail("OUTHWsd4Pg4"),
    episodeNumber: 71,
    durationSeconds: 6324,
    publishedAt: new Date("2023-12-15T07:28:27-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-70",
    slug: "waie-70",
    title: "وعي ٧٠ | من وحي فلسطىن: سورة البروج",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.\n\nقناة مصطفى خالد على تليجرام : https://t.me/mustafakhaled92",
    youtubeVideoId: "zCteHZCeZ3s",
    thumbnailUrl: thumbnail("zCteHZCeZ3s"),
    episodeNumber: 70,
    durationSeconds: 5918,
    publishedAt: new Date("2023-12-01T07:00:17-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-69",
    slug: "waie-69",
    title: "وعي ٦٩ | من وحي فلسطىن: قصة أصحاب الأخدود",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "g1QFsqIALJM",
    thumbnailUrl: thumbnail("g1QFsqIALJM"),
    episodeNumber: 69,
    durationSeconds: 6388,
    publishedAt: new Date("2023-11-13T16:54:01-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-68",
    slug: "waie-68",
    title: "وعي ٦٨ I أحسن القصص I سيدنا أيوب عليه السلام",
    description: "",
    youtubeVideoId: "fPBo_6outOw",
    thumbnailUrl: thumbnail("fPBo_6outOw"),
    episodeNumber: 68,
    durationSeconds: 5247,
    publishedAt: new Date("2023-10-20T11:05:11-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-67",
    slug: "waie-67",
    title: "وعي ٦٧ | أحسن القصص | سيدنا لوط عليه السلام",
    description: "",
    youtubeVideoId: "xxFtMgKTm5U",
    thumbnailUrl: thumbnail("xxFtMgKTm5U"),
    episodeNumber: 67,
    durationSeconds: 6329,
    publishedAt: new Date("2023-10-02T08:36:34-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-66",
    slug: "waie-66",
    title: "وعي ٦٦ | أحسن القصص | صالح عليه السلام",
    description: "",
    youtubeVideoId: "UnB0CTWxq98",
    thumbnailUrl: thumbnail("UnB0CTWxq98"),
    episodeNumber: 66,
    durationSeconds: 5358,
    publishedAt: new Date("2023-09-15T09:28:13-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-65",
    slug: "waie-65",
    title: "وعي ٦٥ | أحسن القصص | سيدنا هود عليه السلام",
    description: "",
    youtubeVideoId: "wyP__uKGzfQ",
    thumbnailUrl: thumbnail("wyP__uKGzfQ"),
    episodeNumber: 65,
    durationSeconds: 5735,
    publishedAt: new Date("2023-08-26T15:04:47-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-64",
    slug: "waie-64",
    title: "وعي ٦٤ | أحسن القصص | سيدنا نوح عليه السلام ج٢",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "byp0HgspP_A",
    thumbnailUrl: thumbnail("byp0HgspP_A"),
    episodeNumber: 64,
    durationSeconds: 3737,
    publishedAt: new Date("2023-08-04T09:55:39-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-63",
    slug: "waie-63",
    title: "وعي ٦٣ | أحسن القصص | سيدنا نوح عليه السلام",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "hYy7TSLnfbw",
    thumbnailUrl: thumbnail("hYy7TSLnfbw"),
    episodeNumber: 63,
    durationSeconds: 5858,
    publishedAt: new Date("2023-07-20T15:48:54-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-62",
    slug: "waie-62",
    title: "وعي ٦٢ | أحسن القصص | توبة سيدنا آدم عليه السلام ج٢",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "hZd_IBfvTbA",
    thumbnailUrl: thumbnail("hZd_IBfvTbA"),
    episodeNumber: 62,
    durationSeconds: 6341,
    publishedAt: new Date("2023-06-27T11:11:48-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-61",
    slug: "waie-61",
    title: "وعي ٦١ | أحسن القصص | قصة آدم عليه السلام ج١",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "s31fucb5OsU",
    thumbnailUrl: thumbnail("s31fucb5OsU"),
    episodeNumber: 61,
    durationSeconds: 4476,
    publishedAt: new Date("2023-06-10T02:41:09-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-60",
    slug: "waie-60",
    title: "وعي ٦٠ | سلسلة القَصص | أهمية قصص الأنبياء",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "COzNC8WvVGI",
    thumbnailUrl: thumbnail("COzNC8WvVGI"),
    episodeNumber: 60,
    durationSeconds: 4990,
    publishedAt: new Date("2023-05-25T07:16:07-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-stories",
    topicIds: ["topic-stories"],
  },
  {
    id: "ep-59",
    slug: "waie-59",
    title: "وعي ٥٩ | سلسلة الأخلاق | صلة الأرحام",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "aw7gLYF6Ttg",
    thumbnailUrl: thumbnail("aw7gLYF6Ttg"),
    episodeNumber: 59,
    durationSeconds: 3373,
    publishedAt: new Date("2023-05-05T04:00:02-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-ethics",
    topicIds: ["topic-ethics"],
  },
  {
    id: "ep-58",
    slug: "waie-58",
    title: "وعي ٥٨ | سلسلة الأخلاق | العفة",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "i8gSQsTFsKs",
    thumbnailUrl: thumbnail("i8gSQsTFsKs"),
    episodeNumber: 58,
    durationSeconds: 6228,
    publishedAt: new Date("2023-04-17T08:16:56-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-57",
    slug: "waie-57",
    title: "وعي ٥٧ | سلسلة الأخلاق | الحياء",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "AM2V9T7830Q",
    thumbnailUrl: thumbnail("AM2V9T7830Q"),
    episodeNumber: 57,
    durationSeconds: 5038,
    publishedAt: new Date("2023-03-09T04:00:05-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-ethics",
    topicIds: ["topic-ethics"],
  },
  {
    id: "ep-56",
    slug: "waie-56",
    title: "وعي ٥٦ | قصة جريج العابد وعلاقته مع الله",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "28O79xNWoq0",
    thumbnailUrl: thumbnail("28O79xNWoq0"),
    episodeNumber: 56,
    durationSeconds: 4622,
    publishedAt: new Date("2023-02-23T08:00:02-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-55",
    slug: "waie-55",
    title: "وعي ٥٥ | رحلة سلمان الفارسي (رضي الله عنه) والدروس المستفادة من قصته المؤثرة",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "pNhhY8EjpjU",
    thumbnailUrl: thumbnail("pNhhY8EjpjU"),
    episodeNumber: 55,
    durationSeconds: 5424,
    publishedAt: new Date("2023-02-10T12:15:21-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-54",
    slug: "waie-54",
    title: "وعي ٥٤ | سلسلة الأخلاق | التواضع",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "lY7H7xK_Lz0",
    thumbnailUrl: thumbnail("lY7H7xK_Lz0"),
    episodeNumber: 54,
    durationSeconds: 4337,
    publishedAt: new Date("2023-01-19T23:49:05-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-ethics",
    topicIds: ["topic-ethics"],
  },
  {
    id: "ep-53",
    slug: "waie-53",
    title: "وعي ٥٣ | سلسلة الأخلاق | الكبر وأسبابه وخطورته ومعالجة النفس منه",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "XkMCNwxgoMc",
    thumbnailUrl: thumbnail("XkMCNwxgoMc"),
    episodeNumber: 53,
    durationSeconds: 5480,
    publishedAt: new Date("2023-01-06T03:00:29-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-ethics",
    topicIds: ["topic-ethics"],
  },
  {
    id: "ep-52",
    slug: "waie-52",
    title: "وعي ٥٢ | سلسلة الأخلاق |  المعاملات مع الجيرة والكبار والصغار والخدم واليتيم",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "svaB8OMNkKs",
    thumbnailUrl: thumbnail("svaB8OMNkKs"),
    episodeNumber: 52,
    durationSeconds: 5441,
    publishedAt: new Date("2022-12-23T04:00:35-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-ethics",
    topicIds: ["topic-ethics"],
  },
  {
    id: "ep-51",
    slug: "waie-51",
    title: "وعي ٥١ | سلسلة الاخلاق | الكرم والإيثار",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "abdhcuWoeBM",
    thumbnailUrl: thumbnail("abdhcuWoeBM"),
    episodeNumber: 51,
    durationSeconds: 5260,
    publishedAt: new Date("2022-12-04T22:00:00-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-ethics",
    topicIds: ["topic-ethics"],
  },
  {
    id: "ep-50",
    slug: "waie-50",
    title: "وعي ٥٠ | سلسلة الأخلاق | معنى الشح وضرورة فهمه والبخل والكرم",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "EdvGjyhyP50",
    thumbnailUrl: thumbnail("EdvGjyhyP50"),
    episodeNumber: 50,
    durationSeconds: 6036,
    publishedAt: new Date("2022-11-18T03:00:11-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-ethics",
    topicIds: ["topic-ethics"],
  },
  {
    id: "ep-49",
    slug: "waie-49",
    title: "وعي ٤٩ | سلسلة الأخلاق | السخرية وكبيرة الغيبة والنميمة",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "ejBW7Wtlqb4",
    thumbnailUrl: thumbnail("ejBW7Wtlqb4"),
    episodeNumber: 49,
    durationSeconds: 6094,
    publishedAt: new Date("2022-10-27T11:42:44-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-ethics",
    topicIds: ["topic-ethics"],
  },
  {
    id: "ep-48",
    slug: "waie-48",
    title: "وعي ٤٨ | سلسلة الأخلاق | الكلم الطيب والسب (الشتيمة)",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "7qH889sV1oY",
    thumbnailUrl: thumbnail("7qH889sV1oY"),
    episodeNumber: 48,
    durationSeconds: 5792,
    publishedAt: new Date("2022-10-13T14:09:10-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-ethics",
    topicIds: ["topic-ethics"],
  },
  {
    id: "ep-47",
    slug: "waie-47",
    title: "وعي ٤٧ | سلسلة الأخلاق | الحلم والغضب",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "FZbf5KM8FiA",
    thumbnailUrl: thumbnail("FZbf5KM8FiA"),
    episodeNumber: 47,
    durationSeconds: 7286,
    publishedAt: new Date("2022-09-29T06:30:22-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-ethics",
    topicIds: ["topic-ethics"],
  },
  {
    id: "ep-46",
    slug: "waie-46",
    title: "وعي ٤٦ | سلسلة الأخلاق | الصدق والكذب",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "yLyb_H7y-Ho",
    thumbnailUrl: thumbnail("yLyb_H7y-Ho"),
    episodeNumber: 46,
    durationSeconds: 6663,
    publishedAt: new Date("2022-09-15T14:19:08-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-ethics",
    topicIds: ["topic-ethics"],
  },
  {
    id: "ep-45",
    slug: "waie-45",
    title: "وعي ٤٥ | سلسة الأخلاق | مقدمة عن أهمية الأخلاق والمعاملات في الإسلام",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "zzWhkMWlIo0",
    thumbnailUrl: thumbnail("zzWhkMWlIo0"),
    episodeNumber: 45,
    durationSeconds: 3798,
    publishedAt: new Date("2022-08-25T03:38:37-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-ethics",
    topicIds: ["topic-ethics"],
  },
  {
    id: "ep-44",
    slug: "waie-44",
    title: "وعي ٤٤ | كيف نستقبل العشر من ذي الحجه واستيعاب اهميه تلك الايام والمطلوب فيها",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "RbQPSD7Gqnw",
    thumbnailUrl: thumbnail("RbQPSD7Gqnw"),
    episodeNumber: 44,
    durationSeconds: 5677,
    publishedAt: new Date("2022-06-29T12:29:16-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-worship-seasons",
    topicIds: ["topic-worship-seasons"],
  },
  {
    id: "ep-43",
    slug: "waie-43",
    title: "وعي ٤٣ | عن الشيطان ومداخله وأسلوبه في الإضلال والتزيين وماذا يقول القرءان في التعامل معه",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.\n\n\n\n\n\n\n\n0:00 مقدمة: ليه هنتكلم عن \"الشيطان\"؟\n\n11:38 مفهوم الاستقامة في حياتك.\n\n16:00 كثرة ذكر الشيطان في القرآن دليل على حجمه الحقيقي في حياتنا.\n\n 24:00 ما هي فتنة الممات؟\n\n25:50 إدراك العلاقة بينك وبين الشيطان، الشيطان معاك من أول ما اتولدت لحد الممات.\nالشيطان عارفك كويس.\n\n33:20 ايه هو هدف الشيطان منك؟ إنك تخلد في النار أيا كان الطريق!\n\n39:20 مشهد النهاية: اعتراف الشيطان أمام كل من خدعهم \"أولياءه\".\n\n52:55 مشاهد بداية الخلق ومدى كره الشيطان للإنسان.\n\n1:00:18 ملخص الساعة الأولى والرؤية الصحيحة للشيطان، ومثال نظرة سيدنا يوسف للشيطان.\n\n1:03:50 ازاي اوازن المعادلة دي؟ \"وَخُلِقَ الْإِنْسَانُ ضَعِيفًا\"، \"إِنَّ كَيْدَ الشَّيْطَانِ كَانَ ضَعِيفًا\".\nبالإستعانة بالله.\n \n1:13:30 من مداخل الشيطان للوصول لهدفه الأساسي؛ ١. خطوات الشيطان.\n\n1:24:30 ٢. الشيطان يخوف أولوياءه. \n\n1:32:50 ٣. الغضب.\n\n1:37:25 ٤. الغرور بالله ورحمته.\n\n1:46:05 ٥. الإغواء والتزيين. \n\n2:00:00 الخاتمة: لازم يبقى ادامك نموذج المسلم الصحيح، والحل هو الدعاء المستمر والأذكار.",
    youtubeVideoId: "Eouhp_6xSrE",
    thumbnailUrl: thumbnail("Eouhp_6xSrE"),
    episodeNumber: 43,
    durationSeconds: 7495,
    publishedAt: new Date("2022-06-08T23:00:03-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-42",
    slug: "waie-42",
    title: "وعي ٤٢ | ليه لازم نتكلم عن النار - تذكرة بأهمية الصيام - ختام الموسم",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.\n\nاسمع الحلقة من هنا: https://soundcloud.com/waiepodcast/ep42",
    youtubeVideoId: "Pyf5C_tHiSQ",
    thumbnailUrl: thumbnail("Pyf5C_tHiSQ"),
    episodeNumber: 42,
    durationSeconds: 4978,
    publishedAt: new Date("2022-04-24T14:27:53-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-41",
    slug: "waie-41",
    title: "وعي ٤١ | ما هي الجنة وكيف نقارنها بالدنيا والصبر على البلاء",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.\n\nاسمع الحلقة من هنا: https://soundcloud.com/waiepodcast/ep41",
    youtubeVideoId: "Zh5lZTNV914",
    thumbnailUrl: thumbnail("Zh5lZTNV914"),
    episodeNumber: 41,
    durationSeconds: 4534,
    publishedAt: new Date("2022-03-30T07:32:48-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-40",
    slug: "waie-40",
    title: "وعي ٤٠ | كيفية استقبال رمضان للعصاة (كلنا) ولأصحاب الهمم",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.\n\nاسمع الحلقة من هنا: https://soundcloud.com/waiepodcast/ep40",
    youtubeVideoId: "rIaqApE0aGc",
    thumbnailUrl: thumbnail("rIaqApE0aGc"),
    episodeNumber: 40,
    durationSeconds: 5887,
    publishedAt: new Date("2022-03-17T01:00:15-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-worship-seasons",
    topicIds: ["topic-worship-seasons"],
  },
  {
    id: "ep-39",
    slug: "waie-39",
    title: "وعي ٣٩ | وصف يوم القيامة",
    description: "بودكاست وعي مع أحمد عامر وحازم الصديق وشريف علي.\n\nفي الحلقة دي بنتكلم عن يوم القيامة ومشاهد من البعث والصراط والعذاب والحساب والنعيم.\n\nلينك قناة دروسكاست على التليجرام: \nhttps://t.me/DroosCast\nلينك قناة دروسكاست على الفيسبوك: \nhttps://www.facebook.com/DroosCast/\n\n\n\n0:00 مقدمة: عن أثر العمل الصالح. \n\n4:40 مشاهد يوم القيامة: أول لقاء مع النار. \n\n19:55 مشاهد الصراط وسبب عدم الثبات على الصراط . \n\n30:35 أول لقاء لنا مع النبي ﷺ عند الحوض، والأعمال التي تجعلنا نصل للحوض.\n\n44:30 مشهد الميزان والقصاص. \n\n1:02:00 مشهد التهذيب والقنطرة.\n\n1:09:30 خاتمة: اسمعوا عن فضل شعبان.",
    youtubeVideoId: "2PbfEd36Cz4",
    thumbnailUrl: thumbnail("2PbfEd36Cz4"),
    episodeNumber: 39,
    durationSeconds: 4397,
    publishedAt: new Date("2022-03-04T11:57:57-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-38",
    slug: "waie-38",
    title: "وعي ٣٨ | الدار الآخرة",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "PMXr8jdY0uA",
    thumbnailUrl: thumbnail("PMXr8jdY0uA"),
    episodeNumber: 38,
    durationSeconds: 6077,
    publishedAt: new Date("2022-02-19T21:47:58-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-37",
    slug: "waie-37",
    title: "وعي ٣٧ | التوازن في فهم حقيقة الدنيا وكيف نجمع بين العمل للدين والعمل للدنيا",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.\n\n\n\n\n0:00 مقدمة عن بعض معاني الحلقة السابقة: إرادة الدنيا، ودرجات الزهد. \n\n13:30 تربية النفس \"إن أنت تكون فعل مش رد فعل\"، والتعلق الزائد بالكرة كمثال. \n\n21:20 وظيفتنا الأساسية في الدنيا، ومفهوم النجاح، والإنجاز الأهم في الدنيا. \n\n36:20 هل نترك الدنيا لأعداء الدين؟ وتوضيح صور العبودية المختلفة.\n\n51:10 حقارة الدنيا \"الدنيا لا تساوي عند الله جناح بعوضة\". \n\n56:15 السعي في العمل بنية الكسب الحلال من العبودية. \n\n1:07:50 اعرف طرق الكسب الحرام عشان تعرف تجنبها. \n\n1:12:35 كيف أجمع بين العمل للدين والعمل للدنيا؟\n\n1:21:00 هل الكلام ده بيدعو للتخاذل في العمل الدنيوي؟ \n\n1:23:12 الخاتمة: خطوات عملية لتحقيق العبودية.\n١. فرائض مشتركين فيها جميعا.\n٢. التزكية الأساسية.\n٣. ازاي انصر الدين حسب إمكانيات كل فرد.\n٤. الحد الأدنى من الكسب الحلال.",
    youtubeVideoId: "M7cr9U-jtzY",
    thumbnailUrl: thumbnail("M7cr9U-jtzY"),
    episodeNumber: 37,
    durationSeconds: 5453,
    publishedAt: new Date("2022-02-03T12:40:24-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-36",
    slug: "waie-36",
    title: "وعي ٣٦ | توعية بحقيقة الدنيا وآثار استيعاب قيمتها وطرق لتقليل حبها في قلوبنا",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.\n\n\n\n\n\n0:00 مقدمة عن مفهوم الدنيا ومتاعها. \n\n10:10 طبيعة وجودنا في الدنيا وعلاقتنا بيها. \n\n13:40 حقائق عن الدنيا : ١. \"الدنيا حلوة خضرة\". \nوان الله مستخلفكم فيها فاتقوا الدنيا.\n\n16:10 ٢. الدنيا دار ابتلاء.\n\n21:54 ٣. الدنيا زائلة، فانية، متغيرة وغير مستقرة.\n\n30:45 ٤. السعادة التامة في الجنة \"وَمَا هَذِهِ الْحَيَاةُ الدُّنْيَا إِلَّا لَهْوٌ وَلَعِبٌ وَإِنَّ الدَّارَ الْآخِرَةَ لَهِيَ الْحَيَوَانُ\". \n\n40:12 ٥. من حقائق الدنيا: الملل المستمر. \n\n41:38 من أسباب دوام الاستمتاع بنعيم الدنيا ربطها دايما بالله. \n\n42:52 ٦. حتى نعيم الدنيا مقرون بالمنغصات. \n\n45:15 ٧. من حقائق الدنيا إن في دنيا، وفي نصيبك من الدنيا، بص في الدنيا للأقل منك.\n\"انظروا إلى من أسفل منكم ولا تنظروا لمن فوقكم فهو أجدر ألا تزدروا نعمة ربكم عليكم\". \n\n55:00 خطورة الدنيا أن تكون غاية على حساب الاخرة، \"ما الفقر أخشى عليكم، وإنما أخشى عليكم الدنيا\" . \n\n1:17:55 حديث يوضح التعامل المختلف مع الدنيا. \n\n1:26:10 كيف نتعامل؟ ١. معيار الشرع (الحلال/الحرام) في اختيارات الدنيا. \n\n1:27:30 ٢. خذ من الدنيا، لكن خذ ما يكفيك \"ولا تمدن عينيك\". \n\n1:32:00 ٣. تربية النفس على عدم التعلق \"أوكلما اشتهيت اشتريت؟\". \n\n1:33:17 ٤. كثرة الحمد، وربط نعم الدنيا بالله. \n\n1:35:38 ٥. الدعاء والإستعاذة من فتنة الدنيا. \n\n1:37:00 ٦. التوازن في التعامل مع الدنيا، وربطها بالعبودية. \n\"لا تتخذوا الضيعة فترغبوا في الدنيا\". \n\n1:43:20 ٧. تذكر الموت، وتذكر قيمة الدنيا مقابل الآخرة. \n\n1:44:05 الفهم الخاطئ لمعنى \"الزهد في الدنيا\".  \n\n1:54:20 أمثلة من تعامل النبي ﷺ مع الدنيا. \n\n2:00:16 الخاتمة: الدنيا كمان هي رحلتك للجنة، والدعاء باسم الله الكافي.\n\n\nتوجيه الحلقة: \nدعاء \"اللهم اكفني بحلالك عن حرامك واغنني بفضلك عمن سواك\".",
    youtubeVideoId: "FhVv2Ovy0T0",
    thumbnailUrl: thumbnail("FhVv2Ovy0T0"),
    episodeNumber: 36,
    durationSeconds: 7475,
    publishedAt: new Date("2022-01-27T11:38:08-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-35",
    slug: "waie-35",
    title: "وعي ٣٥ | فهم الموت والتعامل معه والاستعداد له وماذا ينتظرنا بعده",
    description: "القناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.\n\nاسمع الحلقة من هنا: https://soundcloud.com/waiepodcast/ep35/",
    youtubeVideoId: "C4HnRnobgq0",
    thumbnailUrl: thumbnail("C4HnRnobgq0"),
    episodeNumber: 35,
    durationSeconds: 5583,
    publishedAt: new Date("2022-01-19T22:00:04-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-k0y_BJPIFO4",
    slug: "waie-k0y_BJPIFO4",
    title: "\"يارب أموت وارتاح!\"",
    description: "جزء من حلقة رقم 35 عن الموت.\n\nالقناة الرسمية لبودكاست وعي، مع أحمد عامر، حازم الصديق وشريف علي.",
    youtubeVideoId: "k0y_BJPIFO4",
    thumbnailUrl: thumbnail("k0y_BJPIFO4"),
    episodeNumber: null,
    durationSeconds: 134,
    publishedAt: new Date("2022-01-17T03:15:42-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-34",
    slug: "waie-34",
    title: "وعي ٣٤ | خواطر ودروس عملية مستفادة من قصة توبة الصحابي كعب بن مالك",
    description: "بودكاست وعي مع أحمد عامر، حازم الصديق وشريف علي.\n\n\n\n\n\n\n0:00 مقدمة عن فهم طبيعتك البشرية.\n\n8:15 الفرق بين فهم طبيعتي وبين الإستسلام والرضا بالذنوب. \n\n14:20 الفهم الصحيح للحديث \"الفينة بعد الفينة\".\n\"ما مِن عبدٍ مؤمن إلا وله ذنب يَعتاده الفينة بعد الفينة، أو ذنب هو مُقيم عليه لا يفارقه حتى يُفارق الدنيا، إن المؤمن خُلِق مُفتَنًا توابًا نسَّاءً، إذا ذُكِّر ذَكَر\".\n\n21:21 افهم نفسك صح عشان ماتوصلش لليأس ابدا من التوبة، قصة توبة كعب بن مالك كمثال.\n\n27:30 الدرس الأول: تسمية الذنب باسمه.\n\n33:15 الدرس الثاني: محدش كبير على الذنب.\n\n35:40 الدرس الثالث: راقب نفسك وافهم خطوات الشيطان اللي وقعتك في الذنب، التعلق بالدنيا كمثال.\n\n43:40 الراحة الزيادة أحيانا هي العائق للاجتهاد، وأنواع الضعف البشري وطريقة تقويمه.\n\n49:00 التعلق بالدنيا، كن خفيف كأنك مأجر في الدنيا.\n\n52:15 الدرس الرابع: الظن بسهولة التخلي عن الذنب والتسويف.\n\n59:35 الدرس الخامس: \"يا ليتني فعلت!\" الحق نفسك قبل ما تكمل الطريق للذنب.\n\n1:07:50 الصفة الأهم والسر في توبة كعب بن مالك: الصدق. \n\n1:14:00 من أسباب الوقوع في الذنوب: الظن بأنها مصدر السعادة، لكن الحقيقة العكس!\n\n1:22:20 الدرس السادس: من دوافع التوبة: حب النبي.\n\n1:38:05 الدرس السابع: ضغط المجتمع السلبي، والبحث عن الأسود الحسنة.\n\n1:40:40 صعوبة الإبتلاء حتى جاءت البشرى \"ابشر بخير يوم مر عليك منذ ولدتك أمك\".\n\n1:47:20 هتاخد الخطوة امتى؟ أنت مش وحش بس أنت محتاج تبقى كويس \"الخاتمة\".",
    youtubeVideoId: "y8_Zj--B1oM",
    thumbnailUrl: thumbnail("y8_Zj--B1oM"),
    episodeNumber: 34,
    durationSeconds: 6672,
    publishedAt: new Date("2022-01-13T09:07:38-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-33",
    slug: "waie-33",
    title: "وعي ٣٣ | معنى التوبة وطرق عملية لنتوب بصدق وماذا نفعل إذا عدنا للذنب وفرح الله بالتائب",
    description: "التوبة ليست مقصورة على التائب الذي يدخل الإسلام، أو ذلك الذي يهديه الله فيصبح متدينًا بعد ما كان مسلمًا بالاسم. التوبة عمل دائم يسعى إليه كل مسلم وفي كل وقت وبين كل الأعمال. بل إنه كان النبي صلى الله عليه وسلم يتوب في اليوم أكثر من سبعين مرة. فماذا تعني التوبة وكيف نتوب وما هي الطرق العملية لتوبة صادقة ولماذا يفرح الله بتوبة العبد؟\n\nجروب التليجرام: https://t.me/podcastwaie\n\n\n0:00 مقدمة.\n\n9:42 فقرة الأخبار.\n\n14:55 بداية الكلام عن التوبة \"توبة أدهم النابلسي\".\n\n18:18 أحوال الناس مع التوبة.\n\n20:45 النوع الأول صاحب كبائر \"هل لي من توبة؟\".\n\n29:50 كيف يرى الله التوابين؟\n\n33:14 خليك منصف و\"متفتح\" من ناحية كل الشيوخ.\n\n36:20 كلام ابن القيم عن فرحة الله بالتوابيين.\n\n39:30 لماذا نتوب؟ ومن أي شيء نتوب؟\n\n58:15 آثار الذنوب والمعاصي \"كتاب ابن القيم الداء والدواء\".\n\n1:00:30 استغل فرصة التوبة \"ثم يتوبون عن قريب\".\n\n1:05:55 انا اللي بتوب ولا استنى التوبة تحصلي؟  \"عليك البداية وعلى الله التمام\" لازم ربنا يأذنلك وأنت لازم تتحرك.\n\n1:11:20 قصة قاتل المئة نفس.\n\n1:16:20 خذ خطوات عملية للتوبة. \n\n1:25:25 صور التوبة المختلفة \"للملتزمين\".\n\n1:27:00 تعريف \"التوبة\" وشروطها، والفرق بينها وبين الاستغفار.\n\n1:36:20 الفرق بين العزم على عدم العودة، وعدم الصدق في التوبة.\n\n1:39:22 تحديد أولويات التوبة.\n\n1:44:40 معنى الندم وعلاقتنا المستمرة بالذنب.\n\n1:51:10 ازاي أحقق \"التوبة الناجحة\"؟ \n\n2:06:20 تلخيص الحلقة \"الخاتمة\".\n\n\n\nترشيحات الحلقة:\nدرس السر الاعظم العجيري\nاشواق راقية منسية الشيخ يعقوب\nماذا لو تكلم الكفن الشيخ حازم شومان",
    youtubeVideoId: "qS_D9AW3TPg",
    thumbnailUrl: thumbnail("qS_D9AW3TPg"),
    episodeNumber: 33,
    durationSeconds: 7867,
    publishedAt: new Date("2021-12-30T02:01:06-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-32",
    slug: "waie-32",
    title: "وعي ٣٢ | الاحتفال بالكريسماس وسبب اكتساب عادات غربية وعدم الفخر والاكتفاء بالإسلام",
    description: "اسمع الحلقة من هنا: https://soundcloud.com/hazcast/waie32\n\n\n\n0:00 مقدمة: الكريسماس عرض لمرض \"عدم الاكتفاء والرضا بديني، والتقليد الأعمى والتطلع على للهوية الغربية\". \n\n10:22 الأعياد من العقيدة، ومرتبطة بالعبادة، \"إنَّ لِكلِّ قومٍ عيدًا وَهذا عيدُنا\". \n\n18:15 حل مشكلة الانبهار بيهم، وازاي انمي فخري واستغنائي بديني. \n\n31:10 من صفات عبد الرحمن \"لا يشهدون الزور\"، الزور في أعياد المشركين. \n\n32:42 الأمر عقيدة، وتعامل المسلمين مع أهل الكتاب. \n\n42:00 الرد على حجة \"بنحتفل بسيدنا عيسى نبي بتاعنا احنا كمان\".\n\n45:05 عن محبتنا لسيدنا عيسى عليه السلام.\n\n48:40 تلاوة لآيات قصة سيدنا عيسى من سور \"آل عمران، النساء، المائدة، مريم\". \n\n1:00:50 مخلص الحلقة وحلول سريعة. \n\n\n\nترشيحات الحلقة: \n\nمحاضرات الوعي اللغوي لمهندس أيمن عبد الرحيم.\nكتاب جمالية الدين لفريد الأنصاري.\nكتب التاريخ لدكتور راغب السرجاني.\nكتاب سلطة الثقافة الغالبة لإبراهيم السكران.",
    youtubeVideoId: "I8xlDbFWrAA",
    thumbnailUrl: thumbnail("I8xlDbFWrAA"),
    episodeNumber: 32,
    durationSeconds: 3919,
    publishedAt: new Date("2021-12-16T13:29:49-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-31",
    slug: "waie-31",
    title: "وعي ٣١ | دروس من قصة قوم لوط ودورنا في نصرة الدين بين كلمة حق وتحصين القلب",
    description: "اسمع الحلقة من هنا: https://soundcloud.com/hazcast/waie31",
    youtubeVideoId: "m1_QrsNYsmc",
    thumbnailUrl: thumbnail("m1_QrsNYsmc"),
    episodeNumber: 31,
    durationSeconds: 4483,
    publishedAt: new Date("2021-12-09T11:31:38-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-30",
    slug: "waie-30",
    title: "وعي ٣٠ | عبادة الأمر بالمعروف والنهي عن المنكر (مفاهيم عن الدعوة إلى الله ودور كل مسلم في الواقع)",
    description: "أسمع الحلقة من هنا: https://soundcloud.com/hazcast/waie30\n#وعي #podcast #الدعوة\n\n\nلينك قناة تليجرام :\n\nhttps://t.me/podcastwaie\n\n@podcastوعي\n\n\n0:00 مقدمة عن الدعوة، وفقرة الأخبار: عن الدعم الغربي لأفعال ضد الفطرة \n\n13:10 عن سرقة قناة حازم الصديق. \n\n17:50 الدعوة بمختلف صورها، وتصحيح الصورة النمطية عن الدعوة لله\n\n32:45 \"وَمَنۡ أَحۡسَنُ قَوۡلࣰا مِّمَّن دَعَاۤ إِلَى ٱللَّهِ وَعَمِلَ صَـٰلِحࣰا وَقَالَ إِنَّنِی مِنَ ٱلۡمُسۡلِمِینَ\"\nالدعوة لله أشرف الأعمال، واعتراف بانتمائك للإسلام. \n\n37:25 من الدوافع للدعوة؛ الارتباط بالأنبياء ونهجهم، والأثر الآخروي. \n\n42:00 \"قيمتي الحقيقية باستمدها من ديني\". \n\n44:44 \"وَٱلۡمُؤۡمِنُونَ وَٱلۡمُؤۡمِنَـٰتُ بَعۡضُهُمۡ أَوۡلِیَاۤءُ بَعۡضࣲۚ\" من كمال الإيمان انك تحب لأخيك ما تحبه لنفسك، وتشيل هم هدايته. \n\n50:05 من صور الدعوة في القرآن: همة هدهد، ومؤمن آل ياسين. \n\n1:04:20 مفهوم الدعوة بتعريف الصحابي ربعي بن عامر. \n\n1:05:20علاقتك الجيدة بالآخرين من الطرق غير المباشرة للدعوة. \n\n1:07:55 الرد عن شبهة \"حالي وحش في الدين ازاي ادعو للدين؟\" \n\n\n1:20:50 الرد على شبهة \"سيب الناس في حالها، والناس حرة\". \n\n1:26:05 مفهوم الحرية الكاذب، ومثال بقصة أصحاب السبت. \n\n1:31:25 أنهلِك وفينا الصالحون؟ \n\"فَإِنْ تَرَكُوهُمْ وَمَا أَرادُوا هَلكُوا جَمِيعًا، وإِنْ أَخَذُوا عَلَى أَيْدِيهِم نَجَوْا ونَجَوْا جَمِيعًا\" \n\n1:35:35 الإسلام كده كده هينتصر انا اللي محتاج أكون من الأسباب لده، وكل واحد وسعيه. \n\n1:42:42 فقرة الأسئلة .. السؤال الأول: كيفية نصح الشخص المعرض الرافض للنصح؟ \n\n2:03:05 السؤال الثاني: أخاف أسلوبي يكون منفر. \n\n2:04:48 السؤال الثالث: ازاي مايتعصبش من عدم الاستجابة للنصيحة؟ \n\n2:09:40 السؤال الثالث: الخوف من الاحراج أو رفض النصيحة. \n\n2:18:35 نصيحة أخيرة: إفشاء السلام \"الخاتمة\". \n\n\nترشيحات الحلقة:\n\nكتاب أساليب النبوية في التعامل مع أخطاء الناس\nكتاب مواقف دعوية",
    youtubeVideoId: "2vZe4PVY88c",
    thumbnailUrl: thumbnail("2vZe4PVY88c"),
    episodeNumber: 30,
    durationSeconds: 8369,
    publishedAt: new Date("2021-12-03T22:00:01-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-29",
    slug: "waie-29",
    title: "وعي ٢٩ | مفهوم واقعي وغير مبتذل للصحبة الصالحة وضرورتها وطرق عملية للحصول علي صحبة مناسبة",
    description: "بودكاست وعي مع حازم الصديق وشريف علي وأحمد عامر.\n\n\nاسمع من هنا: https://podcasts.apple.com/sa/podcast/hazcast/id1458757969?i=1000543083163\n\n0:00 مقدمة \n\n5:20 \"لو الدنيا كده كده هتفرقنا، خلي الدين معيار، وابعد وقرب على أساسه\" \n\n10:25 تصورك الخاطئ عن الصحبة الصالحة بيتغير مع أول تجربة تعامل! \n\n21:05 \"أنت نتاج الأشخاص اللي بتقضي وقت معاهم\".\n\n29:25 \"كَحَامِلِ الْمِسْكِ وَنَافِخِ الْكِير\" .. أحاديث عن أثر الصحبة،  حتى على الجماد! \n\n39:47 اصبر واسعى للبحث عن الصحبة الصالحة\n\"وَاصْبِرْ نَفْسَكَ مَعَ الَّذِينَ يَدْعُونَ رَبَّهُمْ\". \n\n50:30 الصحبة بتفتحلك آفاق تانية، ترى الإسلام بمنظور أوسع. \n\n1:01:37 كن أنت الصديق الصالح. \n\n1:03:20 اعرف نوع صحبتك ايه وتجنب اللي هيفسد عليك دينك. \n\n1:33:20 مدخلاتك هي اللي بتتحكم في نظرتك وخطواتك في الحياة. \n\n1:38:05 سبب كفر أبو طالب عم الرسول ﷺ، وأثر اختياراتنا للصحبة في الآخرة. \n\n1:56:30 الأثر الإيجابي للصحبة الصالحة في الآخرة \"الخاتمة\".",
    youtubeVideoId: "Vey10b1wWv4",
    thumbnailUrl: thumbnail("Vey10b1wWv4"),
    episodeNumber: 29,
    durationSeconds: 7559,
    publishedAt: new Date("2021-11-25T11:44:38-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-28",
    slug: "waie-28",
    title: "وعي ٢٨ | عن حب النبي ﷺ ولماذا نحبه وأسباب وعلامات صدق محبته ﷺ",
    description: "بودكاست وعي مع شريف علي وحازم الصديق.\n\nاسمع الحلقة من هنا: https://soundcloud.com/hazcast/waie28\n\n\nرابط قناة تليجرام الخاصة بالبودكاست :\n\nt.me/podcastwaay",
    youtubeVideoId: "SEtCAk3dd5E",
    thumbnailUrl: thumbnail("SEtCAk3dd5E"),
    episodeNumber: 28,
    durationSeconds: 7754,
    publishedAt: new Date("2021-11-18T10:02:38-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-27",
    slug: "waie-27",
    title: "وعي ٢٧ | الدعاء والموانع النفسية بينك وبين المداومة عليه",
    description: "بودكاست وعي مع شريف علي وحازم الصديق وأحمد عامر\n\nاسمع الحلقة من هنا: https://soundcloud.com/hazcast/waie27\n\n0:00 مقدمة\n10:00 استغناء الإنسان .. نظرتك لنفسك هو العائق الأول للدعاء.\n15:15 تفاوت أحوال الناس مع الدعاء. \n26:00 الدعاء في يوم النبي ﷺ \"الدُّعاءُ هو العبادةُ\".\n31:20 \"وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَى فَادْعُوهُ بِهَا\". \n41:00 نصيحة عملية: ورد لتدبر أسماء وصفات الله\nكتاب \"كيف لا يُحب\" للشيخ محمد سعد. \n45:10 نصيحة عملية للمستكبر عن الدعاء \"تضاعف ما استطعت، فإن اللطف مع الضعف أكثر\". \n50:55 نصيحة عملية للضعيف في ممارسة عبادة الدعاء \n56:16 الدعاء مش بس طلب، ذكر الله والثناء عليه من الدعاء. \n58:18 الدعاء صورة مصغرة لكل أحوال الإيمان والعبودية، دعاء الاستخارة خير مثال.\n1:05:20 حديث \"لا يزال لسانك رطبا بذكر الله\" والتعايش مع أذكار الصباح والمساء (كتاب معاني الأذكار للشيخ المنجد).\n1:11:10 الرد على \"دعيت كتير ولم يستجب\".\n1:13:31 الأدب في الدعاء، ومشكله التعدي في الدعاء.\n1:16:46 عليك البداية وعليه التمام، قد تكون عدم الاستجابة من تقصيرك في حق الله. \n1:22:20 هل ممكن ارتكب ذنب وادعي في نفس الوقت؟ \n1:30:00 نماذج من دعاء الأنبياء. \n1:32:40 كلام ابن الجوزي مع النفس عن تأخير استجابة الدعاء. \n1:39:19 للدعوة اتجاهات ثلاث للاستجابة. \n1:40:40 الدعاء توكل على الله، وأنس بالله \"خاتمة\".",
    youtubeVideoId: "wbPUq5J6mRI",
    thumbnailUrl: thumbnail("wbPUq5J6mRI"),
    episodeNumber: 27,
    durationSeconds: 6286,
    publishedAt: new Date("2021-11-11T11:01:39-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-26",
    slug: "waie-26",
    title: "وعي ٢٦ | ما هو القرآن؟",
    description: "بودكاست وعي مع أحمد عامر، شريف على وحازم الصديق.\n\nاسمع الحلقة من هنا: https://soundcloud.com/hazcast/waie26\nصفحة USA Shop: https://www.facebook.com/USToEgypt/\n\n\n\n0:00 مقدمة \n8:10 ما هو القرآن؟ \n23:10 ما علاقة القرآن بالتوارة والإنجيل؟ \n25:40 \"اتخذوا تلاوته عملًا\" .. علاقتنا بالقرآن تلاوة بدون فهم أو عمل.\n28:53 حال الصحابة مع القرآن؛ التأثر العاطفي، والعمل به. \n33:20 حتى المشركين تأثروا بالقرآن! \n38:00 دلالة الإيمان بالقرآن: العمل به. \n41:50 أثر القرآن في تغيير: مفاهيمك، تصوارتك، وتطهير قلبك. \n45:32 ازاي القرآن ممكن يحل مشاكلي؟ ادخل القرآن بنفسية الباحث عن الهداية. \n55:30 تفاعل الصحابة العملي مع القرآن.\n1:05:33 ازاي ابني حال مع القرآن؟ القرآن محتاج بذل \"الافتقار والاستمرارية والبذل\".\n1:15:50 موانع عن الفهم والتدبر \"الكبر، الإعراض، والذنوب\" \n1:17:00 ثواب التجويد \"سماع دورة الشيخ أيمن سويد\". \n1:23:40 الورد اليومي من القراءة والسماع.\n1:26:26 الدعاء قبل القراءة ثم التدبر \"التفاعل مع القراءة\". \n1:27:48 التعامل مع غريب القرآن \"معاني الكلمات\".\n1:32:00 خطوات عملية للتقرب من القرآن أو لتحسين التجويد.\n1:38:20 نصيحة للغلابة: هل ممكن ابدأ احفظ \"وأنا كبير\"؟ الخاتمة\n\nترشيحات الحلقة: \n\nالبحث عن أوصاف القرآن في القرآن.\n\nدرس \"النظر إلى السماء\" لد. أحمد عبد المنعم.\nhttps://youtu.be/wrdJHqQKOTY \n\nدورة تجويد للشيخ أيمن سويد.\n\nبرنامج \"بالقرآن أهتديت\" للشيخ فهد الكندري. \nhttps://youtube.com/playlist?list=PLwpWNTLjV2091zs4FkItmzL1cGZst3WdD \n\nبرنامج \"وسام القرآن\" نماذج لحفاظ القرآن.\nhttps://youtube.com/playlist?list=PLwpWNTLjV20-lMmRBE8nrxF0FO6bpdqGd \n\nمحاضرة \"حفظ القرآن غيرني\" لد. حازم شومان.\nhttps://youtu.be/ZCK9rgCSwlQ\n\nالكتب:\n\nالطريق إلى القرآن للشيخ إبراهيم السكران.\n\nرقائق القرآن للشيخ إبراهيم السكران.\n\nالمشوق إلى القرآن للشيخ عمرو الشرقاوي.\n\nالدليل إلى القرآن للشيخ عمرو الشرقاوي.",
    youtubeVideoId: "nSDNA4YRS_8",
    thumbnailUrl: thumbnail("nSDNA4YRS_8"),
    episodeNumber: 26,
    durationSeconds: 6407,
    publishedAt: new Date("2021-10-28T13:47:28-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-25",
    slug: "waie-25",
    title: "وعي ٢٥ | تجارب شخصية مع الموسيقى وآثارها علينا، وأهمية القرآن في تطهير القلب",
    description: "بودكاست وعي مع حازم الصديق، شريف علي واحمد عامر. عن الموسيقى وآثارها على المجتمع والنفس، وطرق واقعية لتقليل حجمها في القلب.\n\nاسمع الحلقة من هنا: https://soundcloud.com/hazcast/waie25\n\n0:00 مقدمة\n7:50 هل الأغاني\"بالكلمات اللي بتسمعها\" فعلا محل خلاف بين الحلال والحرام؟ \n18:40 الوعي بأثر كلمات الأغاني على القلب.\n23:10 الأغاني باب لفتن كتير.\n26:40 التحذير من الجهر بالفسق ليس من الغيبة.\n29:15 الأغاني محرك للشهوة.\n33:07 الأغاني ونشر الثقافات الفاسدة.\n34:15 الأغاني والتعلق بأهل الفساد \" المرءُ مع من أحب\".\n39:00 المغني ورؤيته لنفسه ول\"جمهوره\".\n41:55 تقبل الفحش والبذاءة، حتى بين الأطفال!\n44:10 تأليه الإنسان.. العلو والكبر في الأغاني.\n46:06 غذاء الروح هو الكلام، والكلام إما إلى الجنة أو إلى النار!  \n51:05 الأغاني تستنزف رصيد مشاعرك.\n55:32 أقوال العلماء في الأغاني ونظرتهم الشاملة. \n59:36 \"مش هي دي الحاجة اللي المفروض استمد منها سعادتي \". \n1:04:40 علاج كل التحديات: القرآن \"الخاتمة\".\n\n#podcast #وعي #music",
    youtubeVideoId: "S9QMNG9Lt9I",
    thumbnailUrl: thumbnail("S9QMNG9Lt9I"),
    episodeNumber: 25,
    durationSeconds: 5012,
    publishedAt: new Date("2021-10-21T12:30:23-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-24",
    slug: "waie-24",
    title: "وعي ٢٤ | الاختلاط والتعامل المنضبط بين الولد والبنت",
    description: "بودكاست وعي مع أحمد عامر وحازم الصديق وشريف علي.\n\nاسمع الحلقة من هنا: https://soundcloud.com/hazcast/waie24\n\n0:00 مقدمة\n5:20 شرع الله نور نحيا به وليس كبت للحريات\n8:45  \"خير صفوف الرجال أولها وشرها آخرها\"\n14:00 ما وصل إليه الغرب -كنموذج- بعد انتكاس الفطرة\n16:40 ضوابط التعامل: ١. الكلام \"فَلَا تَخۡضَعۡنَ بِٱلۡقَوۡلِ\"\n19:25 قصة سيدنا موسى والامرأتين \n21:00 تجربة العمل التطوعي كمثال\n27:30 نموذج الجيم الميكس والرياضة المختلطة \n36:28 ٢. التعامل للضرورة \"فَسَقَىٰ لَهُمَا ثُمَّ تَوَلَّىٰۤ \"\n41:08 ٣. المشي \"تَمۡشِی عَلَى ٱسۡتِحۡیَاۤءࣲ\"\n43:15 ٤. اللمس والسلام باليد\n51:00 عندما ترك الجيش السيدة عائشة في الصحراء\n55:00 ٥. الخلوة\n57:42 اختلاط الشغل \"وَمَن یَتَّقِ ٱللَّهَ یَجۡعَل لَّهُۥ مَخۡرَجࣰا\"\n1:07:25 كيف يقاوم المرء هواه في التعامل؟ \"مثال من السنة\"\n1:13:48 بركة السنة واستحضارها في حياتك\n1:16:04 بعض الحلول العملية .. تقوى الله هي السر\n\n#وعي #بودكاست",
    youtubeVideoId: "saN93CPUg2A",
    thumbnailUrl: thumbnail("saN93CPUg2A"),
    episodeNumber: 24,
    durationSeconds: 4986,
    publishedAt: new Date("2021-10-14T10:36:47-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-23",
    slug: "waie-23",
    title: "وعي ٢٣ | الصحوبية والصداقة بين الولد والبنت والعلاقات المحرمة وتوابعها المدمرة",
    description: "بودكاست وعي مع أحمد عامر وحازم الصديق وشريف علي.\n\nاسمع الحلقة من هنا: https://soundcloud.com/hazcast/waie23\n\n0:00 مقدمة\n6:20 تعامل أمهات المؤمنين مع الصحابة\n10:52 صور التعامل الحالي بين الشباب والبنات، وبُعدها عن الضوابط الشرعية\n18:38 تبعات والأثر النفسي للإختلاط\n23:08 معايير الإختيار في \"الصحوبية\" وأثر التجربة عليك\n31:50 الصحوبية من درجات الزنا \"خطوات الشيطان\"\n43:30 العاطفة تخدع العقل\n51:06 الزواج بعد الإختلاط والعلاقات واستنزاف المشاعر\n1:00:00 دور الأفلام الرومانسية في تغيير مفهومك عن الإرتباط \n1:03:45 أثر كل تلك الأمور على القلب وعلى الإيمان\n1:10:25 الصحوبية عائق كبير في طريق الإلتزام\n1:14:30 \"لكل غادرٍ لواءّ يوم القيامة يقال؛ هذه غدرة فلان\"\n1:16:30 كبيرة الزنا وعقوبتها في الدنيا والآخرة .. \"الشاب اللي زنى عمره ما كان يتوقع انه هيزنى\"  \n1:27:30 الحل.. ازاي أنهي واقفل باب الذنب ده؟ \"الخاتمة\"\n\n#وعي #بودكاست",
    youtubeVideoId: "2jGaxdGVtHI",
    thumbnailUrl: thumbnail("2jGaxdGVtHI"),
    episodeNumber: 23,
    durationSeconds: 6308,
    publishedAt: new Date("2021-10-07T13:36:41-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },
  {
    id: "ep-22",
    slug: "waie-22",
    title: "وعي ٢٢ | حلول واقعية لإدمان الأفلام الإباحية والعادة، وفهم أوسع لأسباب المشكلة وكيفية الإقلاع",
    description: "بودكاست وعي مع أحمد عامر وحازم الصديق وشريف علي.\n\nاسمع الحلقة من هنا: https://soundcloud.com/hazcast/waie22\n\nلو عايز مساعدة ممكن تتواصل مع واعي: https://www.facebook.com/wa3i.org\n\nممكن تسمع الحقلة في أي مكان بينزل عليه بودكاستس، او ممكن من على ساوند كلاود: soundcloud.com/hazcast/waie22\n#podcast #وعي",
    youtubeVideoId: "lTwPy-oSZhk",
    thumbnailUrl: thumbnail("lTwPy-oSZhk"),
    episodeNumber: 22,
    durationSeconds: 4077,
    publishedAt: new Date("2021-09-30T09:31:30-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "",
    topicIds: [],
  },

  /**
   * "الموسم الأول" -- the show's original 22 uploads, imported from the
   * "وعي" playlist on host Hazem El Seddiq's own YouTube channel
   * (https://www.youtube.com/playlist?list=PLcaLjDlQePQU3dpVNUzTSQQapGgtxPtts),
   * not the main @Waie channel: this is where the podcast lived before it
   * got its own channel, which is why episodeNumber 1-21 don't otherwise
   * exist in this file (ep-22 above is the oldest episode on @Waie itself).
   * `seriesId: "series-season-one"` (see data/series.ts). `topicIds: []`
   * for the same reason `topicId` on that series is `null` -- not inferred
   * from the playlist. `hosts` intentionally left unset (falls back to the
   * show's default lineup, same as every other imported episode) even
   * though the descriptions below show the actual lineup varying between
   * two and three hosts episode to episode -- consistent with how the rest
   * of this import handles hosts (see data/hosts.ts).
   */
  {
    id: "ep-21",
    slug: "waie-21",
    title: `وعي ٢١ | الأفلام والإباحية وأضرارها والحفاظ على النفس منها وعدم فقدان الأمل في التوبة والتعافي`,
    description: `بودكاست وعي مع أحمد عامر، حازم الصديق وشريف علي.

ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

أو من هنا: https://soundcloud.com/hazcast/waie21
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي #Pornography`,
    youtubeVideoId: "3-Caas1JElk",
    thumbnailUrl: thumbnail("3-Caas1JElk"),
    episodeNumber: 21,
    durationSeconds: 4519,
    publishedAt: new Date("2021-09-16T09:57:30-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-20",
    slug: "waie-20",
    title: `وعي ٢٠ | توعية عن الشهوة وأبعادها وضرورة فهم آثار الاستسلام لها على النفس والمجتمعات`,
    description: `ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

بودكاست وعي مع أحمد عامر وحازم الصديق وشريف علي.

اسمع الحلقة من https://hazem.tv/waie20
أو من هنا: https://soundcloud.com/hazcast
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي #الشهوة`,
    youtubeVideoId: "9ReqYOhcpuc",
    thumbnailUrl: thumbnail("9ReqYOhcpuc"),
    episodeNumber: 20,
    durationSeconds: 3832,
    publishedAt: new Date("2021-09-02T11:19:10-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-19",
    slug: "waie-19",
    title: `وعي ١٩ | نقاش عن الأسباب الأشهر لترك الحجاب وكيفية التعامل معها وتذكرة بهدفنا كمسلمين في الحياة`,
    description: `ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

اسمع الحلقة من https://hazem.tv/waie19
أو من هنا: https://soundcloud.com/hazcast
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي #الحجاب`,
    youtubeVideoId: "bbeA-UaElfw",
    thumbnailUrl: thumbnail("bbeA-UaElfw"),
    episodeNumber: 19,
    durationSeconds: 5604,
    publishedAt: new Date("2021-08-26T12:21:30-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-18",
    slug: "waie-18",
    title: `وعي ١٨ | الصلاة: فرضيتها وأهميتها وآثارها العملية والإيمانية وتذكرة للقلوب المقبلة`,
    description: `وعي 18 مع شريف علي وحازم الصديق.

ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

اسمع الحلقة من https://hazem.tv/waie18
أو من هنا: https://soundcloud.com/hazcast
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي #الصلاة`,
    youtubeVideoId: "ep3mrXELwuY",
    thumbnailUrl: thumbnail("ep3mrXELwuY"),
    episodeNumber: 18,
    durationSeconds: 3310,
    publishedAt: new Date("2021-08-19T08:06:13-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-pDqpbfkMi-k",
    slug: "waie-pDqpbfkMi-k",
    title: `الصلاة بتفرق في حياتنا العملية بجد ولا هي مجرد طقوس روحانية؟`,
    description: `شوف الحلقة كاملة من هنا: 

ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

اسمع الحلقة من https://hazem.tv/waie18
أو من هنا: https://soundcloud.com/hazcast
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي #الصلاة`,
    youtubeVideoId: "pDqpbfkMi-k",
    thumbnailUrl: thumbnail("pDqpbfkMi-k"),
    episodeNumber: null,
    durationSeconds: 260,
    publishedAt: new Date("2021-08-19T05:32:56-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-17",
    slug: "waie-17",
    title: `وعي ١٧ | السوشيال ميديا وأضرارها وتأثيرها السلبي على حياتنا وديننا وكيف نتعامل معها`,
    description: `ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

بو
اسمع الحلقة من 
https://soundcloud.com/hazcast/waie17
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي #SocialMedia`,
    youtubeVideoId: "LA-Rfc3EWGU",
    thumbnailUrl: thumbnail("LA-Rfc3EWGU"),
    episodeNumber: 17,
    durationSeconds: 5835,
    publishedAt: new Date("2021-08-05T13:25:29-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-16",
    slug: "waie-16",
    title: `وعي ١٦ | عن حب سيدنا إبراهيم وأهمية يوم النحر ومفهوم التضحية والتسليم وتطبيقات عملية`,
    description: `ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

وعي مع أحمد عامر وحازم الصديق وشريف علي.
إحنا بنحب سيدنا إبراهيم جدًا. في البودكاست ده اتكلمنا عنه كتير وعن التضحيات اللي ضحاها عشان يبقى خليل الرحمن، وعن أثر سيدنا إبراهيم الباقي حتى الآن في الإسلام.

اسمع الحلقة من https://hazem.tv/waie16
أو من هنا: https://soundcloud.com/hazcast
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي #النحر`,
    youtubeVideoId: "SK_fQrH49Z0",
    thumbnailUrl: thumbnail("SK_fQrH49Z0"),
    episodeNumber: 16,
    durationSeconds: 3267,
    publishedAt: new Date("2021-07-18T12:25:08-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-15",
    slug: "waie-15",
    title: `وعي ١٥ | أوائل ذي الحجة | أفضل أيام الدهروعظمة يوم عرفة وأفضل الأعمال فيها`,
    description: `ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

بودكاست وعي مع أحمد عامر وحازم الصديق وشريف علي. عن العشر الأوائل من ذي الحجة وحسن استقبالهم والتخطيط ليهم وأفضل الأعمال فيهم. وعن يوم عرفة وعظمته وحمات الله في ذلك اليوم.

اسمع الحلقة من https://hazem.tv
أو من هنا: https://soundcloud.com/hazcast/waie15
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي #عرفة`,
    youtubeVideoId: "YgKfcLUbu60",
    thumbnailUrl: thumbnail("YgKfcLUbu60"),
    episodeNumber: 15,
    durationSeconds: 4220,
    publishedAt: new Date("2021-07-12T14:07:53-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-14",
    slug: "waie-14",
    title: `وعي ١٤ | إصابة أحمد عامر بالرباط الصليبي وخواطر حول التعامل مع الابتلاء وقراءة قدر الله ورسائله`,
    description: `ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

بودكاست وعي مع أحمد عامر وحازم الصديق.

اسمع الحلقة من https://hazem.tv
أو من هنا: https://soundcloud.com/hazcast/waie14
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://kit.co/hzmsdq/youtube-and-podcast-gear

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي #الابتلاء`,
    youtubeVideoId: "Yu2MXe4EhDA",
    thumbnailUrl: thumbnail("Yu2MXe4EhDA"),
    episodeNumber: 14,
    durationSeconds: 3614,
    publishedAt: new Date("2021-07-01T10:40:29-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-13",
    slug: "waie-13",
    title: `وعي ١٣ | أهم خطوات للحفاظ على النفس وما بني في رمضان (طرق عملية)`,
    description: `ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

خطوات عملية والأعمدة الرئيسية في الحفاظ على النفس بعد رمضان وعدم فقدان الأمل في ما بني في رمضان. مع أحمد عامر وحازم الصديق وشريف علي.

اسمع الحلقة من https://hazem.tv
أو من هنا: https://soundcloud.com/hazcast/waie13
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

الحلقة برعاية

التي-شرت اللي أنا لابسه من هنا: https://www.stabraq.com

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي`,
    youtubeVideoId: "rw7vweU9kJM",
    thumbnailUrl: thumbnail("rw7vweU9kJM"),
    episodeNumber: 13,
    durationSeconds: 3693,
    publishedAt: new Date("2021-06-24T17:16:23-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-12",
    slug: "waie-12",
    title: `وعي ١٢ | فهم القضية الفلسطينية من منطلق الدين وكيفية الخروج منها بتغيير حقيقي كي لا ننسى`,
    description: `وعي مع أحمد عامر وحازم الصديق وشريف علي - فلسطين وكيف نبصر الأحداث بشكل صحيح، وكيف نخرج منها بخطة عملية كي لا ننسى.

0:00 مقدمة.
4:08 إحياء القضية في النفوس.
7:20 الله يدبر لدينه. 
11:43 ربط الأحداث برمضان، وعلاقتنا بالأحداث. 

20:24 قضية فلسطين إنسانية، عربية ولا إسلامية؟
25:26 القومية مش غلط لكن لا تكتفي بيها، المسلم أخو المسلم، التفاعل مع القضية عبادة. 
31:51 الأمة قوية وتأثريها ضخم جدا.
33:38 كل مسلم من حقه الدفاع عن القضية بل واجبه، ماتحجرش القضية على حد (الصحابي أبو محجن الثقفي رضي الله عنه).

38:34 "رجال صدقوا ما عادوا الله عليه" كل واحد أدرك دوره، المهم نستمر مانهداش بهدوء التريند.

43:30 من أعظم أسباب الهزيمة: ١.الذنوب والمعاصي (مثال غزوة أحد)
٢.أن تظن ان النصر من عندك أو بقوتك أنت
سنن الله في الدنيا لا تُخالف.

50:58 مفهوم النصر (مثال الغلام وأصحاب الاخدود)

55:12 نتفاعل ازاي مع فيديوهات ضحايا فلسطين. 

1:00:31 نصائح مهمة ١. أقل أثر انني أفهم القضية اكتر فهي جزء من ديني "وما بدلوا تبديلا".
1:03:25 ٢. الشباب تستغل همتها وطاقتها لخدمة القضية قدر المستطاع.
1:06:06 ٣. القضية بتحفزنا لدورنا الأساسي في الدنيا "نعبد الله"، والمكسب أننا نموت على الإسلام.
1:07:07 العبادة هي الإيجابية الحقيقية اللي ممكن تقدمها للقضية، أقلها أن تنوي وتحدث نفسك بالتغيير.
1:12:56 العلاقة بالقرآن هي اللي تديم صحوتك.

ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

اسمع الحلقة من https://hazem.tv
أو من هنا: https://soundcloud.com/hazcast/waie12
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي #فلسطين`,
    youtubeVideoId: "ehL5UnNnoFU",
    thumbnailUrl: thumbnail("ehL5UnNnoFU"),
    episodeNumber: 12,
    durationSeconds: 4523,
    publishedAt: new Date("2021-05-23T11:13:47-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-11",
    slug: "waie-11",
    title: `وعي ١١ | الفتور في رمضان وحسن التعامل مع النفس وقيمة التفرغ للعبادة وطريقة دعاء الأنبياء`,
    description: `ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

بودكاست وعي مع أحمد عامر وحازم الصديق وشريف علي عن كيف كان يدعوا الأنبياء والفتور في رمضان وحسن التعامل مع النفس وقيمة التفرغ للعبادة.

اسمع الحلقة من https://hazem.tv
أو من هنا: https://soundcloud.com/hazcast/waie11
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي #رمضان`,
    youtubeVideoId: "fqL5bKCZlMw",
    thumbnailUrl: thumbnail("fqL5bKCZlMw"),
    episodeNumber: 11,
    durationSeconds: 5009,
    publishedAt: new Date("2021-04-22T13:17:04-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-10",
    slug: "waie-10",
    title: `وعي ١٠ | الاستعداد العملي لرمضان بخطة واقعية`,
    description: `ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

بودكاست وعي مع أحمد عامر وحازم الصديق عن الاستعداد لرمضان بخطة عملية.

اسمع الحلقة من https://hazem.tv
أو من هنا: https://soundcloud.com/hazcast/waie10
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي`,
    youtubeVideoId: "qUtDdVuXayA",
    thumbnailUrl: thumbnail("qUtDdVuXayA"),
    episodeNumber: 10,
    durationSeconds: 4314,
    publishedAt: new Date("2021-04-11T08:35:53-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-9",
    slug: "waie-9",
    title: `وعي ٩ | ماذا يعني رمضان لنا وما الاستعداد الذهني والنفسي له`,
    description: `ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

بودكاست وعي مع احمد عامر وحازم الصديق. كيفية الاستعداد الذهني والنفسي لرمضان وتحديات شخصية

اسمع الحلقة من https://hazem.tv
أو من هنا: https://soundcloud.com/hazcast/waie9
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#HazCast #Podcast`,
    youtubeVideoId: "OuyAO6Nz9v0",
    thumbnailUrl: thumbnail("OuyAO6Nz9v0"),
    episodeNumber: 9,
    durationSeconds: 4126,
    publishedAt: new Date("2021-04-10T07:37:12-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-8",
    slug: "waie-8",
    title: `وعي ٨ | معنى البر المفقود ومفهوم جديد لاستيعاب علاقتنا بأهلنا وطرق فعالة لنيل رضاهم`,
    description: `الكلام اللي في الدقيقة 1:30 هو أثر عن ابن عباس وليس بحديث.

بودكاست وعي مع أحمد عامر وحازم الصديق: 
معنى البر المفقود ومفهوم جديد لاستيعاب علاقتنا بأهلنا وطرق فعالة لنيل رضاهم

ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

اسمع الحلقة من https://hazem.tv
أو من هنا: https://soundcloud.com/hazcast/waie8
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي`,
    youtubeVideoId: "D3gunb0UuVY",
    thumbnailUrl: thumbnail("D3gunb0UuVY"),
    episodeNumber: 8,
    durationSeconds: 5395,
    publishedAt: new Date("2021-03-29T05:34:49-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-7",
    slug: "waie-7",
    title: `وعي ٧ | أهمية طلب العلم الشرعي وأنواعه وهل هو ضرورة أم اختيار`,
    description: `ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

اسمع الحلقة من https://hazem.tv
أو من هنا: https://soundcloud.com/hazcast/waie7
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي`,
    youtubeVideoId: "mhQYHun5lh4",
    thumbnailUrl: thumbnail("mhQYHun5lh4"),
    episodeNumber: 7,
    durationSeconds: 5033,
    publishedAt: new Date("2021-03-22T07:40:50-07:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-6",
    slug: "waie-6",
    title: `وعي مع الجمهور ٦ | حقيقة الذنوب ولماذا نذنب وفهم النفس في التعامل مع الذنب`,
    description: `ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

بودكاست وعي مع أحمد عامر وحازم الصديق

تصوير ومونتاج: محمد قابيل

اسمع الحلقة من https://hazem.tv
أو من هنا: https://soundcloud.com/hazcast/waie6
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#وعي #الذنوب`,
    youtubeVideoId: "7AWgilk0YMM",
    thumbnailUrl: thumbnail("7AWgilk0YMM"),
    episodeNumber: 6,
    durationSeconds: 4903,
    publishedAt: new Date("2021-03-13T12:02:27-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-5",
    slug: "waie-5",
    title: `وعي ٥ | كلام عن العلم والعلماء ونسأل مين ونرجع لمين`,
    description: `بودكاست وعي مع أحمد عامر وحازم الصديق

ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

اسمع الحلقة من https://hazem.tv
أو من هنا: https://soundcloud.com/hazcast/waie5
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي`,
    youtubeVideoId: "dkzOzXTQfHo",
    thumbnailUrl: thumbnail("dkzOzXTQfHo"),
    episodeNumber: 5,
    durationSeconds: 3768,
    publishedAt: new Date("2021-03-07T04:19:28-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-4",
    slug: "waie-4",
    title: `وعي ٤ | الصلاة وأهميتها وارتباطها الواقعي بحياتنا وكيفية المواظبة عليها`,
    description: `بودكاست وعي مع أحمد عامر وحازم الصديق.

أهمية الصلاة وارتباطها الواقعي بحياتنا وطرق فعالة تخليك تواظب على الصلاة، ومحاولة لفهم الصلاة من كذا بعد وتأثيرها الإيجابي والملموس علينا.

ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

أو من هنا: https://soundcloud.com/hazcast/waie4
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي`,
    youtubeVideoId: "M6AIuNtxMrY",
    thumbnailUrl: thumbnail("M6AIuNtxMrY"),
    episodeNumber: 4,
    durationSeconds: 4967,
    publishedAt: new Date("2021-02-27T09:31:01-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-3",
    slug: "waie-3",
    title: `وعي ٣ | الانخراط في المجتمع مع الحفاظ على ديني + تأثير لبسنا علينا`,
    description: `بودكاست وعي مع أحمد عامر وحازم الصديق

ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

اسمع الحلقة من https://hazem.tv
أو من هنا: https://soundcloud.com/hazcast/waie3
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي`,
    youtubeVideoId: "6dUBniwpJRQ",
    thumbnailUrl: thumbnail("6dUBniwpJRQ"),
    episodeNumber: 3,
    durationSeconds: 4678,
    publishedAt: new Date("2021-02-23T11:55:36-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-2",
    slug: "waie-2",
    title: `وعي ٢ | تزكية النفس ومعناها ونعمها ازاي وأهميتها في تطهير القلوب والتغيير`,
    description: `ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

في الحلقة دي اتكلمنا عن اهمية تزكية النفس.
فكرة ان نفسي فيها مشاكل واننا بنكسل جدا نتغير في جانب الاخلاق وتطهير القلب.. دردشة من اول يعني ايه اصلا تزكية ونعملها ازاي وبرده عن ليه بنقصر فيه ومش شغالين عليه كفاية..

اسمع الحلقة من https://hazem.tv
أو من هنا: https://soundcloud.com/hazcast
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

الهودي اللي أنا لابسه من هنا: https://www.stabraq.com

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي`,
    youtubeVideoId: "0n_K3CpoizE",
    thumbnailUrl: thumbnail("0n_K3CpoizE"),
    episodeNumber: 2,
    durationSeconds: 4418,
    publishedAt: new Date("2021-02-13T07:00:44-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
  {
    id: "ep-1",
    slug: "waie-1",
    title: `وعي | بودكاست جديد مع أحمد عامر وحازم الصديق`,
    description: `ادعم البودكاست من هنا: https://www.patreon.com/hzmsdq

اسمع الحلقة من
أو من هنا: https://soundcloud.com/hazcast/waie01
أو من أي تطبيق بتاع بودكاست زي iTunes أو Google Podcasts أو CastBox

الهودي اللي أنا لابسه من هنا: https://www.stabraq.com

العدة اللي بستخدمها (لو اشتريت من اللينكات دي، باخد نسبة)
https://www.amazon.com/shop/hazemelseddiq

تابعني على سوشيال ميديا
فيسبوك: https://www.facebook.com/hzmsdq
إنستاجرام: https://www.instagram.com/alienbeard
تويتر: https://www.twitter.com/hzmsdq

للتواصل والإعلان: h@hazem.tv
#Podcast #وعي`,
    youtubeVideoId: "RhTxjl_W_BM",
    thumbnailUrl: thumbnail("RhTxjl_W_BM"),
    episodeNumber: 1,
    durationSeconds: 4212,
    publishedAt: new Date("2021-02-06T04:30:42-08:00"),
    status: "PUBLISHED",
    featured: false,
    seriesId: "series-season-one",
    topicIds: [],
  },
];

/**
 * Homepage "الأكثر استماعًا" rail, ranked by each video's real YouTube view
 * count at import time (no synthetic/editorial ranking).
 */
export const popularEpisodeSlugs = [
  "waie-33",
  "waie-25",
  "waie-26",
  "waie-24",
  "waie-23",
  "waie-77",
];


/**
 * Temporary in-memory mutation for the admin demo (see app/admin/episodes).
 * Mutates this module's array in place, so changes are visible immediately
 * across the running server process but reset on restart — a stand-in for
 * a real `UPDATE` query once Prisma is wired up. Never called from public
 * (non-admin) routes.
 */
export function updateEpisodeEditorialFields(
  id: string,
  patch: Partial<Pick<Episode, "title" | "description" | "status">>,
): Episode | null {
  const episode = episodes.find((item) => item.id === id);
  if (!episode) return null;
  Object.assign(episode, patch);
  return episode;
}
