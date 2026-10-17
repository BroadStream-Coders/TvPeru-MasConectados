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
  createEmptyCard,
  createEmptyPair,
  type CardContent,
  type CardMode,
  type PairData,
} from "./schema";
import { clearSlotImage, setSlotImage } from "./slot";

interface Tab1Props {
  pairsData: Record<number, PairData>;
  setPairsData: React.Dispatch<React.SetStateAction<Record<number, PairData>>>;
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
    side: "A" | "B",
    change: (card: CardContent) => Partial<CardContent>,
  ) => {
    setPairsData((prev) => {
      const pair = prev[pairNum] ?? createEmptyPair();
      const key = side === "A" ? "cartaA" : "cartaB";
      return {
        ...prev,
        [pairNum]: { ...pair, [key]: { ...pair[key], ...change(pair[key]) } },
      };
    });
  };

  const renderCard = (pairNum: number, side: "A" | "B") => {
    const pair = pairsData[pairNum];
    const card = (side === "A" ? pair?.cartaA : pair?.cartaB) ?? createEmptyCard();
    const { mode, image, text } = card;

    return (
      <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg border bg-muted/30 p-2">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Carta {side}
          </span>
          <Select
            items={MODES}
            value={mode}
            onValueChange={(value) =>
              value && update(pairNum, side, () => ({ mode: value as CardMode }))
            }
          >
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MODES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(mode === "image" || mode === "both") && (
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
              update(pairNum, side, (c) => ({ image: clearSlotImage(c.image) }))
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
            className="h-8 text-xs"
          />
        )}
        {mode === "text" && (
          <Textarea
            value={text}
            onChange={(e) =>
              update(pairNum, side, () => ({ text: e.target.value }))
            }
            placeholder="Escribe el texto"
            style={cardAspect}
            className="field-sizing-fixed min-h-0 resize-none text-xs"
          />
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {pairNumbers.map((pairNum) => (
        <Card key={pairNum} className="gap-3 p-3">
          <div className="flex items-center gap-2 border-b pb-1.5 text-sm font-bold">
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
  );
}
