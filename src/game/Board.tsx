"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { CARD_RATIO, shuffle } from "@/collector/schema";
import { resolveSlot, type GameSession, type Slot } from "./session";
import { playSound, stopAllSounds } from "./sounds";

const ERROR_BLINK_MS = 100;
const ERROR_HOLD_MS = 500;

const cardStyle = {
  width: "15.5cqw",
  aspectRatio: `${CARD_RATIO.x} / ${CARD_RATIO.y}`,
};

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);

function CardFace({
  slot,
  images,
}: {
  slot: Slot | null;
  images: Record<string, string>;
}) {
  const card = slot?.card;
  const picture = card?.pictureFile ? images[card.pictureFile] : "";
  const showImage = card?.type !== 0 && picture;
  const showText = card?.type !== 1;

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      {showImage && (
        <div className="relative min-h-0 flex-1">
          <Image
            src={picture}
            alt=""
            fill
            unoptimized
            draggable={false}
            className="object-cover"
          />
        </div>
      )}
      {showText && (
        <div
          className={`flex items-center justify-center px-[0.6cqw] text-center font-heading leading-tight font-semibold text-foreground ${
            showImage
              ? "h-[2.8cqw] shrink-0 text-[1.1cqw]"
              : "flex-1 text-[1.6cqw]"
          }`}
        >
          <span className="line-clamp-3">{card?.text}</span>
        </div>
      )}
    </div>
  );
}

function CardBack() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-brand-teal">
      <div className="absolute inset-[0.5cqw] rounded-[0.5cqw] border-[0.25cqw] border-white/70" />
      <BrandMark className="size-[5.5cqw] ring-[0.25cqw]" />
    </div>
  );
}

export function Board({ session }: { session: GameSession }) {
  const { data, images } = session;
  const [order, setOrder] = useState(data.answer);
  const slots = order.map((entry) => resolveSlot(data, entry));

  const [faceUp, setFaceUp] = useState<boolean[]>(() => slots.map(() => false));
  const [matched, setMatched] = useState<Set<number>>(() => new Set());
  const [errors, setErrors] = useState<number[]>([]);
  const faceUpRef = useRef(faceUp);
  const selectionRef = useRef<number[]>([]);
  const lockedRef = useRef(false);

  const allIndexes = () => slots.map((_, i) => i);

  const setCards = (indexes: number[], up: boolean) => {
    const next = [...faceUpRef.current];
    indexes.forEach((i) => (next[i] = up));
    faceUpRef.current = next;
    setFaceUp(next);
    if (!up) {
      setMatched((prev) => {
        const pairs = new Set(prev);
        indexes.forEach((i) => pairs.delete(slots[i]?.pair ?? -1));
        return pairs;
      });
    }
  };

  const clickCard = (i: number) => {
    if (lockedRef.current) return;
    const up = !faceUpRef.current[i];
    const selection = selectionRef.current;
    if (up) {
      if (selection.length < 2) selectionRef.current = [...selection, i];
    } else {
      selectionRef.current = selection.filter((slot) => slot !== i);
    }
    setCards([i], up);
  };

  const validate = async () => {
    const selection = selectionRef.current;
    if (lockedRef.current || selection.length < 2) return;
    selectionRef.current = [];

    const [first, second] = selection;
    const pair = slots[first]?.pair;

    if (pair !== undefined && pair === slots[second]?.pair) {
      playSound("correct");
      setMatched((prev) => new Set(prev).add(pair));
      return;
    }

    lockedRef.current = true;
    try {
      playSound("incorrect");
      setErrors(selection);
      await delay(ERROR_BLINK_MS);
      setErrors([]);
      await delay(ERROR_BLINK_MS);
      setErrors(selection);
      await delay(ERROR_HOLD_MS);
      setErrors([]);
      setCards(selection, false);
    } finally {
      lockedRef.current = false;
    }
  };

  const flipAll = (up: boolean) => {
    if (lockedRef.current) return;
    selectionRef.current = [];
    setCards(allIndexes(), up);
  };

  const toggleAll = () => flipAll(!faceUpRef.current.some(Boolean));

  const reshuffle = () => {
    if (lockedRef.current) return;
    selectionRef.current = [];
    const hidden = order.map(() => false);
    faceUpRef.current = hidden;
    setFaceUp(hidden);
    setMatched(new Set());
    setOrder(shuffle(order));
  };

  const clearSelection = () => {
    selectionRef.current = [];
  };

  const actions = {
    KeyV: () => void validate(),
    KeyF: () => flipAll(true),
    KeyB: () => flipAll(false),
    KeyC: clearSelection,
    KeyA: reshuffle,
  };

  const latestRef = useRef({ actions, validate, toggleAll });
  useEffect(() => {
    latestRef.current = { actions, validate, toggleAll };
  });

  useEffect(() => {
    let shiftArmed = false;

    const onKeyDown = (event: KeyboardEvent) => {
      shiftArmed =
        (event.code === "ShiftLeft" || event.code === "ShiftRight") &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey;
      if (isTyping(event.target)) return;
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      const { actions } = latestRef.current;
      const action = actions[event.code as keyof typeof actions];
      if (!action) return;
      event.preventDefault();
      action();
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const isShift = event.code === "ShiftLeft" || event.code === "ShiftRight";
      if (!isShift || !shiftArmed) return;
      shiftArmed = false;
      if (!isTyping(event.target)) stopAllSounds();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button === 1) {
        event.preventDefault();
        latestRef.current.toggleAll();
      } else if (event.button === 2) {
        event.preventDefault();
        void latestRef.current.validate();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-(image:--brand-gradient)">
      <div className="grid grid-cols-5 gap-[1.6cqw]">
        {slots.map((slot, i) => {
          const up = faceUp[i];
          const isMatched = up && slot !== null && matched.has(slot.pair);
          const isError = errors.includes(i);

          return (
            <button
              key={order[i]}
              type="button"
              style={cardStyle}
              onPointerDown={(event) => {
                if (event.button === 0) clickCard(i);
              }}
              className={`relative cursor-pointer overflow-hidden rounded-[0.8cqw] shadow-[0_0.6cqw_1.4cqw_rgb(0_0_0/0.25)] outline-none ${
                isError
                  ? "ring-[0.35cqw] ring-destructive"
                  : isMatched
                    ? "ring-[0.35cqw] ring-brand-teal"
                    : ""
              }`}
            >
              <CardFace slot={slot} images={images} />
              {!up && <CardBack />}
              {isError && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/35">
                  <X className="size-[6cqw] stroke-[0.4cqw] text-white drop-shadow" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
