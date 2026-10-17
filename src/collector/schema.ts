import { emptyImageSlot, hasImage, type ImageSlot } from "./slot";

export type CardMode = "image" | "text" | "both";

export interface CardContent {
  mode: CardMode;
  text: string;
  image: ImageSlot;
}

export interface PairData {
  cartaA: CardContent;
  cartaB: CardContent;
}

interface ExportCard {
  type: number;
  text: string;
  pictureFile: string;
}

export interface Data {
  cells: { cardA: ExportCard; cardB: ExportCard }[];
  answer: string[];
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export const PAIRS = 10;

export const CARD_RATIO = { x: 252, y: 164 };

export const CARD_OUTPUT_WIDTH = CARD_RATIO.x * 2;

export const cardAspect = {
  aspectRatio: `${CARD_RATIO.x} / ${CARD_RATIO.y}`,
};

export function createEmptyCard(): CardContent {
  return { mode: "image", text: "", image: emptyImageSlot() };
}

export function createEmptyPair(): PairData {
  return { cartaA: createEmptyCard(), cartaB: createEmptyCard() };
}

export function initialBoardOrder(): string[] {
  const order: string[] = [];
  for (let i = 0; i < PAIRS; i++) order.push(`${i}_A`, `${i}_B`);
  return order;
}

export function isBoardOrder(order: unknown): order is string[] {
  const expected = initialBoardOrder();
  return (
    Array.isArray(order) &&
    order.length === expected.length &&
    expected.every((id) => order.includes(id))
  );
}

export function validate(
  pairsData: Record<number, PairData>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const checkCard = (
    card: CardContent | undefined,
    pairLabel: string,
    side: "A" | "B",
  ) => {
    const cardLabel = `${pairLabel} · Carta ${side}`;
    const mode = card?.mode ?? "image";

    if ((mode === "text" || mode === "both") && !card?.text.trim()) {
      issues.push({ path: `${cardLabel} · Texto`, message: "Falta el texto." });
    }
    if ((mode === "image" || mode === "both") && !hasImage(card?.image)) {
      issues.push({
        path: `${cardLabel} · Imagen`,
        message: "Falta la imagen.",
      });
    }
  };

  for (let i = 0; i < PAIRS; i++) {
    const pair = pairsData[i + 1];
    const pairLabel = `Par ${i + 1}`;
    checkCard(pair?.cartaA, pairLabel, "A");
    checkCard(pair?.cartaB, pairLabel, "B");
  }

  return issues;
}
