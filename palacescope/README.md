# PalaceScope

Real-time 3D navigator for [MemPalace](https://github.com/milla-jovovich/mempalace). PalaceScope renders the palace metaphor (wings → halls → rooms → drawers) in the browser using React Three Fiber, keeps data fresh via a server-sent event (SSE) stream, and exposes a FastAPI layer that talks to MemPalace's local datastore.

## Project layout

```
palacescope/
├── backend/         # FastAPI + SSE bridge into MemPalace/Chroma
│   ├── app/
│   ├── data/sample_palace.json
│   └── pyproject.toml
├── frontend/        # Vite + React + React Three Fiber scene
│   ├── src/
│   └── package.json
└── README.md
```

## Naming

"**PalaceScope**" stays faithful to the memory-palace metaphor while hinting at the zoomable, observational nature of the UI.

## Backend

- **FastAPI** serves read-only hierarchy snapshots (`/hierarchy`), memory detail, semantic search, and stats.
- **SSE stream** (`/events/stream`) pushes near real-time updates coming from a running MemPalace instance. Events follow a simple schema so the browser can patch the scene without a full refetch.
- **Adapters**: today the repo ships with a JSON stub (`data/sample_palace.json`). Point `PalaceRepository` at MemPalace's Chroma collections or daily exports to go live. Hooks for `chromadb` are scaffolded.
- **Dev feeder**: on startup the backend publishes synthetic events every 30 seconds so you can test the UI without a live MemPalace.

### Run backend

```bash
cd backend
uv venv .venv
source .venv/bin/activate
uv pip install -r <(uv pip compile pyproject.toml)
uv run uvicorn app.main:app --reload --port 8000
```

(You can also use `pip install -e .` if `uv` is unavailable.)

## Frontend

- Built with **React 19 + Vite + TypeScript** for fast local feedback.
- 3D scene uses **React Three Fiber + drei** to plot wings radially, stack halls, and drop rooms as interactive blocks. Selecting a room surfaces its latest memories.
- **TanStack Query** caches snapshots and stats while **Zustand**-style state is handled locally for selection (no Redux weight).
- **EventSource** listener consumes `/events/stream` and applies deltas so the visualization never needs a manual refresh.

### Run frontend

```bash
cd frontend
npm install
npm run dev -- --host
```

Set `VITE_API_BASE` in `.env.local` if the backend runs on another host.

## Wiring into a live MemPalace instance

1. **Expose data**: Extend `PalaceRepository` (backend) to read directly from MemPalace's Chroma DB or JSON export. The interface already expects the palace hierarchy layout; wire your loaders there.
2. **Emit events**:
   - Inside MemPalace's write path, publish a `MemoryEvent` (see `app/models.py`).
   - Call `bus.publish(event)` to broadcast it to all browsers.
3. **Secure access**: Because everything is local-first, keep the FastAPI server bound to `localhost` or add API tokens if you tunnel it.

## Next steps

- Hook `PalaceRepository` into real Chroma collections.
- Add room-level heatmaps (token counts, recency, embeddings) using instanced buffer attributes.
- Support two-way interactions (e.g., reorganizing rooms) via optional WebSocket upgrade.
- Build production Docker Compose (FastAPI + Vite static build) for one-command launch.

---

Ship-ready scaffolding is in place; plug it into MemPalace's live data and the visualization will stay fresh in real time.
