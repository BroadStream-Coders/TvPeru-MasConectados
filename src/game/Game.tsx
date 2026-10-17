"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  FileArchive,
  Loader2,
  Maximize,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Board } from "./Board";
import { loadSession, releaseSession, type GameSession } from "./session";
import { Shortcuts } from "./Shortcuts";
import { preloadSounds } from "./sounds";
import { Stage, toggleFullscreen } from "./Stage";

export function Game() {
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<GameSession | null>(null);

  useEffect(() => () => releaseSession(sessionRef.current), []);

  const load = async (file: File) => {
    setLoading(true);
    try {
      const [next] = await Promise.all([loadSession(file), preloadSounds()]);
      releaseSession(sessionRef.current);
      sessionRef.current = next;
      setSession(next);
      setError(null);
    } catch (cause) {
      console.error("No se pudo cargar el paquete.", cause);
      setError(
        cause instanceof Error && cause.message
          ? cause.message
          : "No se pudo cargar el paquete.",
      );
    } finally {
      setLoading(false);
    }
  };

  const openFile = () => fileInputRef.current?.click();

  return (
    <div className="flex h-dvh flex-col bg-black">
      <header className="relative flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-3 sm:px-4">
        <div className="absolute inset-x-0 top-0 h-1 bg-(image:--brand-gradient)" />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Volver al inicio"
          nativeButton={false}
          render={<Link href="/" />}
        >
          <ArrowLeft />
        </Button>
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <BrandMark className="size-10 shadow-sm ring-brand-orange/30" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[11px] font-bold tracking-[0.14em] text-accent uppercase">
              Más Conectados
            </span>
            <span className="truncate font-heading text-base font-semibold tracking-tight">
              De Par en Par
              <span className="ml-1.5 font-sans text-sm font-normal text-muted-foreground max-sm:hidden">
                · Juego
              </span>
            </span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {loading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Cargando…
            </span>
          ) : (
            session && (
              <span className="hidden max-w-56 items-center gap-1.5 truncate rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground md:inline-flex">
                <FileArchive className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">{session.name}</span>
              </span>
            )
          )}
          <Shortcuts />
          <Button
            variant="outline"
            className="h-9 gap-1.5"
            disabled={loading}
            onClick={openFile}
          >
            <Upload />
            <span className="hidden sm:inline">Cargar</span>
          </Button>
          <Button
            className="h-9 gap-1.5"
            disabled={!session}
            onClick={() => void toggleFullscreen(stageRef.current)}
          >
            <Maximize />
            <span className="hidden sm:inline">Pantalla completa</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void load(file);
            }}
          />
        </div>
      </header>

      {error && (
        <div className="shrink-0 border-b border-border bg-card px-3 py-2 sm:px-4">
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>No se pudo cargar el paquete</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <AlertAction>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Cerrar aviso"
                onClick={() => setError(null)}
              >
                <X />
              </Button>
            </AlertAction>
          </Alert>
        </div>
      )}

      <Stage containerRef={stageRef}>
        {session ? (
          <Board key={session.loadedAt} session={session} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2cqh] bg-(image:--brand-gradient) text-center text-white">
            <BrandMark className="size-[22cqh] shadow-[0_2cqh_4cqh_-1cqh_rgb(0_0_0/0.45)]" />
            <p className="font-heading text-[4.5cqh] font-bold">De Par en Par</p>
            <p className="text-[2.6cqh] text-white/85">
              Carga el ZIP del colector para empezar.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-[1cqh] h-[6cqh] gap-[1cqh] px-[3cqh] text-[2.2cqh]"
              disabled={loading}
              onClick={openFile}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Upload />}
              {loading ? "Preparando las cartas" : "Cargar ZIP"}
            </Button>
          </div>
        )}
      </Stage>
    </div>
  );
}
