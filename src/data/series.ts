import type { Series } from "@/types/series";

/**
 * The 5 real, named playlists on the Waie YouTube channel at import time,
 * plus a 6th series added later ("الموسم الأول") sourced from a playlist
 * on a different channel entirely -- see the comment on that entry below
 * and the corresponding block in data/episodes.ts.
 * The channel also has a generic "بودكاست وعي" catch-all playlist (76
 * videos) that is not a distinct series -- it is simply the whole show's
 * feed, so episodes that aren't in one of the named series below intentionally
 * have no series (see data/episodes.ts) rather than being force-fit here.
 */
export const series: Series[] = [
  {
    id: "series-companions",
    slug: "companions",
    title: "سلسلة الصحابة",
    description: "حكايات صادقة عن رجال ونساء صنعوا المعنى قبل أن يصنعوا التاريخ.",
    coverImage: "/series/companions.png",
    coverImageMobile: "/series/companions-mobile.png",
    topicId: "topic-companions",
    status: "PUBLISHED",
  },
  {
    id: "series-stories",
    slug: "stories",
    title: "سلسلة القصص",
    description: "أحسن القصص كما وردت في القرآن، بقلم يعيد قراءتها بوعي معاصر.",
    coverImage: "/series/stories.png",
    coverImageMobile: "/series/stories-mobile.png",
    topicId: "topic-stories",
    status: "PUBLISHED",
  },
  {
    id: "series-worship-seasons",
    slug: "worship-seasons",
    title: "مواسم العبادات",
    description: "حلقات مرتبطة بمواسم العبادة كرمضان والحج وعشر ذي الحجة.",
    coverImage: "/series/worship-seasons.png",
    coverImageMobile: "/series/worship-seasons-mobile.png",
    topicId: "topic-worship-seasons",
    status: "PUBLISHED",
  },
  {
    id: "series-ethics",
    slug: "ethics",
    title: "سلسلة الأخلاق",
    description: "حلقات في الأخلاق والقيم وأثرها في حياة الفرد والمجتمع.",
    coverImage: "/series/ethics.png",
    coverImageMobile: "/series/ethics-mobile.png",
    topicId: "topic-ethics",
    status: "PUBLISHED",
  },
  {
    id: "series-commitment",
    slug: "commitment",
    title: "التدين والالتزام",
    description: "حلقات حول معنى الالتزام الديني وكيفية بنائه خطوة بخطوة.",
    coverImage: "/series/commitment.png",
    coverImageMobile: "/series/commitment-mobile.png",
    topicId: "topic-commitment",
    status: "PUBLISHED",
  },
  /**
   * Sourced from the "وعي" playlist on host Hazem El Seddiq's own YouTube
   * channel (https://www.youtube.com/playlist?list=PLcaLjDlQePQU3dpVNUzTSQQapGgtxPtts),
   * not the main @Waie channel -- these are the show's original 22 episodes
   * from before it had its own channel. `title` and `description` are the
   * real playlist title/description as read from YouTube (the playlist has
   * no description set, hence `""`). `coverImage` is the show's wordmark
   * (editor-supplied, not from YouTube) -- square source, so used as-is for
   * both desktop and mobile (`coverImageMobile` falls back to it). `topicId`
   * is `null`: never inferred from a YouTube playlist, only ever set by an
   * editor (see types/series.ts).
   */
  {
    id: "series-season-one",
    slug: "season-one",
    title: "وعي",
    description: "",
    coverImage: "/series/season-one.png",
    topicId: null,
    status: "PUBLISHED",
  },
];
