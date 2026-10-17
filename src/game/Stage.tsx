"use client";

import { useEffect, useState, type ReactNode, type RefObject } from "react";

interface StageProps {
  children: ReactNode;
  containerRef: RefObject<HTMLDivElement | null>;
}

export function Stage({ children, containerRef }: StageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pointerVisible, setPointerVisible] = useState(true);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.code !== "KeyP") return;
      event.preventDefault();
      setPointerVisible((visible) => !visible);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      onContextMenu={(event) => event.preventDefault()}
      className={`relative flex touch-none items-center justify-center overflow-hidden bg-black outline-none select-none [container-type:size] ${
        isFullscreen ? "h-screen w-screen" : "min-h-0 w-full flex-1"
      } ${isFullscreen && !pointerVisible ? "cursor-none [&_*]:cursor-none" : ""}`}
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
