"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Layers,
  LayoutGrid,
  Loader2,
  Save,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { LevelTabs } from "./LevelTabs";
import { loadZipFile, saveAsZip } from "./persistence";
import {
  MODE_TYPE,
  PAIRS,
  pairWithImage,
  createEmptyPair,
  initialBoardOrder,
  isBoardOrder,
  isSessionData,
  shuffle,
  validate,
  type CardContent,
  type PairsData,
  type SessionCard,
  type SessionData,
  type ValidationIssue,
} from "./schema";
import { createImagePacker, readImageSlot, releaseSlot } from "./slot";
import { Tab1 } from "./Tab1";
import { Tab2 } from "./Tab2";
import { ValidationDialog } from "./ValidationDialog";

const ZIP_NAME = "DeParEnPar.zip";
const SESSION_JSON = "sessionData.json";

interface Snapshot {
  pairsData: PairsData;
  boardOrder: string[];
  savedAt: number | null;
}

function buildSession(pairsData: PairsData, boardOrder: string[]) {
  const packer = createImagePacker();
  const toCard = (card: CardContent, pair: number, side: string) => ({
    type: MODE_TYPE[card.mode],
    text: card.mode === "image" ? "" : card.text,
    pictureFile:
      card.mode === "text" ? "" : packer.add(card.image, `P${pair}`, side),
  });

  const cells: SessionData["cells"] = [];
  for (let i = 1; i <= PAIRS; i++) {
    const pair = pairsData[i] ?? createEmptyPair();
    cells.push({
      cardA: toCard(pair.cardA, i, "A"),
      cardB: toCard(pair.cardB, i, "B"),
    });
  }

  return { data: { cells, answer: boardOrder }, files: packer.files };
}

function releasePairs(pairsData: PairsData) {
  Object.values(pairsData).forEach((pair) => {
    releaseSlot(pair.cardA.image);
    releaseSlot(pair.cardB.image);
  });
}

export function Editor() {
  const [initial] = useState<Snapshot>(() => ({
    pairsData: {},
    boardOrder: shuffle(initialBoardOrder()),
    savedAt: null,
  }));
  const [pairsData, setPairsData] = useState(initial.pairsData);
  const [boardOrder, setBoardOrder] = useState(initial.boardOrder);
  const [saved, setSaved] = useState(initial);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dirty =
    pairsData !== saved.pairsData || boardOrder !== saved.boardOrder;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const reportError = (message: string, cause?: unknown) => {
    console.error(message, cause);
    setError(message);
  };

  const save = async () => {
    setIssues([]);
    setBusy("Guardando…");
    try {
      const { data, files } = buildSession(pairsData, boardOrder);
      await saveAsZip(ZIP_NAME, data, files, SESSION_JSON);
      setSaved({ pairsData, boardOrder, savedAt: Date.now() });
      setError(null);
    } catch (cause) {
      reportError("No se pudo generar el ZIP.", cause);
    } finally {
      setBusy(null);
    }
  };

  const requestSave = () => {
    const found = validate(pairsData);
    if (found.length > 0) setIssues(found);
    else void save();
  };

  const load = async (file: File) => {
    setBusy("Cargando…");
    try {
      const zip = await loadZipFile(file);
      const entry = zip.file(SESSION_JSON) ?? zip.file("data.json");
      if (!entry) {
        reportError("El archivo no es un paquete de De Par en Par.");
        return;
      }

      const data: unknown = JSON.parse(await entry.async("string"));
      if (!isSessionData(data)) {
        reportError("El archivo tiene un formato que no se reconoce.");
        return;
      }
      if (data.cells.length !== PAIRS) {
        reportError(
          `El archivo trae ${data.cells.length} pares y el tablero es de ${PAIRS}.`,
        );
        return;
      }

      const pictureOf = (card: SessionCard) =>
        card.type !== 0 ? card.pictureFile : "";

      const loaded: PairsData = {};
      for (let i = 0; i < PAIRS; i++) {
        const { cardA, cardB } = data.cells[i];
        const path = pictureOf(cardA) || pictureOf(cardB);
        loaded[i + 1] = pairWithImage(await readImageSlot(zip, path));
      }
      const order = isBoardOrder(data.answer)
        ? data.answer
        : shuffle(initialBoardOrder());

      releasePairs(pairsData);
      setPairsData(loaded);
      setBoardOrder(order);
      setSaved({ pairsData: loaded, boardOrder: order, savedAt: null });
      setError(null);
    } catch (cause) {
      reportError("No se pudo cargar el archivo.", cause);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-muted/50">
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
                · Colector
              </span>
            </span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {busy ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              {busy}
            </span>
          ) : dirty ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
              <span className="size-1.5 rounded-full bg-accent" />
              Cambios sin guardar
            </span>
          ) : (
            saved.savedAt !== null && (
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                <Check className="size-3.5 text-primary" />
                Guardado
              </span>
            )
          )}

          <Button
            variant="outline"
            className="h-9 gap-1.5"
            disabled={busy !== null}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload />
            <span className="hidden sm:inline">Cargar</span>
          </Button>
          <Button
            className="h-9 gap-1.5"
            disabled={busy !== null}
            onClick={requestSave}
          >
            <Save />
            Guardar
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
            <AlertTitle>Algo salió mal</AlertTitle>
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

      <div className="min-h-0 flex-1">
        <LevelTabs
          levels={[
            {
              name: "Pares",
              icon: Layers,
              content: (
                <Tab1
                  pairsData={pairsData}
                  setPairsData={setPairsData}
                  onError={reportError}
                />
              ),
            },
            {
              name: "Tablero",
              icon: LayoutGrid,
              content: (
                <Tab2
                  boardOrder={boardOrder}
                  setBoardOrder={setBoardOrder}
                  pairsData={pairsData}
                />
              ),
            },
          ]}
        />
      </div>

      <ValidationDialog
        issues={issues}
        onClose={() => setIssues([])}
        onForceSave={() => void save()}
      />
    </div>
  );
}
