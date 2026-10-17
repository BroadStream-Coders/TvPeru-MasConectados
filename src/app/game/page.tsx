"use client";

import dynamic from "next/dynamic";

const Game = dynamic(() => import("@/game/Game").then((m) => m.Game), {
  ssr: false,
});

export default function GamePage() {
  return <Game />;
}
