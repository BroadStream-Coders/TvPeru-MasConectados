import { candara } from "@/fonts/candara";
import { poppins } from "@/fonts/poppins";

export const DESIGN_WIDTH = 1920;

export const px = (value: number) => `${(value / DESIGN_WIDTH) * 100}cqw`;

export const GRAPHICS = {
  background: "/game/background.png",
  mask: "/game/mask.png",
  back: ["/game/back-coral.png", "/game/back-cyan.png"],
  front: ["/game/front-coral.png", "/game/front-cyan.png"],
} as const;

export const BOARD = {
  columns: 5,
  cell: { width: 360, height: 250 },
  spacing: 15,
  offset: { x: 30, y: 17.5 },
  setter: { width: 315, height: 196 },
  bothText: 68,
  bothPicture: 120,
} as const;

export function cardPosition(slot: number) {
  const column = slot % BOARD.columns;
  const row = Math.floor(slot / BOARD.columns);
  return {
    left: BOARD.offset.x + column * (BOARD.cell.width + BOARD.spacing),
    top: BOARD.offset.y + row * (BOARD.cell.height + BOARD.spacing),
  };
}

export async function preloadGraphics(): Promise<void> {
  const images = [
    GRAPHICS.background,
    GRAPHICS.mask,
    ...GRAPHICS.back,
    ...GRAPHICS.front,
  ];
  await Promise.all([
    ...images.map(async (src) => {
      const image = new Image();
      image.src = src;
      await image.decode().catch((cause) => {
        throw new Error(`No se pudo cargar la gráfica ${src}.`, { cause });
      });
    }),
    document.fonts.load(`700 40px ${candara.style.fontFamily}`),
    document.fonts.load(`600 40px ${poppins.style.fontFamily}`),
  ]);
}
