"use client";

import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

interface ImageCropperDialogProps {
  imageSrc: string;
  aspect: number;
  onCancel: () => void;
  onConfirm: (area: Area) => Promise<void>;
}

export function ImageCropperDialog({
  imageSrc,
  aspect,
  onCancel,
  onConfirm,
}: ImageCropperDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (!area) return;
    setBusy(true);
    try {
      await onConfirm(area);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onCancel()}>
      <DialogContent showCloseButton={false} className="max-w-xl overflow-hidden bg-background p-0 shadow-2xl">
        <DialogHeader className="border-b border-border bg-muted/20 p-4">
          <DialogTitle>Ajustar imagen</DialogTitle>
        </DialogHeader>
        <div className="relative h-[400px] w-full bg-black/90">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
          />
        </div>
        <div className="space-y-6 bg-muted/10 p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(v) => setZoom(Array.isArray(v) ? v[0] : v)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCancel} disabled={busy}>
              Cancelar
            </Button>
            <Button onClick={confirm} disabled={busy || !area}>
              {busy ? "Recortando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
