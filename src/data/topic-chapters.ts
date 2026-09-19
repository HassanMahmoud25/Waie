/**
 * Editorial layer over data/topics.ts: the /topics page groups the flat topic
 * list into "chapters" (أبواب) so 46 subjects read as a handful of areas
 * rather than one long wall of tags. Purely presentational -- a topic's own
 * data (title, description, colour, its episodes) is untouched.
 *
 * `topicSlugs` are in reading order. A chapter's lead tile (the one with
 * photography) is its first topic that is backed by a series with cover art,
 * so list that one first. A topic missing from every chapter isn't lost:
 * lib/utils/topic-chapters.ts gathers strays into a closing "more" chapter.
 */
export type TopicChapterDefinition = {
  id: string;
  title: string;
  blurb: string;
  topicSlugs: string[];
};

export const topicChapters: TopicChapterDefinition[] = [
  {
    id: "worship",
    title: "العبادات والمواسم",
    blurb: "الصلاة والدعاء والقرآن، ومحطات العام التعبدية من رمضان إلى عشر ذي الحجة.",
    topicSlugs: ["worship-seasons", "ramadan", "dhul-hijjah", "prayer", "dua", "quran", "steadfastness"],
  },
  {
    id: "heart",
    title: "القلب والطريق إلى الله",
    blurb: "من معنى الالتزام إلى تزكية النفس والتوبة، وفهم الدنيا والآخرة وما يعترض الطريق.",
    topicSlugs: ["commitment", "self-purification", "repentance", "trials", "satan", "dunya", "afterlife"],
  },
  {
    id: "ethics",
    title: "الأخلاق والمعاملة",
    blurb: "الصدق والحلم والحياء والتواضع، وحفظ اللسان وصلة الرحم وبر الوالدين.",
    topicSlugs: [
      "ethics",
      "honesty",
      "anger",
      "speech",
      "generosity",
      "humility",
      "modesty",
      "kinship",
      "parents",
    ],
  },
  {
    id: "seerah",
    title: "الصحابة والسيرة",
    blurb: "سِيَر من صحبوا النبي ﷺ، وما نتعلمه من حياتهم ومن سنّته.",
    topicSlugs: ["companions", "women-companions", "promised-paradise", "knowledge-carriers", "prophet", "sunnah-stories"],
  },
  {
    id: "prophets",
    title: "قصص الأنبياء",
    blurb: "قصص القرآن كما وردت فيه، من آدم ونوح إلى إبراهيم ويوسف ولوط.",
    topicSlugs: ["stories", "adam", "nuh", "ibrahim", "yusuf", "lut"],
  },
  {
    id: "life",
    title: "الحياة والمجتمع",
    blurb: "ما يشغلنا كل يوم: الهوية والسوشيال ميديا والعلاقات والصحبة، وقضايا الأمة.",
    topicSlugs: [
      "identity",
      "social-media",
      "relationships",
      "desires",
      "companionship",
      "dawah",
      "palestine",
      "travel",
      "knowledge",
    ],
  },
  {
    id: "waie",
    title: "من داخل وعي",
    blurb: "حلقات مع الجمهور، وحكاية بداية البودكاست.",
    topicSlugs: ["qa", "about-waie"],
  },
];

/** Where strays land -- see the note at the top of this file. */
export const fallbackTopicChapter = {
  id: "more",
  title: "مواضيع أخرى",
  blurb: "مواضيع إضافية من حلقات وعي.",
} as const;
