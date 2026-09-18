"use client";

import { createContext, useContext, useId, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type TabsContextValue = {
  activeId: string;
  setActiveId: (id: string) => void;
  idBase: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Tabs>`);
  }
  return context;
}

export type TabsProps = {
  defaultActiveId: string;
  activeId?: string;
  onActiveChange?: (id: string) => void;
  children: ReactNode;
  className?: string;
};

/**
 * Accessible tabs primitive following the WAI-ARIA tabs pattern
 * (roving tabindex, arrow/home/end key navigation, RTL-aware).
 * Can be used controlled (pass `activeId` + `onActiveChange`) or
 * uncontrolled (only `defaultActiveId`).
 */
export function Tabs({ defaultActiveId, activeId: controlledActiveId, onActiveChange, children, className }: TabsProps) {
  const idBase = useId();
  const [internalActiveId, setInternalActiveId] = useState(defaultActiveId);
  const activeId = controlledActiveId ?? internalActiveId;

  const setActiveId = (id: string) => {
    setInternalActiveId(id);
    onActiveChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeId, setActiveId, idBase }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, "aria-label": ariaLabel, className }: { children: ReactNode; "aria-label": string; className?: string }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("tab-list", className)}>
      {children}
    </div>
  );
}

export function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { activeId, setActiveId, idBase } = useTabsContext("Tab");
  const isActive = activeId === id;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const tabList = event.currentTarget.closest('[role="tablist"]');
    const tabs = Array.from(tabList?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
    const index = tabs.indexOf(event.currentTarget);
    if (index === -1) return;

    const isRTL = typeof document !== "undefined" && document.documentElement.dir === "rtl";
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = isRTL ? index - 1 : index + 1;
    else if (event.key === "ArrowLeft") nextIndex = isRTL ? index + 1 : index - 1;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex === null) return;
    event.preventDefault();
    const target = tabs[(nextIndex + tabs.length) % tabs.length];
    target?.focus();
    target?.click();
  };

  return (
    <button
      type="button"
      role="tab"
      id={`${idBase}-tab-${id}`}
      aria-selected={isActive}
      aria-controls={`${idBase}-panel-${id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveId(id)}
      onKeyDown={handleKeyDown}
      className={cn("tab-trigger", isActive && "tab-trigger--active")}
    >
      {children}
    </button>
  );
}

export function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { activeId, idBase } = useTabsContext("TabPanel");
  if (activeId !== id) return null;

  return (
    <div role="tabpanel" id={`${idBase}-panel-${id}`} aria-labelledby={`${idBase}-tab-${id}`} tabIndex={0}>
      {children}
    </div>
  );
}
