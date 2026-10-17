# Más Conectados

Repo del programa "Más Conectados" (TV Perú). Un único juego: **De Par en Par**
(memoria por pares, 10 pares = 20 cartas).

- Etapa 1: **colector** (`/collector`). La producción llena los pares y descarga un ZIP.
- Etapa 2: **juego** (`/game`). Carga ese ZIP y se juega.
- Sin backend, sin cuentas. Se despliega en Vercel con la raíz del repo.

Stack: Next.js 16.4 (App Router) + React 19 + Tailwind 4 + shadcn (estilo base-nova sobre Base UI) + lucide-react.

## AGENTS.md

`AGENTS.md` (generado por Next) manda: Next 16 tiene cambios incompatibles, ante
cualquier duda lee `node_modules/next/dist/docs/` antes de escribir código.

## Comandos

- `pnpm build`: valida tipos y compila. Es la verificación principal.
- `pnpm lint`
- NO levantar `pnpm dev` ni nada que no termine solo.

## Convenciones

- Sin comentarios en el código.
- Deuda técnica: `docs/logbook/technical-debt.md` (no como comentario).
- Código y rutas en inglés; textos de la UI en español.
- Sin emojis en la UI; iconos de lucide.
- Sin zustand ni estado global: `useState` local. Errores en un `Alert` de shadcn dentro de la página; sin toasts.
- Lo mínimo que funcione; librerías probadas antes que código a mano.
- Componentes shadcn: `pnpm dlx shadcn@latest add <componente>`. En base-nova el `Select` necesita `items` en la raíz para que `SelectValue` muestre la etiqueta.
- Identidad: colores de marca en `globals.css` (`--brand-*`, `--brand-gradient`), Poppins en títulos, logo vía `src/components/brand-mark.tsx`.

## Juego (`src/game/`)

- Sale en vivo: nada se muestra sin estar precargado y **decodificado** (`image.decode()`); si falta una imagen, el paquete se rechaza.
- Todo lo que se dibuja dentro del `Stage` (16:9) se mide en `cqw`/`cqh`, nunca en `px`/`rem`/`vw`, para que ventana y pantalla completa se vean idénticas.
- El contrato del ZIP es el del colector: el juego reusa `isSessionData`, `isBoardOrder` y `readImageSlot`, no duplica tipos.

## Contrato del ZIP (no romper)

`DeParEnPar.zip`:

- `sessionData.json`: `{ cells: [{ cardA, cardB }], answer: string[] }`, con `card = { type: 0|1|2, text, pictureFile }` (0 texto, 1 imagen, 2 ambos).
- `images/P{n}_{A|B}.ext`, referenciadas por `pictureFile`.
- `answer`: permutación de los ids `"{par0}_{A|B}"` (par 0-based).
- Al cargar se acepta `sessionData.json` o `data.json`; solo 10 pares.
- Carta: proporción 252x164 (constante única); imágenes recortadas siempre.
