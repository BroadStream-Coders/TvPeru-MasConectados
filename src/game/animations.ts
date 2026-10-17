import { BOARD, DESIGN_WIDTH, GRAPHICS } from "./design";

const CARD_WIDTH_CQW = (BOARD.cell.width / DESIGN_WIDTH) * 100;

export const WAVE_STEP_MS = 35;
export const CELEBRATION_STEP_MS = 55;

const SPRING = "cubic-bezier(0.22, 1.4, 0.36, 1)";
const SMOOTH = "cubic-bezier(0.4, 0, 0.2, 1)";

const CONFETTI_COLORS = [
  "var(--brand-orange)",
  "var(--brand-pink)",
  "var(--brand-teal)",
  "var(--brand-purple)",
  "var(--brand-gold)",
];

export const DIAGONAL = Array.from(
  { length: BOARD.columns * 4 },
  (_, index) => index,
).sort(
  (a, b) =>
    (a % BOARD.columns) +
      Math.floor(a / BOARD.columns) -
      ((b % BOARD.columns) + Math.floor(b / BOARD.columns)) || a - b,
);

const finished = (animation: Animation) =>
  animation.finished.then(
    () => undefined,
    () => undefined,
  );

const random = (min: number, max: number) => min + Math.random() * (max - min);

function spawn(parent: HTMLElement, style: Partial<CSSStyleDeclaration>) {
  const el = document.createElement("span");
  Object.assign(el.style, { position: "absolute", pointerEvents: "none" }, style);
  parent.appendChild(el);
  return el;
}

export function flipHide(el: HTMLElement) {
  return finished(
    el.animate(
      [
        { transform: "rotateY(0deg) scale(1)" },
        { transform: "rotateY(90deg) scale(1.06)" },
      ],
      { duration: 170, easing: "cubic-bezier(0.5, 0, 0.75, 0)", fill: "forwards" },
    ),
  );
}

export function flipShow(el: HTMLElement) {
  el.getAnimations().forEach((animation) => animation.cancel());
  return finished(
    el.animate(
      [
        { transform: "rotateY(-90deg) scale(1.06)" },
        { transform: "rotateY(0deg) scale(1)" },
      ],
      { duration: 420, easing: SPRING },
    ),
  );
}

export function dealIn(el: HTMLElement, delay: number) {
  el.getAnimations().forEach((animation) => animation.cancel());
  return finished(
    el.animate(
      [
        {
          opacity: 0,
          transform: "translateY(-8%) scale(0.6) rotate(-8deg)",
        },
        { opacity: 1, transform: "translateY(0) scale(1) rotate(0deg)" },
      ],
      { duration: 560, delay, easing: SPRING, fill: "backwards" },
    ),
  );
}

export function dealOut(el: HTMLElement, delay: number) {
  return finished(
    el.animate(
      [
        { opacity: 1, transform: "scale(1) rotate(0deg)" },
        { opacity: 0, transform: "scale(0.6) rotate(6deg)" },
      ],
      {
        duration: 240,
        delay,
        easing: "cubic-bezier(0.5, 0, 0.75, 0)",
        fill: "forwards",
      },
    ),
  );
}

export function wiggle(el: HTMLElement, delay = 0) {
  return finished(
    el.animate(
      [
        { transform: "rotate(0deg) scale(1)" },
        { transform: "rotate(-6deg) scale(1.08)", offset: 0.25 },
        { transform: "rotate(5deg) scale(1.08)", offset: 0.55 },
        { transform: "rotate(-2deg) scale(1.03)", offset: 0.8 },
        { transform: "rotate(0deg) scale(1)" },
      ],
      { duration: 620, delay, easing: SMOOTH },
    ),
  );
}

