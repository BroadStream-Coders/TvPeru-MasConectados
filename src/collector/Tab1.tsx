"use client";

import { Copy } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImagePicker } from "./ImagePicker";
import {
  CARD_OUTPUT_WIDTH,
  CARD_RATIO,
  PAIRS,
  cardAspect,
  cardKey,
  createEmptyCard,
  createEmptyPair,
  type CardContent,
  type CardMode,
  type CardSide,
  type PairsData,
} from "./schema";
import { clearSlotImage, setSlotImage } from "./slot";

interface Tab1Props {
  pairsData: PairsData;
  setPairsData: React.Dispatch<React.SetStateAction<PairsData>>;
  onError: (message: string, cause: unknown) => void;
}

const pairNumbers = Array.from({ length: PAIRS }, (_, i) => i + 1);

const MODES: Record<CardMode, string> = {
  image: "Solo imagen",
  text: "Solo texto",
  both: "Ambos",
};

export function Tab1({ pairsData, setPairsData, onError }: Tab1Props) {
  const update = (
    pairNum: number,
    side: CardSide,
    change: (card: CardContent) => Partial<CardContent>,
  ) => {
    setPairsData((prev) => {
      const pair = prev[pairNum] ?? createEmptyPair();
      const key = cardKey(side);
      return {
        ...prev,
        [pairNum]: { ...pair, [key]: { ...pair[key], ...change(pair[key]) } },
      };
    });
  };

  const renderCard = (pairNum: number, side: CardSide) => {
    const { mode, image, text } =
      pairsData[pairNum]?.[cardKey(side)] ?? createEmptyCard();

    return (
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg border border-border/50 bg-muted/30 p-1.5">
        <div className="flex shrink-0 flex-col items-start justify-between gap-1 2xl:flex-row 2xl:items-center">
          <span className="ml-1 text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
            Carta {side}
          </span>
          <Select
            items={MODES}
            value={mode}
            onValueChange={(value) =>
              value && update(pairNum, side, () => ({ mode: value as CardMode }))
            }
          >
            <SelectTrigger className="h-7 w-24 border-border bg-card p-2 py-0 text-[10px] hover:bg-card/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MODES).map(([value, label]) => (
                <SelectItem key={value} value={value} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          {mode !== "text" && (
            <ImagePicker
              file={image.file}
              url={image.url}
              sourceUrl={image.sourceUrl}
              ratio={CARD_RATIO}
              maxWidth={CARD_OUTPUT_WIDTH}
              onChange={(file, url, sourceUrl) =>
                update(pairNum, side, (c) => ({
                  image: setSlotImage(c.image, file, url, sourceUrl),
                }))
              }
              onClear={() =>
                update(pairNum, side, (c) => ({
                  image: clearSlotImage(c.image),
                }))
              }
              onError={onError}
            />
          )}

          {mode === "both" && (
            <Input
              value={text}
              onChange={(e) =>
                update(pairNum, side, () => ({ text: e.target.value }))
              }
              placeholder="Texto corto"
              className="h-8 w-full shrink-0 bg-card text-xs"
            />
          )}
          {mode === "text" && (
            <Textarea
              value={text}
              onChange={(e) =>
                update(pairNum, side, () => ({ text: e.target.value }))
              }
              placeholder="Escribe el texto aquí"
              style={cardAspect}
              className="field-sizing-fixed min-h-0 w-full resize-none bg-card text-xs"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-6 pb-12">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pairNumbers.map((pairNum) => (
          <Card
            key={pairNum}
            className="flex flex-col gap-3 border-border/80 bg-card/40 p-3 shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-border/50 pb-1.5 text-sm font-bold text-foreground/90">
              <Copy className="size-4 text-primary" />
              Par {pairNum}
            </div>
            <div className="flex gap-2">
              {renderCard(pairNum, "A")}
              {renderCard(pairNum, "B")}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
