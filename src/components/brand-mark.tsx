import Image from "next/image";

import logo from "../../public/brand/mas-conectados.jpg";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-full bg-brand-orange ring-2 ring-white ${className}`}
    >
      <Image
        src={logo}
        alt="Más Conectados"
        priority
        className="absolute max-w-none"
        style={{ width: "153.8%", left: "-28.8%", top: "-37.7%" }}
      />
    </span>
  );
}
