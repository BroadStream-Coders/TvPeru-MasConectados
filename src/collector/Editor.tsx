"use client";

import { useState } from "react";
import { Layers, LayoutGrid, TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tab1 } from "./Tab1";
import { Tab2 } from "./Tab2";
import { initialBoardOrder, type PairData } from "./schema";

export function Editor() {
  const [pairsData, setPairsData] = useState<Record<number, PairData>>({});
  const [boardOrder, setBoardOrder] = useState<string[]>(initialBoardOrder);
  const [error, setError] = useState<string | null>(null);

  const reportError = (message: string, cause: unknown) => {
    console.error(message, cause);
    setError(message);
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Ocurrió un error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Tabs defaultValue="pairs">
        <TabsList>
          <TabsTrigger value="pairs">
            <Layers />
            Pares
          </TabsTrigger>
          <TabsTrigger value="board">
            <LayoutGrid />
            Tablero
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pairs" className="pt-4">
          <Tab1
            pairsData={pairsData}
            setPairsData={setPairsData}
            onError={reportError}
          />
        </TabsContent>
        <TabsContent value="board" className="pt-4">
          <Tab2
            boardOrder={boardOrder}
            setBoardOrder={setBoardOrder}
            pairsData={pairsData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