export function shake(el: HTMLElement) {
  const flash = spawn(el, {
    inset: "0",
    zIndex: "2",
    background:
      "radial-gradient(closest-side, transparent 55%, color-mix(in oklch, var(--destructive) 55%, transparent))",
    maskImage: `url(${GRAPHICS.front[0]})`,
    maskSize: "100% 100%",
    webkitMaskImage: `url(${GRAPHICS.front[0]})`,
    webkitMaskSize: "100% 100%",
  } as Partial<CSSStyleDeclaration>);
  flash
    .animate([{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 0 }], {
      duration: 520,
      easing: SMOOTH,
    })
    .finished.finally(() => flash.remove());

  return finished(
    el.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-5%) rotate(-1.5deg)", offset: 0.15 },
        { transform: "translateX(4.5%) rotate(1.5deg)", offset: 0.35 },
        { transform: "translateX(-3.5%) rotate(-1deg)", offset: 0.55 },
        { transform: "translateX(2%) rotate(0.5deg)", offset: 0.75 },
        { transform: "translateX(0) rotate(0deg)" },
      ],
      { duration: 480, easing: "ease-out" },
    ),
  );
}

export function glint(el: HTMLElement) {
  const clip = spawn(el, {
    inset: "0",
    zIndex: "3",
    overflow: "hidden",
    maskImage: `url(${GRAPHICS.front[0]})`,
    maskSize: "100% 100%",
    webkitMaskImage: `url(${GRAPHICS.front[0]})`,
    webkitMaskSize: "100% 100%",
  } as Partial<CSSStyleDeclaration>);
  const band = spawn(clip, {
    inset: "-20% 0",
    background:
      "linear-gradient(105deg, transparent 30%, rgb(255 255 255 / 0.85) 48%, rgb(255 255 255 / 0.95) 50%, transparent 68%)",
  });
  return finished(
    band.animate(
      [{ transform: "translateX(-110%)" }, { transform: "translateX(110%)" }],
      { duration: 800, delay: 120, easing: SMOOTH, fill: "backwards" },
    ),
  ).then(() => clip.remove());
}

export function sparkle(el: HTMLElement) {
  const count = 12;
  const runs = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + random(-0.25, 0.25);
    const distance = random(38, 62);
    const size = random(5, 9);
    const star = spawn(el, {
      left: "50%",
      top: "50%",
      width: `${size}%`,
      aspectRatio: "1",
      zIndex: "4",
      background: i % 3 === 0 ? "var(--brand-gold)" : "white",
      clipPath:
        "polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)",
      filter: "drop-shadow(0 0 4px rgb(255 255 255 / 0.9))",
    });
    const x = (Math.cos(angle) * distance * CARD_WIDTH_CQW) / 100;
    const y = (Math.sin(angle) * distance * CARD_WIDTH_CQW * 0.8) / 100;
    const at = (k: number) =>
      `translate(calc(-50% + ${x * k}cqw), calc(-50% + ${y * k}cqw))`;
    return finished(
      star.animate(
        [
          { transform: `${at(0)} scale(0) rotate(0deg)`, opacity: 1 },
          {
            transform: `${at(0.7)} scale(1.1) rotate(90deg)`,
            opacity: 1,
            offset: 0.45,
          },
          { transform: `${at(1)} scale(0) rotate(180deg)`, opacity: 0 },
        ],
        {
          duration: random(650, 900),
          delay: random(0, 120),
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "backwards",
        },
      ),
    ).then(() => star.remove());
  });
  return Promise.all(runs).then(() => undefined);
}

export function confetti(root: HTMLElement) {
  const pieces = Array.from({ length: 90 }, (_, i) => {
    const piece = spawn(root, {
      left: `${random(0, 100)}%`,
      top: "-4%",
      width: `${random(0.5, 0.9)}cqw`,
      height: `${random(0.9, 1.5)}cqw`,
      zIndex: "20",
      borderRadius: i % 4 === 0 ? "50%" : "2px",
      background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    });
    const drift = random(-12, 12);
    const spin = random(360, 1080) * (Math.random() < 0.5 ? -1 : 1);
    return finished(
      piece.animate(
        [
          { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
          { opacity: 1, offset: 0.8 },
          {
            transform: `translate(${drift}cqw, 115cqh) rotate(${spin}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: random(1900, 3200),
          delay: random(0, 700),
          easing: "cubic-bezier(0.25, 0.6, 0.45, 1)",
          fill: "backwards",
        },
      ),
    ).then(() => piece.remove());
  });
  return Promise.all(pieces).then(() => undefined);
}
