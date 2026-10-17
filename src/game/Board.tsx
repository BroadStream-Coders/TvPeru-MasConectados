"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { shuffle } from "@/collector/schema";
import { candara } from "@/fonts/candara";
import { poppins } from "@/fonts/poppins";
import { BOARD, GRAPHICS, cardPosition, px } from "./design";
import { FitText } from "./FitText";
import { resolveSlot, type GameSession, type Slot } from "./session";
import { playSound, stopAllSounds } from "./sounds";

const ERROR_FLIP_MS = 300;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);

function Graphic({ src, className = "" }: { src: string; className?: string }) {
  return (
    <Image
      src={src}
      alt=""
      fill
      unoptimized
      draggable={false}
      className={`pointer-events-none ${className}`}
    />
  );
}

function Picture({ src }: { src: string }) {
  return src ? <Graphic src={src} className="object-contain" /> : null;
}

function CardFront({
  slot,
  index,
  images,
}: {
  slot: Slot | null;
  index: number;
  images: Record<string, string>;
}) {
  const card = slot?.card;
  const picture = card?.pictureFile ? (images[card.pictureFile] ?? "") : "";
  const text = card?.text ?? "";

  return (
    <div className="absolute inset-0">
      <Graphic src={GRAPHICS.front[index % 2]} />
      <div
        className="absolute top-1/2 left-1/2 -translate-1/2 bg-white"
        style={{
          width: px(BOARD.setter.width),
          height: px(BOARD.setter.height),
          maskImage: `url(${GRAPHICS.mask})`,
          maskSize: "100% 100%",
          WebkitMaskImage: `url(${GRAPHICS.mask})`,
          WebkitMaskSize: "100% 100%",
        }}
      >
        {card?.type === 0 && (
          <FitText
            text={text}
            min={12}
            max={40}
            className={candara.className}
            style={{
              color: "#3f9b15",
              fontWeight: 700,
              letterSpacing: "-0.07em",
            }}
          />
        )}
        {card?.type === 1 && (
          <div className="relative h-full w-full">
            <Picture src={picture} />
          </div>
        )}
        {card?.type === 2 && (
          <>
            <div
              className="absolute inset-x-0 top-0"
              style={{ height: px(BOARD.bothText) }}
            >
              <FitText
                text={text}
                min={12}
                max={40}
                className={poppins.className}
                style={{
                  color: "#194aba",
                  fontWeight: 700,
                  letterSpacing: "-0.07em",
                }}
              />
            </div>
            <div
              className="absolute inset-x-0 bottom-0"
              style={{ height: px(BOARD.bothPicture) }}
            >
              <Picture src={picture} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CardBack({ index }: { index: number }) {
  return (
    <div className="absolute inset-0">
      <Graphic src={GRAPHICS.back[index % 2]} />
      <div
        className={`absolute top-1/2 left-1/2 flex items-center justify-center text-white ${candara.className}`}
        style={{
          width: px(200),
          height: px(200),
          transform: `translate(-50%, calc(-50% + ${px(5)}))`,
          fontSize: px(90),
          letterSpacing: "-0.08em",
          lineHeight: "normal",
        }}
      >
        {index + 1}
      </div>
    </div>
  );
}

export function Board({ session }: { session: GameSession }) {
  const { data, images } = session;
  const [order, setOrder] = useState(data.answer);
  const slots = order.map((entry) => resolveSlot(data, entry));

  const [faceUp, setFaceUp] = useState<boolean[]>(() => slots.map(() => false));
  const faceUpRef = useRef(faceUp);
  const selectionRef = useRef<number[]>([]);
  const lockedRef = useRef(false);

  const allIndexes = () => slots.map((_, i) => i);

  const setCards = (indexes: number[], up: boolean) => {
    const next = [...faceUpRef.current];
    indexes.forEach((i) => (next[i] = up));
    faceUpRef.current = next;
    setFaceUp(next);
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
      return;
    }

    lockedRef.current = true;
    try {
      playSound("incorrect");
      await delay(ERROR_FLIP_MS);
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
    <div className="absolute inset-0">
      <Graphic src={GRAPHICS.background} />
      {slots.map((slot, i) => {
        const { left, top } = cardPosition(i);
        return (
          <button
            key={order[i]}
            type="button"
            aria-label={`Carta ${i + 1}`}
            onPointerDown={(event) => {
              if (event.button === 0) clickCard(i);
            }}
            className="absolute cursor-pointer outline-none"
            style={{
              left: px(left),
              top: px(top),
              width: px(BOARD.cell.width),
              height: px(BOARD.cell.height),
            }}
          >
            <CardFront slot={slot} index={i} images={images} />
            {!faceUp[i] && <CardBack index={i} />}
          </button>
        );
      })}
    </div>
  );
}
