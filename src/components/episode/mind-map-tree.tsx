import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { MindMap, MindMapNode } from "@/types/mind-map";
import { TimestampButton } from "./timestamp-button";
import { EmptyState } from "@/components/content/empty-state";

const depthTextClass = ["text-xl font-black", "text-base font-bold", "text-sm font-bold text-[var(--ink-soft)]"];

function labelClassForDepth(depth: number) {
  return depthTextClass[Math.min(depth, depthTextClass.length - 1)];
}

function MindMapNodeItem({ node, depth }: { node: MindMapNode; depth: number }) {
  const hasChildren = node.children.length > 0;
  const labelContent = (
    <>
      <span className={labelClassForDepth(depth)}>{node.label}</span>
      {typeof node.timestampSeconds === "number" && <TimestampButton seconds={node.timestampSeconds} />}
    </>
  );

  if (!hasChildren) {
    return (
      <li className="mind-map-node">
        <div className={cn("mind-map-node__label", "cursor-default")}>{labelContent}</div>
        {node.description && <p className="mind-map-node__description">{node.description}</p>}
      </li>
    );
  }

  return (
    <li className="mind-map-node">
      <details open={depth < 2} className="mind-map-node__details">
        <summary className="mind-map-node__label">
          <ChevronDown size={16} className="mind-map-node__chevron" aria-hidden="true" />
          {labelContent}
        </summary>
        {node.description && <p className="mind-map-node__description">{node.description}</p>}
        <ul className="mind-map-node__children">
          {node.children.map((child) => (
            <MindMapNodeItem node={child} depth={depth + 1} key={child.id} />
          ))}
        </ul>
      </details>
    </li>
  );
}

/**
 * The "خريطة الحلقة" tab. Rendered as a native <details>-based nested tree:
 * expand/collapse comes for free from the browser, and the same markup
 * works as a desktop tree and a mobile accordion without a separate
 * fallback UI or a canvas/pan-zoom dependency.
 */
export function MindMapTree({ mindMap }: { mindMap: MindMap | null }) {
  if (!mindMap) {
    return <EmptyState title="خريطة الحلقة قيد الإعداد." />;
  }

  return (
    <div className="mind-map">
      <ul className="mind-map-tree">
        <MindMapNodeItem node={mindMap.root} depth={0} />
      </ul>
    </div>
  );
}
