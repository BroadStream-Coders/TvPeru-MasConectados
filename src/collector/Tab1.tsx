"use client";

import { Copy } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ImagePicker } from "./ImagePicker";
import {
  CARD_OUTPUT_WIDTH,
  CARD_RATIO,
  PAIRS,
  pairWithImage,
  type PairsData,
} from "./schema";
import { clearSlotImage, emptyImageSlot, setSlotImage, type ImageSlot } from "./slot";

interface Tab1Props {
  pairsData: PairsData;
  setPairsData: React.Dispatch<React.SetStateAction<PairsData>>;
  onError: (message: string, cause: unknown) => void;
}

const pairNumbers = Array.from({ length: PAIRS }, (_, i) => i + 1);

export function Tab1({ pairsData, setPairsData, onError }: Tab1Props) {
  const update = (pairNum: number, change: (image: ImageSlot) => ImageSlot) => {
    setPairsData((prev) => ({
      ...prev,
      [pairNum]: pairWithImage(
        change(prev[pairNum]?.cardA.image ?? emptyImageSlot()),
      ),
    }));
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {pairNumbers.map((pairNum) => {
          const image = pairsData[pairNum]?.cardA.image;
          return (
            <Card
              key={pairNum}
              className="flex flex-col gap-2.5 border-border/80 bg-card/60 p-2.5 shadow-sm"
            >
              <div className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground/90">
                <span className="flex size-6 items-center justify-center rounded-full bg-(image:--brand-gradient) text-[11px] font-bold text-white">
                  {pairNum}
                </span>
                Par {pairNum}
                <span
                  className="ml-auto inline-flex items-center gap-1 font-sans text-[11px] font-medium text-muted-foreground"
                  title="La imagen se usa en las dos cartas del par"
                >
                  <Copy className="size-3" />2 cartas
                </span>
              </div>
              <ImagePicker
                file={image?.file}
                url={image?.url}
                sourceUrl={image?.sourceUrl}
                ratio={CARD_RATIO}
                maxWidth={CARD_OUTPUT_WIDTH}
                onChange={(file, url, sourceUrl) =>
                  update(pairNum, (current) =>
                    setSlotImage(current, file, url, sourceUrl),
                  )
                }
                onClear={() => update(pairNum, clearSlotImage)}
                onError={onError}
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
