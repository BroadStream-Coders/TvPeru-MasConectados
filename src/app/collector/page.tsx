"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@/collector/Editor").then((m) => m.Editor),
  { ssr: false },
);

export default function CollectorPage() {
  return <Editor />;
}
