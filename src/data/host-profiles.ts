/**
 * Extended editorial profiles for Waie's three hosts — everything beyond the
 * bare `Host` record in data/hosts.ts (bio, content pillars, and a curated
 * set of real videos from each host's own YouTube channel).
 *
 * Sourced by hand from each channel's public "About" page and video list
 * (Sept 2026): youtube.com/@ahmedamercaller, the "شريف علي" channel
 * (UC562PEzdpMULIOtinS79mzw / @sherifali), and youtube.com/@HazemElSeddiq.
 * Subscriber/video counts and view labels are a snapshot from that date —
 * real, not invented, but expected to drift as the channels keep growing.
 */

export type HostVideo = {
  /** YouTube video id — thumbnail and link are both derived from this. */
  id: string;
  title: string;
  /** Which of the host's own content pillars this video represents. */
  pillar: string;
  durationSeconds: number;
  /** View count as displayed by YouTube at research time, e.g. "312K", "1M+". */
  views: string;
};

export type HostProfile = {
  /** Matches `Host.id` in data/hosts.ts. */
  hostId: string;
  channelHandle: string;
  channelUrl: string;
  subscribers: string;
  videoCount: string;
  bio: string;
  /** What they make, in their own words/content — not job-title copy. */
  pillars: { title: string; description: string }[];
  roleInWaie: string;
  videos: HostVideo[];
};

const thumbnail = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

