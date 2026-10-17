import { emptyImageSlot, hasImage, type ImageSlot } from "./slot";

export type CardMode = "image" | "text" | "both";
export type CardSide = "A" | "B";

export interface CardContent {
  mode: CardMode;
  text: string;
  image: ImageSlot;
}

export interface PairData {
  cardA: CardContent;
  cardB: CardContent;
}

export type PairsData = Record<number, PairData>;

export interface SessionCard {
  type: number;
  text: string;
  pictureFile: string;
}

export interface SessionData {
  cells: { cardA: SessionCard; cardB: SessionCard }[];
  answer: string[];
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export const PAIRS = 10;

export const CARD_RATIO = { x: 315, y: 196 };

export const CARD_OUTPUT_WIDTH = CARD_RATIO.x * 2;

export const cardAspect = {
  aspectRatio: `${CARD_RATIO.x} / ${CARD_RATIO.y}`,
};

export const MODE_TYPE: Record<CardMode, number> = {
  text: 0,
  image: 1,
  both: 2,
};

export function createEmptyCard(): CardContent {
  return { mode: "image", text: "", image: emptyImageSlot() };
}

export function createEmptyPair(): PairData {
  return { cardA: createEmptyCard(), cardB: createEmptyCard() };
}

export function pairWithImage(image: ImageSlot): PairData {
  const card: CardContent = { mode: "image", text: "", image };
  return { cardA: card, cardB: { ...card } };
}

export function cardKey(side: CardSide): keyof PairData {
  return side === "A" ? "cardA" : "cardB";
}

export function initialBoardOrder(): string[] {
  const order: string[] = [];
  for (let i = 0; i < PAIRS; i++) order.push(`${i}_A`, `${i}_B`);
  return order;
}

export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function isBoardOrder(order: unknown): order is string[] {
  const expected = initialBoardOrder();
  return (
    Array.isArray(order) &&
    order.length === expected.length &&
    new Set(order).size === expected.length &&
    expected.every((id) => order.includes(id))
  );
}

function isSessionCard(value: unknown): value is SessionCard {
  if (typeof value !== "object" || value === null) return false;
  const card = value as SessionCard;
  return (
    typeof card.type === "number" &&
    typeof card.text === "string" &&
    typeof card.pictureFile === "string"
  );
}

export function isSessionData(value: unknown): value is SessionData {
  if (typeof value !== "object" || value === null) return false;
  const data = value as SessionData;
  return (
    Array.isArray(data.cells) &&
    data.cells.every(
      (cell) => isSessionCard(cell?.cardA) && isSessionCard(cell?.cardB),
    )
  );
}

export function validate(pairsData: PairsData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (let i = 1; i <= PAIRS; i++) {
    if (!hasImage(pairsData[i]?.cardA.image)) {
      issues.push({ path: `Par ${i}`, message: "Falta la imagen." });
    }
  }

  return issues;
}
