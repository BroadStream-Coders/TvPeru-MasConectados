"use client";

import { useEffect, useState, type ReactNode, type RefObject } from "react";

interface StageProps {
  children: ReactNode;
  containerRef: RefObject<HTMLDivElement | null>;
}

export function Stage({ children, containerRef }: StageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      onContextMenu={(event) => event.preventDefault()}
      className={`relative flex touch-none items-center justify-center overflow-hidden bg-black outline-none select-none [container-type:size] ${
        isFullscreen ? "h-screen w-screen" : "min-h-0 w-full flex-1"
      }`}
    >
      <div
        className="relative aspect-video overflow-hidden [container-type:size]"
        style={
          isFullscreen
            ? { height: "100%", width: "auto", maxWidth: "100%" }
            : { width: "min(100cqi, 100cqb * 16 / 9)" }
        }
      >
        {children}
      </div>
    </div>
  );
}

export async function toggleFullscreen(element: HTMLElement | null) {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }
  await element?.requestFullscreen();
  element?.focus();
}
