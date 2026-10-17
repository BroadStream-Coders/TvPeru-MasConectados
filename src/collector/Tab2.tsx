"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRightLeft, ImageIcon, Shuffle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cardAspect, cardKey, shuffle, type PairsData } from "./schema";

interface Tab2Props {
  boardOrder: string[];
  setBoardOrder: React.Dispatch<React.SetStateAction<string[]>>;
  pairsData: PairsData;
}

function CardPreview({
  cardId,
  pairsData,
}: {
  cardId: string;
  pairsData: PairsData;
}) {
  const [pairIdx, side] = cardId.split("_");
  const card = pairsData[Number(pairIdx) + 1]?.[cardKey(side as "A" | "B")];

  if (!card) {
    return (
      <div className="flex h-full items-center justify-center rounded-md border border-dashed border-border/50 text-xs text-muted-foreground">
        Vacío
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-center overflow-hidden rounded-md border border-border/50 bg-background">
      {card.mode !== "text" && (
        <div
          className={`relative flex items-center justify-center bg-card ${card.mode === "both" ? "min-h-0 flex-1 border-b border-border/40" : "h-full w-full"}`}
        >
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
      {card.mode !== "image" && (
        <div
          className={`flex items-center justify-center bg-muted/20 p-2 text-center text-xs font-medium ${card.mode === "both" ? "min-h-10 shrink-0" : "h-full w-full"}`}
        >
          <span className="line-clamp-3 leading-snug break-all">
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
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">
            Tablero de juego
          </h2>
          <p className="text-sm text-muted-foreground">
            Así se reparten las cartas en pantalla. Aleatoriza o elige dos
            cartas para intercambiarlas.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
      </div>

      <div className="flex flex-1 items-center justify-center pb-4">
        <div className="grid w-full max-w-[950px] grid-cols-5 gap-3">
          {boardOrder.map((cardId, index) => {
            const isSelected = selected.includes(cardId);
            const [pairIdx, side] = cardId.split("_");
            return (
              <button
                key={cardId}
                type="button"
                onClick={() => toggle(cardId)}
                className={`relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-all ${
                  isSelected
                    ? "z-10 scale-105 border-primary bg-primary/5 shadow-lg shadow-primary/30"
                    : "border-border/60 hover:border-primary/40 hover:bg-muted/50"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="text-[9px] font-bold tracking-wider text-foreground/50 uppercase">
                    Par {Number(pairIdx) + 1} · {side}
                  </span>
                </div>
                <div className="w-full" style={cardAspect}>
                  <CardPreview cardId={cardId} pairsData={pairsData} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
