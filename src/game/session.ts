import { loadZipFile } from "@/collector/persistence";
import {
  PAIRS,
  isBoardOrder,
  isSessionData,
  type SessionCard,
  type SessionData,
} from "@/collector/schema";
import { readImageSlot } from "@/collector/slot";

export interface GameSession {
  name: string;
  data: SessionData;
  images: Record<string, string>;
}

export interface Slot {
  pair: number;
  card: SessionCard;
}

export function resolveSlot(data: SessionData, entry: string): Slot | null {
  const [rawPair, side] = entry.split("_");
  const pair = Number(rawPair);
  const cell = data.cells[pair];
  if (!cell) return null;
  return { pair, card: side === "B" ? cell.cardB : cell.cardA };
}

export function releaseSession(session: GameSession | null) {
  Object.values(session?.images ?? {}).forEach((url) =>
    URL.revokeObjectURL(url),
  );
}

export async function loadSession(file: File): Promise<GameSession> {
  const zip = await loadZipFile(file);
  const entry = zip.file("sessionData.json") ?? zip.file("data.json");
  if (!entry) throw new Error("El archivo no es un paquete de De Par en Par.");

  const data: unknown = JSON.parse(await entry.async("string"));
  if (!isSessionData(data)) {
    throw new Error("El archivo tiene un formato que no se reconoce.");
  }
  if (data.cells.length !== PAIRS) {
    throw new Error(
      `El archivo trae ${data.cells.length} pares y el tablero es de ${PAIRS}.`,
    );
  }
  if (!isBoardOrder(data.answer)) {
    throw new Error("El orden del tablero del archivo no es válido.");
  }

  const paths = [
    ...new Set(
      data.cells
        .flatMap((cell) => [cell.cardA, cell.cardB])
        .filter((card) => card.type !== 0 && card.pictureFile)
        .map((card) => card.pictureFile),
    ),
  ];

  const images: Record<string, string> = {};
  try {
    await Promise.all(
      paths.map(async (path) => {
        const { url } = await readImageSlot(zip, path);
        if (!url) throw new Error(`Falta la imagen ${path} en el paquete.`);
        images[path] = url;
        const image = new Image();
        image.src = url;
        await image.decode().catch((cause) => {
          throw new Error(`No se pudo leer la imagen ${path}.`, { cause });
        });
      }),
    );
  } catch (error) {
    Object.values(images).forEach((url) => URL.revokeObjectURL(url));
    throw error;
  }

  return { name: file.name, data, images };
}
