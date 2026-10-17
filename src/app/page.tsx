import Link from "next/link";
import { Gamepad2, ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-10 px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Más Conectados</h1>
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <Button
          size="lg"
          className="h-28 flex-col gap-2 text-lg [&_svg:not([class*='size-'])]:size-8"
          nativeButton={false}
          render={<Link href="/collector" />}
        >
          <ListChecks />
          Colector
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="h-28 flex-col gap-2 text-lg [&_svg:not([class*='size-'])]:size-8"
          disabled
        >
          <Gamepad2 />
          Juego
        </Button>
      </div>
    </main>
  );
}
