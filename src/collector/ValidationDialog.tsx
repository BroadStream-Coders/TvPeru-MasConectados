"use client";

import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ValidationIssue } from "./schema";

interface ValidationDialogProps {
  issues: ValidationIssue[];
  onClose: () => void;
  onForceSave: () => void;
}

export function ValidationDialog({
  issues,
  onClose,
  onForceSave,
}: ValidationDialogProps) {
  return (
    <Dialog
      open={issues.length > 0}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlert className="size-5 text-destructive" />
            Faltan datos
          </DialogTitle>
          <DialogDescription>
            Hay {issues.length}{" "}
            {issues.length === 1 ? "campo pendiente" : "campos pendientes"}. Si
            guardas así, esas cartas saldrán vacías en el juego.
          </DialogDescription>
        </DialogHeader>

        <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {issues.map((issue) => (
            <li
              key={issue.path}
              className="flex flex-col rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2"
            >
              <span className="font-mono text-[10px] font-bold tracking-wide text-destructive uppercase">
                {issue.path}
              </span>
              <span className="text-xs text-foreground">{issue.message}</span>
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button variant="outline" onClick={onForceSave}>
            Guardar de todos modos
          </Button>
          <Button onClick={onClose}>Completar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
