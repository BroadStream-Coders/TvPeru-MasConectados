"use client";

import { useState, type ElementType, type ReactNode } from "react";

interface LevelTab {
  name: string;
  icon: ElementType;
  content: ReactNode;
}

export function LevelTabs({ levels }: { levels: LevelTab[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex h-full">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {levels.map((level, index) => (
          <div
            key={level.name}
            role="tabpanel"
            hidden={activeIndex !== index}
            className="absolute inset-0"
          >
            {level.content}
          </div>
        ))}
      </div>

      <div
        role="tablist"
        aria-label="Secciones"
        className="flex shrink-0 flex-col overflow-y-auto border-l border-border bg-card"
      >
        {levels.map((level, index) => {
          const active = activeIndex === index;
          const Icon = level.icon;
          return (
            <button
              key={level.name}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveIndex(index)}
              className={`flex shrink-0 flex-col items-center gap-2 border-r-2 px-2 py-4 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:-outline-offset-2 ${
                active
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5 shrink-0" />
              <span
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ writingMode: "vertical-lr" }}
              >
                {level.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
