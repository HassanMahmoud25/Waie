import Image from "next/image";
import { ArrowUpLeft, BookMarked, BookOpen, Clapperboard, FlaskConical, Globe, Newspaper, Package, Podcast, Sparkles, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Recommendation, RecommendationType } from "@/types/recommendation";
import { FacebookGlyph, InstagramGlyph, SoundcloudGlyph, YoutubeGlyph } from "@/components/icons/platform-glyphs";
import { TimestampButton } from "./timestamp-button";
import { EmptyState } from "@/components/content/empty-state";
import { cn } from "@/lib/utils/cn";

type IconComponent = LucideIcon | typeof YoutubeGlyph;

/** Exported so the admin Recommendations editor (Phase 5I) reuses the exact same labels/icons instead of a second, drift-prone copy -- the editor never renders with this map, it only reads labels/icons from it. */
export const typeMeta: Record<RecommendationType, { label: string; icon: IconComponent; cta: string }> = {
  YOUTUBE: { label: "فيديو", icon: YoutubeGlyph, cta: "مشاهدة الفيديو" },
  SOUNDCLOUD: { label: "مقطع صوتي", icon: SoundcloudGlyph, cta: "استماع الآن" },
  PODCAST: { label: "بودكاست", icon: Podcast, cta: "استماع للحلقة" },
  FACEBOOK: { label: "منشور", icon: FacebookGlyph, cta: "مشاهدة المنشور" },
  INSTAGRAM: { label: "محتوى مرئي", icon: InstagramGlyph, cta: "مشاهدة المحتوى" },
  BOOK: { label: "كتاب", icon: BookOpen, cta: "المزيد عن الكتاب" },
  WEBSITE: { label: "مقال / موقع", icon: Newspaper, cta: "قراءة المزيد" },
  EXTERNAL: { label: "مصدر خارجي", icon: Globe, cta: "زيارة الرابط" },
  MOVIE: { label: "فيلم", icon: Clapperboard, cta: "مشاهدة الفيلم" },
  PERSON: { label: "شخصية", icon: UserRound, cta: "المزيد عنه" },
  PRODUCT: { label: "منتج", icon: Package, cta: "عرض المنتج" },
  STUDY: { label: "دراسة", icon: FlaskConical, cta: "قراءة الدراسة" },
  REFERENCE: { label: "مرجع", icon: BookMarked, cta: "عرض المرجع" },
};

/**
 * The "التوصيات" tab: a curated shelf of everything mentioned in the episode
 * worth watching, reading, listening to or visiting next -- one shared card
 * shape for every source (YouTube, SoundCloud, a book, a social post, a
 * plain link), differentiated only by its icon, label and call-to-action.
 */
export function RecommendationsPanel({ recommendations }: { recommendations: Recommendation[] }) {
  if (recommendations.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="لم تُضَف توصيات لهذه الحلقة بعد."
        description="الكتب والروابط والمحتوى الذي يُذكر في الحلقة سيظهر هنا."
      />
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {recommendations.map((recommendation) => (
        <RecommendationCard key={recommendation.id} recommendation={recommendation} />
      ))}
    </ul>
  );
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const meta = typeMeta[recommendation.type];
  const Icon = meta.icon;
  const context = recommendation.reason || recommendation.description;
  const metadataEntries = recommendation.metadata ? Object.values(recommendation.metadata).filter(Boolean) : [];
  const isLinked = Boolean(recommendation.url);

  return (
    <li className={cn("recommendation-card", isLinked && "recommendation-card--linked")}>
      <div
        className={cn(
          "recommendation-card__media",
          !recommendation.imageUrl && "recommendation-card__media--icon-only",
        )}
      >
        {recommendation.imageUrl ? (
          <>
            <Image
              src={recommendation.imageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1280px) 45vw, 360px"
              className="object-cover"
            />
            <span className="recommendation-card__badge">
              <Icon size={17} aria-hidden="true" />
            </span>
          </>
        ) : (
          <span className="recommendation-card__icon-circle">
            <Icon size={26} aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="recommendation-card__body">
        <div className="recommendation-card__type">
          <Icon size={13} className="shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">
            {meta.label}
            {recommendation.source && ` · ${recommendation.source}`}
            {metadataEntries.length > 0 && ` · ${metadataEntries.join(" · ")}`}
          </span>
        </div>

        <h3 className="recommendation-card__title line-clamp-2">
          {isLinked ? (
            <a
              href={recommendation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="recommendation-card__title-link"
            >
              {recommendation.title}
            </a>
          ) : (
            recommendation.title
          )}
        </h3>

        {recommendation.author && (
          <p className="recommendation-card__author line-clamp-1">بقلم {recommendation.author}</p>
        )}

        {context && <p className="recommendation-card__context line-clamp-2">{context}</p>}

        {(typeof recommendation.timestampSeconds === "number" || isLinked) && (
          <div className="recommendation-card__footer">
            {typeof recommendation.timestampSeconds === "number" ? (
              <span className="recommendation-card__timestamp">
                <TimestampButton seconds={recommendation.timestampSeconds} />
              </span>
            ) : (
              <span />
            )}
            {isLinked && (
              <span className="recommendation-card__cta">
                {meta.cta}
                <ArrowUpLeft size={14} aria-hidden="true" />
              </span>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
