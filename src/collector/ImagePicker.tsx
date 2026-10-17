"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Area } from "react-easy-crop";
import { Crop, Plus, Trash2 } from "lucide-react";

import { cropToFile } from "./crop-image";
import { ImageCropperDialog } from "./ImageCropperDialog";

const ACTION =
  "absolute top-2 z-10 rounded bg-black/60 p-1.5 text-white opacity-0 transition-opacity outline-none group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring max-md:opacity-100";

interface Pending {
  src: string;
  type: string;
  baseName: string;
}

interface ImagePickerProps {
  file?: File;
  url?: string;
  sourceUrl?: string;
  ratio: { x: number; y: number };
  maxWidth: number;
  onChange: (file: File, url: string, sourceUrl: string) => void;
  onClear: () => void;
  onError: (message: string, cause: unknown) => void;
}

const RATIO_TOLERANCE = 0.03;

const baseNameOf = (name: string) => name.replace(/\.[^.]+$/, "") || "image";

async function measure(src: string) {
  const image = document.createElement("img");
  image.src = src;
  await image.decode();
  return { width: image.naturalWidth, height: image.naturalHeight };
}

export function ImagePicker({
  file,
  url,
  sourceUrl,
  ratio,
  maxWidth,
  onChange,
  onClear,
  onError,
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [shape, setShape] = useState<{ url: string; ratio: number } | null>(
    null,
  );

  const target = ratio.x / ratio.y;
  const misfit =
    shape !== null &&
    shape.url === url &&
    Math.abs(shape.ratio - target) / target > RATIO_TOLERANCE;

  const handleFile = async (picked: File) => {
    let originalUrl = "";
    try {
      const original = new File([await picked.arrayBuffer()], picked.name, {
        type: picked.type,
      });
      originalUrl = URL.createObjectURL(original);
      const { width, height } = await measure(originalUrl);
      const stored =
        width > maxWidth
          ? await cropToFile(
              originalUrl,
              { x: 0, y: 0, width, height },
              picked.type,
              baseNameOf(picked.name),
              maxWidth,
            )
          : original;
      const storedUrl =
        stored === original ? originalUrl : URL.createObjectURL(stored);
      onChange(stored, storedUrl, originalUrl);
    } catch (error) {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      onError("No se pudo leer la imagen elegida.", error);
    }
  };

  const reCrop = () => {
    const src = sourceUrl ?? url;
    if (!src) return;
    setPending({
      src,
      type: file?.type ?? "image/jpeg",
      baseName: baseNameOf(file?.name ?? "image"),
    });
  };

  const close = () => {
    setPending(null);
  };

  const confirm = async (area: Area) => {
    if (!pending) return;
    try {
      const cropped = await cropToFile(
        pending.src,
        area,
        pending.type,
        pending.baseName,
        maxWidth,
      );
      onChange(cropped, URL.createObjectURL(cropped), pending.src);
      setPending(null);
    } catch (error) {
      onError("No se pudo recortar la imagen.", error);
      close();
    }
  };

  return (
    <>
      <div
        className="group relative w-full cursor-pointer overflow-hidden rounded-lg border border-dashed border-border bg-background transition-colors hover:border-primary/50 hover:bg-muted/40"
        style={{ aspectRatio: `${ratio.x} / ${ratio.y}` }}
        onClick={() => inputRef.current?.click()}
      >
        {url ? (
          <>
            <Image
              src={url}
              alt="Vista previa"
              fill
              unoptimized
              className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
              onLoad={(e) =>
                setShape({
                  url,
                  ratio:
                    e.currentTarget.naturalWidth /
                    e.currentTarget.naturalHeight,
                })
              }
            />
            <button
              type="button"
              aria-label={
                misfit
                  ? "Recortar imagen: no calza con la carta"
                  : "Recortar imagen"
              }
              title={
                misfit
                  ? "La imagen no tiene la forma de la carta. Recórtala para que llene el espacio."
                  : "Recortar imagen"
              }
              className={`left-2 ${ACTION} ${
                misfit
                  ? "bg-accent opacity-100 shadow-[0_0_0_3px_color-mix(in_oklch,var(--accent)_35%,transparent)] hover:bg-accent/85"
                  : "hover:bg-black/80"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                reCrop();
              }}
            >
              <Crop className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Quitar imagen"
              className={`right-2 hover:bg-destructive ${ACTION}`}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              <Trash2 className="size-4" />
            </button>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors group-hover:text-foreground">
            <span className="flex size-8 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Plus className="size-4" />
            </span>
            <span className="text-xs font-medium">Subir imagen</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const picked = e.target.files?.[0];
            e.target.value = "";
            if (picked) void handleFile(picked);
          }}
        />
      </div>
      {pending && (
        <ImageCropperDialog
          imageSrc={pending.src}
          aspect={ratio.x / ratio.y}
          onCancel={close}
          onConfirm={confirm}
        />
      )}
    </>
  );
}
