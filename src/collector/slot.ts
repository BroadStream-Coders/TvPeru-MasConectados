import type JSZip from "jszip";

export interface ImageSlot {
  file?: File;
  url?: string;
  sourceUrl?: string;
}

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

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
  const keep = new Set([url, sourceUrl]);
  if (slot.url && !keep.has(slot.url)) URL.revokeObjectURL(slot.url);
  if (slot.sourceUrl && !keep.has(slot.sourceUrl)) {
    URL.revokeObjectURL(slot.sourceUrl);
  }
  return { file, url, sourceUrl };
}

export function clearSlotImage(slot: ImageSlot): ImageSlot {
  releaseSlot(slot);
  return {};
}

export function releaseSlot(slot: ImageSlot | undefined): void {
  if (slot?.url) URL.revokeObjectURL(slot.url);
  if (slot?.sourceUrl && slot.sourceUrl !== slot.url) {
    URL.revokeObjectURL(slot.sourceUrl);
  }
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

export async function readImageSlot(
  zip: JSZip,
  path: string,
): Promise<ImageSlot> {
  const entry = path ? zip.file(path) : null;
  if (!entry) return emptyImageSlot();

  const name = path.split("/").pop() || "image.png";
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const blob = await entry.async("blob");
  const file = new File([blob], name, { type: MIME[ext] ?? "image/png" });
  return { file, url: URL.createObjectURL(file) };
}
