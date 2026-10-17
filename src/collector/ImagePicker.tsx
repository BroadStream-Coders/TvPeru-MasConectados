"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Area } from "react-easy-crop";
import { Crop, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cropToFile } from "./crop-image";
import { ImageCropperDialog } from "./ImageCropperDialog";

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
        className="group relative w-full cursor-pointer overflow-hidden rounded-lg border border-dashed border-border bg-background hover:border-primary/50 hover:bg-muted/40"
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
              className="object-contain p-1"
            />
            <div className="absolute left-2 top-2 z-10">
              <Button
                size="icon-xs"
                variant="secondary"
                aria-label="Recortar imagen"
                onClick={(e) => {
                  e.stopPropagation();
                  reCrop();
                }}
              >
                <Crop />
              </Button>
            </div>
            <div className="absolute right-2 top-2 z-10">
              <Button
                size="icon-xs"
                variant="destructive"
                aria-label="Quitar imagen"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
              >
                <Trash2 />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground group-hover:text-foreground">
            <Plus className="size-5" />
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
