"use client";

import { ReactNode, useState } from "react";
import clsx from "classnames";

type TabsProps = {
  tabs: Array<{ id: string; label: string }>;
  initialTabId?: string;
  children: ReactNode;
};

type TabContextValue = {
  activeTab: string;
};

function getDefaultTab(tabs: TabsProps["tabs"], initial?: string) {
  if (initial && tabs.some((tab) => tab.id === initial)) {
    return initial;
  }
  return tabs[0]?.id ?? "";
}

function matchPanelChildren(children: ReactNode, activeTab: string) {
  const panels: ReactNode[] = [];
  if (!children) return panels;

  const childArray = Array.isArray(children) ? children : [children];
  for (const child of childArray) {
    if (!child) continue;
    if (typeof child === "object" && "props" in child) {
      const panelProps = (child as any).props as { id?: string };
      if (panelProps?.id === activeTab) {
        panels.push(child);
      }
    }
  }
  return panels;
}

function TabsContainer({ tabs, initialTabId, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(getDefaultTab(tabs, initialTabId));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={clsx(
              "rounded-t-md px-4 py-2 text-sm font-medium transition",
              activeTab === tab.id
                ? "bg-white text-primary-600 shadow-inner"
                : "text-slate-500 hover:text-primary-500"
            )}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {matchPanelChildren(children, activeTab)}
      </div>
    </div>
  );
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  return <div data-tab-panel={id}>{children}</div>;
}

export const Tabs = Object.assign(TabsContainer, { Panel: TabPanel });