export const hostProfiles: Record<string, HostProfile> = {
  "ahmed-amer": {
    hostId: "ahmed-amer",
    channelHandle: "@ahmedamercaller",
    channelUrl: "https://www.youtube.com/@ahmedamercaller",
    subscribers: "1.27 مليون",
    videoCount: "314",
    bio:
      "صانع محتوى إسلامي يبني قناته حول آية اختارها عنوانًا لمسيرته: \"ومن أحسن قولًا ممن دعا إلى الله وعمل صالحًا\". يجمع بين التأمل الهادئ في القرآن والسيرة، وبين حوارات مفتوحة مع ضيوف من خلفيات مختلفة حول أثر الإيمان في تفاصيل الحياة اليومية.",
    pillars: [
      {
        title: "بودكاست استراحة",
        description:
          "سلسلته الأطول والأكثر انتشارًا — حوارات هادئة ومطوّلة مع ضيوف (قرّاء، أطباء، رياضيون، صنّاع محتوى) حول أثر الإيمان في أزماتهم ومحطات حياتهم.",
      },
      {
        title: "تدبر القرآن ومجالس القرآن",
        description: "دروس منفردة في تدبر سور بعينها — كسورة فاطر — إلى جانب سلسلة \"مجالس القرآن\" الأطول.",
      },
      {
        title: "أصحاب رسول الله ﷺ والسيرة النبوية",
        description: "سلسلتان مخصصتان لسير الصحابة وسيرة النبي ﷺ، بأسلوب حكائي هادئ.",
      },
    ],
    roleInWaie: "أحد المقدّمون الثلاثة المؤسسة لبودكاست وعي، يجلب إلى الحوار عمقًا في القرآن والسيرة ونَفَسًا تأمليًا هادئًا.",
    videos: [
      {
        id: "p_9AXliS6A4",
        title: "بودكاست استراحة - وجدان العلي - العبودية",
        pillar: "استراحة",
        durationSeconds: 9679,
        views: "1M+",
      },
      {
        id: "XctAOzie0L4",
        title: "بودكاست استراحة - أحمد خالد - قصة القرآن",
        pillar: "استراحة",
        durationSeconds: 6504,
        views: "227K",
      },
      {
        id: "Xc6-d6efjC8",
        title: "بودكاست استراحة - يوسف علي - ابتلاء فقد الوالد",
        pillar: "استراحة",
        durationSeconds: 4931,
        views: "221K",
      },
      {
        id: "kEx5hUxyfDE",
        title: "تدبر سورة فاطر (الدرس الأول)",
        pillar: "تدبر القرآن",
        durationSeconds: 3462,
        views: "134K",
      },
      {
        id: "fZAkTGlnspM",
        title: "مجالس القرآن - الدرس الثاني والعشرون - سورة الجن",
        pillar: "مجالس القرآن",
        durationSeconds: 3394,
        views: "120K",
      },
    ],
  },

  "sherif-ali": {
    hostId: "sherif-ali",
    channelHandle: "@sherifali",
    channelUrl: "https://www.youtube.com/@sherifali",
    subscribers: "680 ألف",
    videoCount: "1,292",
    bio:
      "من مصر، وعلى يوتيوب منذ 2014. بدأ بمقاطع مباشرة تخاطب الشباب في علاقاتهم وقراراتهم، ثم تحوّل تدريجيًا إلى دروس ومجالس أكثر تأصيلًا — تعليقًا على كتب التراث وشرحًا لأسماء الله الحسنى وأبواب من صحيح البخاري.",
    pillars: [
      {
        title: "مجالس الشباب",
        description:
          "سلسلته الأساسية اليوم — دروس موجهة مباشرة للشباب، من بينها تعليق مطوّل على كتاب \"الداء والدواء\" لابن القيم.",
      },
      {
        title: "إنه ربي وكتاب الرقاق",
        description: "سلسلتان طويلتان: شرح أسماء الله الحسنى (37 حلقة)، وتعليق على كتاب الرقاق من صحيح البخاري (33 حلقة).",
      },
      {
        title: "سائر بودكاست",
        description: "بودكاست حواري يستضيف فيه ضيوفًا — كالدكتور أحمد جلال والشيخ عادل شوشة — في حديث مفتوح عن الحياة والدين.",
      },
    ],
    roleInWaie: "أحد المقدّمون الثلاثة المؤسسة لبودكاست وعي، عُرف بأسلوبه المباشر في مخاطبة جيل الشباب بقضاياهم الفعلية.",
    videos: [
      {
        id: "4EhYfc_8gyg",
        title: "الصداقة بين الأولاد والبنات",
        pillar: "فيديو مبكر",
        durationSeconds: 776,
        views: "1.5M",
      },
      {
        id: "lxAfNwYriME",
        title: "ماذا تفعل الذنوب بالإنسان؟ - التعليق على كتاب الداء والدواء (1) - مجالس الشباب",
        pillar: "مجالس الشباب",
        durationSeconds: 4065,
        views: "312K",
      },
      {
        id: "7F0aZYJf4_0",
        title: "لماذا أحبَّهُ أصحابُه ﷺ؟ - مجالس الشباب",
        pillar: "مجالس الشباب",
        durationSeconds: 4983,
        views: "129K",
      },
      {
        id: "Or-1i7Ui228",
        title: "نصائح مهمة في الخطوبة",
        pillar: "فيديو مبكر",
        durationSeconds: 1139,
        views: "658K",
      },
      {
        id: "BWznoaF_JpM",
        title: "كيف نتعامل مع الدنيا؟ - سائر",
        pillar: "سائر بودكاست",
        durationSeconds: 6188,
        views: "58K",
      },
    ],
  },

  "hazem-elseddiq": {
    hostId: "hazem-elseddiq",
    channelHandle: "@HazemElSeddiq",
    channelUrl: "https://www.youtube.com/@HazemElSeddiq",
    subscribers: "730 ألف",
    videoCount: "634",
    bio:
      "من مصر، وعلى يوتيوب منذ 2011 — من أطول صنّاع المحتوى العرب حضورًا في هذه المساحة. يمزج بين بودكاست حواري طويل النفس ومحتوى حياة شخصي (السفر، البيت، القهوة)، مع مقالات مصوّرة قصيرة تعيد التفكير في عبارات وأفكار دينية شائعة من زاوية معاصرة.",
    pillars: [
      {
        title: "HazCast",
        description: "بودكاست حواري يديره منذ سنوات — ضيوفه مصممون ورياديون وأصحاب حِرف، في أحاديث مطوّلة عن الحياة والصنعة والمعنى.",
      },
      {
        title: "London Vlog",
        description: "سلسلة فلوق حديثة توثّق تفاصيل الانتقال والعيش في لندن — طعامًا وأدوات وأناسًا.",
      },
      {
        title: "مقالات مصوّرة قصيرة",
        description: "مثل \"حقيقة المتدينين اللي ماحدش يعرفها\" و\"المسلم المحترف\" و\"الرجولة والالتزام\" — إعادة نظر في مفاهيم شائعة.",
      },
    ],
    roleInWaie: "أحد المقدّمون الثلاثة المؤسسة لبودكاست وعي، يجلب حِرفة الحوار الطويل وزاوية حياتية معاصرة اكتسبها من سنوات إدارة HazCast.",
    videos: [
      {
        id: "KY2KFf3swFU",
        title: "HazCast #50 | Peter Gould talks about design, being a global Muslim and creating Tales of Khayal",
        pillar: "HazCast",
        durationSeconds: 5713,
        views: "17K",
      },
      {
        id: "ZYRq1vYEl28",
        title: "HazCast #49 | @ItsBandage on his career as a paramedic and deep talks about life",
        pillar: "HazCast",
        durationSeconds: 4951,
        views: "41K",
      },
      {
        id: "y-LmKqUrxZY",
        title: "حقيقة المتدينين اللي ماحدش يعرفها",
        pillar: "مقالات قصيرة",
        durationSeconds: 253,
        views: "105K",
      },
      {
        id: "7ZoVxEbJvHs",
        title: "الرجولة والالتزام",
        pillar: "مقالات قصيرة",
        durationSeconds: 316,
        views: "95K",
      },
      {
        id: "3uIG-7xTJkM",
        title: "London Vlog 01 | Landing in London",
        pillar: "London Vlog",
        durationSeconds: 882,
        views: "19K",
      },
    ],
  },
};

export const getHostProfile = (hostId: string): HostProfile | undefined => hostProfiles[hostId];
export const getHostVideoThumbnail = thumbnail;
