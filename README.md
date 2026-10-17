# Más Conectados

Software de juegos para **Más Conectados**, programa de TV Perú. Hoy cubre un
juego: **De Par en Par**, un juego de memoria de 10 pares (20 cartas).

## Cómo se usa

1. **Colector** (`/collector`): la producción llena los pares del día (imagen,
   texto o ambos), ordena el tablero y descarga `DeParEnPar.zip`.
2. **Juego** (`/game`, en desarrollo): carga ese ZIP y se juega en pantalla
   durante el programa.

No hay cuentas, base de datos ni servidor propio: todo corre en el navegador y
los datos del día viajan en el ZIP.

## Formato del ZIP

```
DeParEnPar.zip
├── sessionData.json
└── images/
    └── P{n}_{A|B}.{png|jpg|webp}
```

`sessionData.json` trae `cells` (un elemento por par, con `cardA` y `cardB`:
`type` 0 texto · 1 imagen · 2 ambos, `text` y `pictureFile`) y `answer`, el
orden de las cartas en el tablero (`"{par}_{A|B}"`, par desde 0).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui (estilo `base-nova`, Base UI) + lucide
- JSZip para el paquete y react-easy-crop para el recorte de imágenes
- pnpm · desplegado en Vercel desde la raíz del repositorio

## Comandos

```bash
pnpm install
pnpm build
pnpm lint
```

## Licencia

Software propietario de **Esteban Abanto**, todos los derechos reservados. El
repositorio es público solo por requisitos de despliegue; su publicación no
otorga ningún derecho de uso, copia ni descarga. Ver [`LICENSE`](LICENSE).

El nombre y la identidad visual de Más Conectados pertenecen a TV Perú.

---

Desarrollado por Esteban Abanto © 2026
