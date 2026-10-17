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
  owned: boolean;
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

const baseNameOf = (name: string) => name.replace(/\.[^.]+$/, "") || "image";

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

  const handleFile = async (picked: File) => {
    try {
      const blob = new Blob([await picked.arrayBuffer()], {
        type: picked.type,
      });
      setPending({
        src: URL.createObjectURL(blob),
        owned: true,
        type: picked.type,
        baseName: baseNameOf(picked.name),
      });
    } catch (error) {
      onError("No se pudo leer la imagen elegida.", error);
    }
  };

  const reCrop = () => {
    const src = sourceUrl ?? url;
    if (!src) return;
    setPending({
      src,
      owned: false,
      type: file?.type ?? "image/jpeg",
      baseName: baseNameOf(file?.name ?? "image"),
    });
  };

  const close = () => {
    if (pending?.owned) URL.revokeObjectURL(pending.src);
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
            />
            <button
              type="button"
              aria-label="Recortar imagen"
              className={`left-2 hover:bg-black/80 ${ACTION}`}
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
