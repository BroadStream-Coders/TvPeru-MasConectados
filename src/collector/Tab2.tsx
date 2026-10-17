"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRightLeft, ImageOff, Shuffle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BOARD, GRAPHICS, cardPosition, px } from "@/game/design";
import { shuffle, type PairsData } from "./schema";

interface Tab2Props {
  boardOrder: string[];
  setBoardOrder: React.Dispatch<React.SetStateAction<string[]>>;
  pairsData: PairsData;
}

function Graphic({ src, className = "" }: { src: string; className?: string }) {
  return (
    <Image
      src={src}
      alt=""
      fill
      unoptimized
      draggable={false}
      className={`pointer-events-none ${className}`}
    />
  );
}

export function Tab2({ boardOrder, setBoardOrder, pairsData }: Tab2Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (cardId: string) => {
    setSelected((prev) => {
      if (prev.includes(cardId)) return prev.filter((id) => id !== cardId);
      if (prev.length >= 2) return [prev[1], cardId];
      return [...prev, cardId];
    });
  };

  const swap = () => {
    if (selected.length !== 2) return;
    const [a, b] = selected;
    setBoardOrder((prev) =>
      prev.map((id) => (id === a ? b : id === b ? a : id)),
    );
    setSelected([]);
  };

  const randomize = () => {
    setBoardOrder(shuffle(boardOrder));
    setSelected([]);
  };

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-base font-semibold">
            Tablero de juego
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            Así se reparten las cartas en pantalla. Elige dos cartas para
            intercambiarlas.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={randomize}>
          <Shuffle />
          Aleatorizar
        </Button>
        <Button
          variant={selected.length === 2 ? "default" : "secondary"}
          size="sm"
          onClick={swap}
          disabled={selected.length !== 2}
        >
          <ArrowRightLeft />
          Intercambiar {selected.length === 1 && "(falta 1)"}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center [container-type:size]">
        <div
          className="relative aspect-video overflow-hidden rounded-xl shadow-[0_18px_40px_-20px_rgb(0_0_0/0.35)] ring-1 ring-border [container-type:size]"
          style={{ width: "min(100cqi, 100cqb * 16 / 9)" }}
        >
          <Graphic src={GRAPHICS.background} />
          {boardOrder.map((cardId, i) => {
            const { left, top } = cardPosition(i);
            const pairNum = Number(cardId.split("_")[0]) + 1;
            const url = pairsData[pairNum]?.cardA.image.url;
            const isSelected = selected.includes(cardId);

            return (
              <button
                key={cardId}
                type="button"
                aria-label={`Carta ${i + 1}, par ${pairNum}`}
                aria-pressed={isSelected}
                onClick={() => toggle(cardId)}
                className={`absolute cursor-pointer rounded-[1.6cqw] outline-none transition-transform duration-200 focus-visible:ring-[0.3cqw] focus-visible:ring-ring ${
                  isSelected
                    ? "z-10 scale-[1.06] ring-[0.35cqw] ring-primary ring-offset-[0.2cqw]"
                    : "hover:scale-[1.03]"
                }`}
                style={{
                  left: px(left),
                  top: px(top),
                  width: px(BOARD.cell.width),
                  height: px(BOARD.cell.height),
                }}
              >
                <Graphic src={GRAPHICS.front[i % 2]} />
                <div
                  className="absolute top-1/2 left-1/2 flex -translate-1/2 items-center justify-center bg-white"
                  style={{
                    width: px(BOARD.setter.width),
                    height: px(BOARD.setter.height),
                    maskImage: `url(${GRAPHICS.mask})`,
                    maskSize: "100% 100%",
                    WebkitMaskImage: `url(${GRAPHICS.mask})`,
                    WebkitMaskSize: "100% 100%",
                  }}
                >
                  {url ? (
                    <Graphic src={url} className="object-contain" />
                  ) : (
                    <span className="flex flex-col items-center gap-[0.4cqw] text-[1.1cqw] font-medium text-muted-foreground">
                      <ImageOff className="size-[2.2cqw]" />
                      Sin imagen
                    </span>
                  )}
                </div>
                <span className="absolute top-[0.6cqw] left-[0.6cqw] flex size-[2.6cqw] items-center justify-center rounded-full bg-black/55 font-heading text-[1.2cqw] font-bold text-white">
                  {i + 1}
                </span>
                <span className="absolute right-[0.6cqw] bottom-[0.6cqw] rounded-full bg-white/90 px-[0.7cqw] py-[0.15cqw] font-heading text-[1cqw] font-semibold text-foreground/80">
                  Par {pairNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
