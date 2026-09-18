import type { Topic } from "@/types/topic";

/**
 * One topic per real series identified on the Waie YouTube channel (see
 * data/series.ts). `color` is a purely presentational choice (used for the
 * topic tile accent) and isn't part of the imported YouTube data.
 */
export const topics: Topic[] = [
  {
    id: "topic-companions",
    slug: "companions",
    title: "الصحابة",
    description: "رحلة في سيرة الصحابة ومواقفهم، وما تحمله حياتهم من دروس.",
    color: "#d6ad70",
  },
  {
    id: "topic-stories",
    slug: "stories",
    title: "القصص",
    description: "أحسن القصص كما وردت في القرآن، وما تحمله من عبرة.",
    color: "#91a4c2",
  },
  {
    id: "topic-worship-seasons",
    slug: "worship-seasons",
    title: "مواسم العبادات",
    description: "محطات العام التعبدية: رمضان، الحج، وعشر ذي الحجة.",
    color: "#7ea89b",
  },
  {
    id: "topic-ethics",
    slug: "ethics",
    title: "الأخلاق",
    description: "القيم والأخلاق وأثرها في الفرد والمجتمع.",
    color: "#c6a5bb",
  },
  {
    id: "topic-commitment",
    slug: "commitment",
    title: "التدين والالتزام",
    description: "معنى الالتزام الديني وكيفية بنائه خطوة بخطوة.",
    color: "#ba886b",
  },
];
