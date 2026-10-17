"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRightLeft, ImageIcon, Shuffle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cardAspect, type PairData } from "./schema";

interface Tab2Props {
  boardOrder: string[];
  setBoardOrder: React.Dispatch<React.SetStateAction<string[]>>;
  pairsData: Record<number, PairData>;
}

function CardPreview({
  cardId,
  pairsData,
}: {
  cardId: string;
  pairsData: Record<number, PairData>;
}) {
  const [pairIdx, side] = cardId.split("_");
  const pair = pairsData[Number(pairIdx) + 1];
  const card = side === "A" ? pair?.cartaA : pair?.cartaB;

  if (!card) {
    return (
      <div className="flex h-full items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
        Vacío
      </div>
    );
  }

  const showImage = card.mode === "image" || card.mode === "both";
  const showText = card.mode === "text" || card.mode === "both";

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-md border bg-background">
      {showImage && (
        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-card">
          {card.image.url ? (
            <Image
              src={card.image.url}
              alt="Carta"
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <ImageIcon className="size-6 opacity-30" />
          )}
        </div>
      )}
      {showText && (
        <div
          className={`flex items-center justify-center bg-muted/20 p-2 text-center text-xs font-medium ${showImage ? "shrink-0 border-t" : "h-full"}`}
        >
          <span className="line-clamp-3 break-all leading-snug">
            {card.text || "Sin texto"}
          </span>
        </div>
      )}
    </div>
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
    setBoardOrder((prev) => {
      const next = [...prev];
      const ia = next.indexOf(a);
      const ib = next.indexOf(b);
      next[ia] = b;
      next[ib] = a;
      return next;
    });
    setSelected([]);
  };

  const shuffle = () => {
    setBoardOrder((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });
    setSelected([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <h2 className="text-lg font-bold">Tablero de juego</h2>
          <p className="text-sm text-muted-foreground">
            Aleatoriza el orden o elige dos cartas para intercambiarlas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={shuffle}>
            <Shuffle />
            Aleatorizar
          </Button>
          <Button
            variant={selected.length === 2 ? "default" : "secondary"}
            onClick={swap}
            disabled={selected.length !== 2}
          >
            <ArrowRightLeft />
            Intercambiar
          </Button>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[950px] grid-cols-5 gap-3">
        {boardOrder.map((cardId, index) => (
          <button
            key={cardId}
            type="button"
            onClick={() => toggle(cardId)}
            className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 text-left transition-all ${
              selected.includes(cardId)
                ? "z-10 scale-105 border-primary bg-primary/5 shadow-lg"
                : "border-border/60 hover:border-primary/40 hover:bg-muted/50"
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground">
                {index + 1}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                {cardId}
              </span>
            </div>
            <div className="w-full" style={cardAspect}>
              <CardPreview cardId={cardId} pairsData={pairsData} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
