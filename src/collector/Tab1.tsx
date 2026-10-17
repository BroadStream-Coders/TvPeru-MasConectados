"use client";

import { useRef, useState } from "react";
import { Copy, ImagePlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ACCEPTED_IMAGES, prepareImage } from "./crop-image";
import { ImagePicker } from "./ImagePicker";
import {
  CARD_OUTPUT_WIDTH,
  CARD_RATIO,
  PAIRS,
  pairWithImage,
  type PairsData,
} from "./schema";
import {
  clearSlotImage,
  emptyImageSlot,
  releaseSlot,
  setSlotImage,
  type ImageSlot,
} from "./slot";

interface Tab1Props {
  pairsData: PairsData;
  setPairsData: React.Dispatch<React.SetStateAction<PairsData>>;
  onError: (message: string, cause: unknown) => void;
  onInfo: (message: string) => void;
}

const pairNumbers = Array.from({ length: PAIRS }, (_, i) => i + 1);

const byName = (a: File, b: File) =>
  a.name.localeCompare(b.name, "es", { numeric: true, sensitivity: "base" });

export function Tab1({ pairsData, setPairsData, onError, onInfo }: Tab1Props) {
  const quickInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const update = (pairNum: number, change: (image: ImageSlot) => ImageSlot) => {
    setPairsData((prev) => ({
      ...prev,
      [pairNum]: pairWithImage(
        change(prev[pairNum]?.cardA.image ?? emptyImageSlot()),
      ),
    }));
  };

  const quickLoad = async (files: File[]) => {
    if (files.length === 0) return;
    const taken = [...files].sort(byName).slice(0, PAIRS);
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        taken.map((file) => prepareImage(file, CARD_OUTPUT_WIDTH)),
      );
      setPairsData((prev) => {
        const next = { ...prev };
        results.forEach((result, i) => {
          if (result.status !== "fulfilled") return;
          releaseSlot(prev[i + 1]?.cardA.image);
          next[i + 1] = pairWithImage(result.value);
        });
        return next;
      });

      const failed = results.filter((result) => result.status === "rejected");
      if (failed.length > 0) {
        onError(
          `No se pudieron leer ${failed.length} de las imágenes elegidas.`,
          failed,
        );
      } else if (files.length > PAIRS) {
        onInfo(
          `Elegiste ${files.length} imágenes y el tablero tiene ${PAIRS} pares: se usaron las primeras ${PAIRS} por nombre de archivo.`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-card/70 px-3 py-2">
          <Button
            variant="outline"
            className="h-9 gap-2"
            disabled={loading}
            onClick={() => quickInputRef.current?.click()}
          >
            {loading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            {loading ? "Cargando imágenes…" : "Carga rápida"}
          </Button>
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            Elige varias imágenes a la vez: se ordenan por nombre de archivo y
            llenan los pares desde el 1, reemplazando lo que haya.
          </p>
          <input
            ref={quickInputRef}
            type="file"
            accept={ACCEPTED_IMAGES}
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              void quickLoad(files);
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {pairNumbers.map((pairNum) => {
            const image = pairsData[pairNum]?.cardA.image;
            return (
              <Card
                key={pairNum}
                className="flex flex-col gap-2 border-border/80 bg-card/60 p-2 shadow-sm"
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
    </div>
  );
}
