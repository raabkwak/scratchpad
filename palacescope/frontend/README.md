# PalaceScope Frontend

React + Vite application that renders the MemPalace hierarchy as a 3D scene using React Three Fiber. It subscribes to the PalaceScope API for data and Server-Sent Events (SSE) to keep the visualization live.

## Commands

```bash
npm install --include=dev   # first time
npm run dev                 # start Vite dev server on :5173
npm run build               # type-check + production bundle into dist/
npm run preview             # serve the production build
```

Set `VITE_API_BASE` in `.env.local` if the FastAPI backend runs anywhere other than `http://localhost:8000`.

## Structure

- `src/App.tsx` wires overlays + scene
- `src/components/PalaceScene.tsx` maps wings/halls/rooms to meshes
- `src/hooks/usePalaceData.ts` handles TanStack Query + SSE updates
- `src/components/Overlay.tsx` exposes stats, search, and selection details

The build currently bundles into a single chunk (~1.1 MB minified) because of Three.js; once we add lazy-loaded scenes for advanced controls we can split the bundle further.
