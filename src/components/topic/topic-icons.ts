import {
  BadgeCheck,
  BookMarked,
  BookOpen,
  Building2,
  CalendarDays,
  CloudRain,
  Coins,
  Compass,
  DoorOpen,
  EyeOff,
  Feather,
  Fingerprint,
  Flame,
  Flower2,
  Footprints,
  Gift,
  GraduationCap,
  HandHeart,
  Handshake,
  Heart,
  HeartHandshake,
  Hourglass,
  Landmark,
  Leaf,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Mic2,
  MoonStar,
  Mountain,
  Plane,
  Repeat,
  RotateCcw,
  Scale,
  Scroll,
  ScrollText,
  ShieldCheck,
  Ship,
  Smartphone,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Sunrise,
  Tag,
  TreePalm,
  Users,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * A recognisable glyph per topic (keyed by slug): Nuh gets his ship, Ibrahim
 * the fire, Yusuf the star from his dream, Arafah its mountain. A topic added
 * later without an entry falls back to the tag icon the site already uses for
 * "topic" everywhere else (hero stats, admin nav).
 */
const TOPIC_ICONS: Record<string, LucideIcon> = {
  // Worship
  "worship-seasons": CalendarDays,
  ramadan: MoonStar,
  "dhul-hijjah": Mountain,
  prayer: Sunrise,
  dua: HandHeart,
  quran: BookOpen,
  steadfastness: Repeat,
  // Heart and the road to Allah
  commitment: Footprints,
  "self-purification": Sparkles,
  repentance: RotateCcw,
  trials: CloudRain,
  satan: DoorOpen,
  dunya: Coins,
  afterlife: Hourglass,
  // Character
  ethics: Scale,
  honesty: BadgeCheck,
  anger: Zap,
  speech: MessageCircle,
  generosity: Gift,
  humility: Sprout,
  modesty: ShieldCheck,
  kinship: Handshake,
  parents: HeartHandshake,
  // Companions and the Sunnah
  companions: Users,
  "women-companions": Flower2,
  "promised-paradise": TreePalm,
  "knowledge-carriers": BookMarked,
  prophet: Sun,
  "sunnah-stories": Scroll,
  // Stories of the prophets
  stories: ScrollText,
  adam: Leaf,
  nuh: Ship,
  ibrahim: Flame,
  yusuf: Star,
  lut: Building2,
  // Life and society
  identity: Fingerprint,
  "social-media": Smartphone,
  relationships: Heart,
  desires: EyeOff,
  companionship: UsersRound,
  dawah: Megaphone,
  palestine: Landmark,
  travel: Plane,
  knowledge: GraduationCap,
  // From inside Waie
  qa: MessagesSquare,
  "about-waie": Mic2,
};

export function getTopicIcon(slug: string): LucideIcon {
  return TOPIC_ICONS[slug] ?? Tag;
}

/** One emblem per chapter (keyed by chapter id, see data/topic-chapters.ts). */
const CHAPTER_ICONS: Record<string, LucideIcon> = {
  worship: MoonStar,
  heart: Compass,
  ethics: Feather,
  seerah: Users,
  prophets: ScrollText,
  life: MessageCircle,
  waie: Mic2,
};

export function getChapterIcon(id: string): LucideIcon {
  return CHAPTER_ICONS[id] ?? Tag;
}
