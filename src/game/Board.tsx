"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { shuffle } from "@/collector/schema";
import { candara } from "@/fonts/candara";
import { poppins } from "@/fonts/poppins";
import {
  CELEBRATION_STEP_MS,
  DIAGONAL,
  WAVE_STEP_MS,
  confetti,
  dealIn,
  dealOut,
  flipHide,
  flipShow,
  glint,
  shake,
  sparkle,
  wiggle,
} from "./animations";
import { BOARD, GRAPHICS, cardPosition, px } from "./design";
import { FitText } from "./FitText";
import { resolveSlot, type GameSession, type Slot } from "./session";
import { playSound, stopAllSounds } from "./sounds";

const BACK_NUMBER_LIFT = 8;

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
          transform: `translate(-50%, calc(-50% - ${px(BACK_NUMBER_LIFT)}))`,
          paddingRight: "0.08em",
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
  const matchedRef = useRef(new Set<number>());
  const flightRef = useRef(new Map<number, Promise<void>>());
  const lockedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const slotEl = (i: number) => slotRefs.current[i];
  const cardEl = (i: number) => cardRefs.current[i];

  const setCards = (indexes: number[], up: boolean) => {
    const next = [...faceUpRef.current];
    indexes.forEach((i) => {
      next[i] = up;
      if (!up) matchedRef.current.delete(slots[i]?.pair ?? -1);
    });
    faceUpRef.current = next;
    flushSync(() => setFaceUp(next));
  };

  const flip = (i: number, up: boolean) => {
    const inFlight = flightRef.current.get(i);
    if (inFlight) return inFlight;
    if (faceUpRef.current[i] === up) return Promise.resolve();
    const el = cardEl(i);
    const run = (async () => {
      try {
        if (el) await flipHide(el);
        setCards([i], up);
        if (el) await flipShow(el);
      } finally {
        flightRef.current.delete(i);
      }
    })();
    flightRef.current.set(i, run);
    return run;
  };

  const settle = () =>
    Promise.all(slots.map((_, i) => flightRef.current.get(i)));

  const withLock = async (job: () => Promise<void>) => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    try {
      await job();
    } finally {
      lockedRef.current = false;
    }
  };

  const wave = (job: (i: number) => Promise<void>, step = WAVE_STEP_MS) =>
    Promise.all(DIAGONAL.map((i, n) => delay(n * step).then(() => job(i))));

  const onSlot = (i: number, run: (el: HTMLElement) => Promise<void>) => {
    const el = slotEl(i);
    return el ? run(el) : Promise.resolve();
  };

  const celebrate = async () => {
    const root = rootRef.current;
    await Promise.all([
      root ? confetti(root) : Promise.resolve(),
      ...DIAGONAL.map((i, n) =>
        onSlot(i, (el) => wiggle(el, n * CELEBRATION_STEP_MS)),
      ),
    ]);
  };

  const clickCard = (i: number) => {
    if (lockedRef.current || flightRef.current.has(i)) return;
    const up = !faceUpRef.current[i];
    const selection = selectionRef.current;
    if (up) {
      if (selection.length < 2) selectionRef.current = [...selection, i];
    } else {
      selectionRef.current = selection.filter((slot) => slot !== i);
    }
    void flip(i, up);
  };

  const validate = async () => {
    const selection = selectionRef.current;
    if (lockedRef.current || selection.length < 2) return;
    selectionRef.current = [];
    await Promise.all(selection.map((i) => flightRef.current.get(i)));

    const [first, second] = selection;
    const pair = slots[first]?.pair;

    if (pair !== undefined && pair === slots[second]?.pair) {
      playSound("correct");
      matchedRef.current.add(pair);
      await Promise.all(
        selection.map((i) =>
          onSlot(i, (el) =>
            Promise.all([wiggle(el), glint(el), sparkle(el)]).then(
              () => undefined,
            ),
          ),
        ),
      );
      if (matchedRef.current.size === data.cells.length) await celebrate();
      return;
    }

    await withLock(async () => {
      playSound("incorrect");
      await Promise.all(selection.map((i) => onSlot(i, shake)));
      await Promise.all(selection.map((i) => flip(i, false)));
    });
  };

  const flipAll = (up: boolean) =>
    withLock(async () => {
      selectionRef.current = [];
      await settle();
      await wave((i) => flip(i, up));
    });

  const toggleAll = () => flipAll(!faceUpRef.current.some(Boolean));

  const reshuffle = () =>
    withLock(async () => {
      selectionRef.current = [];
      matchedRef.current = new Set();
      await settle();
      await wave((i) => onSlot(i, (el) => dealOut(el, 0)), 15);
      const hidden = order.map(() => false);
      faceUpRef.current = hidden;
      flushSync(() => {
        setFaceUp(hidden);
        setOrder(shuffle(order));
      });
      await Promise.all(
        DIAGONAL.map((i, n) =>
          onSlot(i, (el) => dealIn(el, n * WAVE_STEP_MS)),
        ),
      );
    });

  const revealAll = () =>
    withLock(async () => {
      selectionRef.current = [];
      await settle();
      await wave((i) => flip(i, true));
      playSound("correct");
      await celebrate();
    });

  const clearSelection = () => {
    selectionRef.current = [];
  };

  const actions = {
    KeyV: () => void validate(),
    KeyF: () => void flipAll(true),
    KeyB: () => void flipAll(false),
    KeyC: clearSelection,
    KeyA: () => void reshuffle(),
  };

  const latestRef = useRef({ actions, validate, toggleAll, revealAll });
  useEffect(() => {
    latestRef.current = { actions, validate, toggleAll, revealAll };
  });

  useLayoutEffect(() => {
    DIAGONAL.forEach((i, n) => {
      const el = slotRefs.current[i];
      if (el) void dealIn(el, n * WAVE_STEP_MS);
    });
  }, []);

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
      if (event.shiftKey && event.code === "KeyM") {
        event.preventDefault();
        void latestRef.current.revealAll();
        return;
      }
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
        void latestRef.current.toggleAll();
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
    <div ref={rootRef} className="absolute inset-0 overflow-hidden">
      <Graphic src={GRAPHICS.background} />
      {slots.map((slot, i) => {
        const { left, top } = cardPosition(i);
        return (
          <div
            key={i}
            ref={(el) => {
              slotRefs.current[i] = el;
            }}
            className="absolute"
            style={{
              left: px(left),
              top: px(top),
              width: px(BOARD.cell.width),
              height: px(BOARD.cell.height),
              perspective: px(1600),
            }}
          >
            <button
              type="button"
              aria-label={`Carta ${i + 1}`}
              onPointerDown={(event) => {
                if (event.button === 0) clickCard(i);
              }}
              className="absolute inset-0 cursor-pointer outline-none"
            >
              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="absolute inset-0"
              >
                <CardFront slot={slot} index={i} images={images} />
                {!faceUp[i] && <CardBack index={i} />}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
