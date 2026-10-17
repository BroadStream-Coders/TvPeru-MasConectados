import Image from "next/image";

import { CARD_RATIO } from "@/collector/schema";
import { resolveSlot, type GameSession } from "./session";

const cardStyle = {
  width: "15.5cqw",
  aspectRatio: `${CARD_RATIO.x} / ${CARD_RATIO.y}`,
};

export function Board({ session }: { session: GameSession }) {
  const { data, images } = session;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-(image:--brand-gradient)">
      <div className="grid grid-cols-5 gap-[1.6cqw]">
        {data.answer.map((entry) => {
          const card = resolveSlot(data, entry)?.card;
          const picture = card?.pictureFile ? images[card.pictureFile] : "";
          const showImage = card?.type !== 0 && picture;
          const showText = card?.type !== 1;

          return (
            <div
              key={entry}
              style={cardStyle}
              className="relative flex flex-col overflow-hidden rounded-[0.8cqw] bg-white shadow-[0_0.6cqw_1.4cqw_rgb(0_0_0/0.25)]"
            >
              {showImage && (
                <div className="relative min-h-0 flex-1">
                  <Image
                    src={picture}
                    alt=""
                    fill
                    unoptimized
                    draggable={false}
                    className="object-cover"
                  />
                </div>
              )}
              {showText && (
                <div
                  className={`flex items-center justify-center px-[0.6cqw] text-center font-heading leading-tight font-semibold text-foreground ${
                    showImage ? "h-[2.8cqw] shrink-0 text-[1.1cqw]" : "flex-1 text-[1.6cqw]"
                  }`}
                >
                  <span className="line-clamp-3">{card?.text}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
