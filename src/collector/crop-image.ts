import type { Area } from "react-easy-crop";

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen."));
    img.src = src;
  });
}

export async function cropToFile(
  src: string,
  area: Area,
  type: string,
  baseName: string,
  maxWidth: number,
): Promise<File> {
  const outType = EXT[type] ? type : "image/jpeg";
  const img = await loadImage(src);
  const scale = Math.min(1, maxWidth / area.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width * scale);
  canvas.height = Math.round(area.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible.");
  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outType, 0.85),
  );
  if (!blob) throw new Error("No se pudo generar la imagen.");
  return new File([blob], `${baseName}.${EXT[outType]}`, { type: outType });
}
