export interface ImageSlot {
  file?: File;
  url?: string;
  sourceUrl?: string;
}

export function emptyImageSlot(): ImageSlot {
  return {};
}

export function hasImage(slot: ImageSlot | undefined): boolean {
  return Boolean(slot?.file || slot?.url);
}

export function setSlotImage(
  slot: ImageSlot,
  file: File,
  url: string,
  sourceUrl?: string,
): ImageSlot {
  if (slot.url && slot.url !== url) URL.revokeObjectURL(slot.url);
  if (slot.sourceUrl && slot.sourceUrl !== sourceUrl) {
    URL.revokeObjectURL(slot.sourceUrl);
  }
  return { ...slot, file, url, sourceUrl };
}

export function clearSlotImage(slot: ImageSlot): ImageSlot {
  if (slot.url) URL.revokeObjectURL(slot.url);
  if (slot.sourceUrl) URL.revokeObjectURL(slot.sourceUrl);
  return {};
}

export function createImagePacker() {
  const files: { name: string; file: File }[] = [];

  return {
    files,
    add(slot: ImageSlot | undefined, ...parts: (string | number)[]): string {
      if (!slot?.file) return "";
      const ext = slot.file.name.split(".").pop() || "png";
      const name = `images/${parts.join("_")}.${ext}`;
      files.push({ name, file: slot.file });
      return name;
    },
  };
}
