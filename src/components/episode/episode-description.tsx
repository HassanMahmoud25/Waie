"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, ExternalLink, Headphones, Heart, Link2, Mail, Phone, Share2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  parseEpisodeDescription,
  type DescriptionBlock,
  type DescriptionLinkCategory,
  type DescriptionLinkItem,
  type DescriptionSegment,
} from "@/lib/utils/parse-episode-description";

/** Descriptions taller than this collapse behind a fade + toggle -- short ones render in full with no chrome at all. */
const COLLAPSE_HEIGHT = 320;

const CATEGORY_ICON: Record<DescriptionLinkCategory, typeof Heart> = {
  support: Heart,
  listen: Headphones,
  social: Share2,
  contact: Mail,
  other: Link2,
};

function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

function externalLinkProps(href: string) {
  return isExternalHref(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

function renderSegment(segment: DescriptionSegment, key: string): ReactNode {
  if (segment.kind === "text") return segment.value;
  if (segment.kind === "hashtag") {
    return (
      <span key={key} className="description-hashtag description-hashtag--inline">
        <bdi>#{segment.tag}</bdi>
      </span>
    );
  }
  return (
    <a key={key} href={segment.href} className="description-inline-link" {...externalLinkProps(segment.href)}>
      <bdi>{segment.text}</bdi>
    </a>
  );
}

function LinkRow({ item }: { item: DescriptionLinkItem }) {
  const Icon = item.href.startsWith("tel:") ? Phone : CATEGORY_ICON[item.category];
  return (
    <a href={item.href} className="description-link-row" {...externalLinkProps(item.href)}>
      <span className="description-link-row__icon">
        <Icon size={17} aria-hidden="true" />
      </span>
      <span className="description-link-row__text">
        <span className="description-link-row__label">{item.label}</span>
        <bdi className="description-link-row__secondary">{item.secondary}</bdi>
      </span>
      <ExternalLink className="description-link-row__arrow" size={14} aria-hidden="true" />
    </a>
  );
}

function BlockView({ block }: { block: DescriptionBlock }) {
  if (block.kind === "paragraph") {
    return (
      <p className="description-paragraph">
        {block.lines.map((line, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {line.map((segment, segmentIndex) => renderSegment(segment, `${lineIndex}-${segmentIndex}`))}
          </Fragment>
        ))}
      </p>
    );
  }

  if (block.kind === "hashtags") {
    return (
      <div className="description-hashtags">
        {block.tags.map((tag, i) => (
          <span key={`${tag}-${i}`} className="description-hashtag">
            <bdi>#{tag}</bdi>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="description-links">
      {block.entries.map((entry, i) =>
        entry.kind === "heading" ? (
          <p key={i} className="description-links__heading">
            {entry.text}
          </p>
        ) : (
          <LinkRow key={i} item={entry.item} />
        ),
      )}
    </div>
  );
}

/**
 * Renders a YouTube episode description as structured, premium-feeling
 * content: clickable links, hashtag chips, and grouped support/listen/
 * social/contact rows pulled out of the raw paragraph flow -- instead of
 * one raw text block. Purely a presentation layer over the original text;
 * nothing is added, reworded or removed.
 */
export function EpisodeDescription({ description }: { description: string }) {
  const blocks = useMemo(() => parseEpisodeDescription(description), [description]);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > COLLAPSE_HEIGHT + 8);
  }, [blocks]);

  if (!description.trim()) return null;

  const collapsed = isOverflowing && !isExpanded;

  return (
    <div>
      <div
        ref={contentRef}
        className={cn("description-clamp", collapsed && "description-clamp--collapsed")}
        style={collapsed ? { maxHeight: COLLAPSE_HEIGHT } : undefined}
      >
        {blocks.map((block, i) => (
          <BlockView key={i} block={block} />
        ))}
      </div>
      {isOverflowing && (
        <button
          type="button"
          className="description-toggle"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "عرض أقل" : "قراءة المزيد"}
          <ChevronDown
            size={16}
            className={cn("description-toggle__chevron", isExpanded && "description-toggle__chevron--open")}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}
