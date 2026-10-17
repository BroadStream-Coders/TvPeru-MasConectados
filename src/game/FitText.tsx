"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";

import { px } from "./design";

interface FitTextProps {
  text: string;
  min: number;
  max: number;
  className?: string;
  style?: CSSProperties;
}

export function FitText({ text, min, max, className, style }: FitTextProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const el = textRef.current;
    if (!box || !el) return;

    const fits = (size: number) => {
      el.style.fontSize = px(size);
      return (
        el.scrollHeight <= box.clientHeight + 0.5 &&
        el.scrollWidth <= box.clientWidth + 0.5
      );
    };

    const measure = () => {
      if (box.clientWidth === 0 || box.clientHeight === 0) return;
      if (fits(max)) return;
      let best = min;
      let lo = min;
      let hi = max;
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        if (fits(mid)) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }
      el.style.fontSize = px(best);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [text, min, max]);

  return (
    <div
      ref={boxRef}
      className="flex h-full w-full items-center justify-center overflow-hidden"
    >
      <div
        ref={textRef}
        className={className}
        style={{
          minWidth: 0,
          fontSize: px(max),
          lineHeight: "normal",
          textAlign: "center",
          whiteSpace: "pre-wrap",
          ...style,
        }}
      >
        {text}
      </div>
    </div>
  );
}
