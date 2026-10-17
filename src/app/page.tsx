import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Download,
  Gamepad2,
  PencilLine,
  Tv,
  type LucideIcon,
} from "lucide-react";

import { BrandMark } from "@/components/brand-mark";

const entries = [
  {
    href: "/collector",
    icon: ClipboardList,
    title: "Colector",
    text: "Llena los pares del día, ordena el tablero y descarga el ZIP para el juego.",
    cta: "Abrir colector",
    tone: {
      card: "hover:border-primary hover:shadow-[0_28px_56px_-26px_color-mix(in_oklch,var(--primary)_60%,transparent)]",
      icon: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
      cta: "text-primary",
    },
  },
  {
    href: "/game",
    icon: Gamepad2,
    title: "Juego",
    text: "Carga el ZIP del colector y juega De Par en Par en pantalla completa.",
    cta: "Abrir juego",
    tone: {
      card: "hover:border-accent hover:shadow-[0_28px_56px_-26px_color-mix(in_oklch,var(--accent)_60%,transparent)]",
      icon: "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground",
      cta: "text-accent",
    },
  },
];

const steps:{ icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: PencilLine,
    title: "Llena los pares",
    text: "Sube las imágenes o escribe los textos de las 20 cartas.",
  },
  {
    icon: Download,
    title: "Descarga el ZIP",
    text: "Guarda el paquete del día con todo lo que cargaste.",
  },
  {
    icon: Tv,
    title: "Sal al aire",
    text: "Carga el ZIP en el juego y empieza la partida.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="relative overflow-hidden bg-(image:--brand-gradient) text-white">
        <div className="pointer-events-none absolute -top-24 -right-16 size-80 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 left-[12%] size-72 rounded-full bg-brand-gold/20" />
        <div className="pointer-events-none absolute top-10 right-[28%] h-14 w-56 rounded-full bg-white/10" />

        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-4 pt-14 pb-28 text-center sm:flex-row sm:gap-7 sm:text-left">
          <BrandMark className="size-28 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.45)] sm:size-32" />
          <div>
            <p className="mb-2 text-xs font-bold tracking-[0.2em] text-white/80 uppercase">
              TV Perú · Juegos del programa
            </p>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Más Conectados
            </h1>
            <p className="mt-2 max-w-md text-base text-white/90 sm:text-lg">
              Prepara el juego De Par en Par y llévalo a la pantalla.
            </p>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-brand-teal" />
      </header>

      <main className="relative mx-auto -mt-16 w-full max-w-5xl flex-1 px-4 pb-16">
        <div className="grid gap-5 sm:grid-cols-2">
          {entries.map(({ href, icon: Icon, title, text, cta, tone }) => (
            <Link
              key={href}
              href={href}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-[0_24px_48px_-28px_color-mix(in_oklch,var(--brand-orange)_55%,transparent)] transition-all hover:-translate-y-0.5 ${tone.card}`}
            >
              <span
                className={`mb-5 flex size-14 items-center justify-center rounded-2xl transition-colors ${tone.icon}`}
              >
                <Icon className="size-7" />
              </span>
              <h2 className="font-heading text-2xl font-semibold">{title}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {text}
              </p>
              <span
                className={`mt-6 inline-flex items-center gap-1.5 font-semibold ${tone.cta}`}
              >
                {cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="mb-5 text-center font-heading text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Cómo funciona
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className="flex gap-4 rounded-xl border border-border/70 bg-card/60 p-5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(image:--brand-gradient) font-heading text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="flex items-center gap-1.5 font-heading font-semibold">
                    <Icon className="size-4 text-accent" />
                    {title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-5xl justify-between gap-4 px-4 py-3 text-xs text-muted-foreground">
          <p>Programa de TV Perú</p>
          <p>© 2026 Esteban Abanto</p>
        </div>
      </footer>
    </div>
  );
}
