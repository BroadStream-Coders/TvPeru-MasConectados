"use client";

import { useState } from "react";
import { Keyboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SHORTCUTS: [string, string][] = [
  ["Clic izquierdo", "Voltear una carta"],
  ["V · Clic derecho", "Validar las dos cartas elegidas"],
  ["Clic central", "Mostrar u ocultar todas las cartas"],
  ["F", "Mostrar todas las cartas"],
  ["B", "Ocultar todas las cartas"],
  ["C", "Soltar las cartas elegidas sin validar"],
  ["A", "Revolver el tablero y empezar de nuevo"],
  ["P", "Mostrar u ocultar el puntero en pantalla completa"],
  ["Shift", "Cortar el sonido"],
];

export function Shortcuts() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        aria-label="Ver atajos del operador"
        onClick={() => setOpen(true)}
      >
        <Keyboard />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Atajos del operador</DialogTitle>
            <DialogDescription>
              Funcionan en la ventana y en pantalla completa.
            </DialogDescription>
          </DialogHeader>
          <dl className="divide-y divide-border rounded-lg border border-border">
            {SHORTCUTS.map(([keys, action]) => (
              <div
                key={keys}
                className="flex items-center justify-between gap-4 px-3 py-2 text-sm"
              >
                <dt className="text-muted-foreground">{action}</dt>
                <dd className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                  {keys}
                </dd>
              </div>
            ))}
          </dl>
        </DialogContent>
      </Dialog>
    </>
  );
}
