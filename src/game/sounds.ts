const SOURCES = {
  correct: "/audio/correct.mp3",
  incorrect: "/audio/incorrect.mp3",
} as const;

export type SoundId = keyof typeof SOURCES;

const cache = new Map<SoundId, HTMLAudioElement>();

function audioFor(id: SoundId): HTMLAudioElement {
  let audio = cache.get(id);
  if (!audio) {
    audio = new Audio(SOURCES[id]);
    audio.preload = "auto";
    cache.set(id, audio);
  }
  return audio;
}

export function playSound(id: SoundId) {
  const audio = audioFor(id);
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function preloadSounds(): Promise<void[]> {
  return Promise.all(
    (Object.keys(SOURCES) as SoundId[]).map((id) => {
      const audio = audioFor(id);
      if (audio.readyState >= audio.HAVE_ENOUGH_DATA) return Promise.resolve();
      return new Promise<void>((resolve, reject) => {
        audio.addEventListener("canplaythrough", () => resolve(), {
          once: true,
        });
        audio.addEventListener(
          "error",
          () => reject(new Error(`No se pudo cargar el sonido ${id}.`)),
          { once: true },
        );
        audio.load();
      });
    }),
  );
}
