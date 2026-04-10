from __future__ import annotations

import asyncio
from datetime import datetime
from typing import AsyncIterator

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .data_loader import PalaceRepository, repository
from .event_bus import bus
from .models import MemoryEvent, PalaceSnapshot

app = FastAPI(title="PalaceScope API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


async def get_repo() -> PalaceRepository:
    return repository


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.get("/hierarchy", response_model=PalaceSnapshot)
async def hierarchy(repo: PalaceRepository = Depends(get_repo)) -> PalaceSnapshot:
    return repo.load_snapshot()


@app.get("/memory/{memory_id}")
async def memory_detail(memory_id: str, repo: PalaceRepository = Depends(get_repo)) -> dict:
    memory = repo.find_memory(memory_id)
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    return memory.model_dump()


@app.get("/stats")
async def stats(repo: PalaceRepository = Depends(get_repo)) -> dict:
    snapshot = repo.load_snapshot()
    total_memories = sum(len(room.memories) for wing in snapshot.wings for hall in wing.halls for room in hall.rooms)
    return {
        "wings": len(snapshot.wings),
        "halls": sum(len(wing.halls) for wing in snapshot.wings),
        "rooms": sum(len(hall.rooms) for wing in snapshot.wings for hall in wing.halls),
        "memories": total_memories,
    }


@app.get("/search")
async def search(q: str, limit: int = 10, repo: PalaceRepository = Depends(get_repo)) -> dict:
    tokens = q.lower().split()
    results = []
    for memory in repo.iter_memories():
        haystack = f"{memory.title} {memory.summary}".lower()
        score = sum(haystack.count(token) for token in tokens)
        if score:
            results.append((score, memory))
    results.sort(key=lambda item: item[0], reverse=True)
    return {"query": q, "results": [memory.model_dump() for _, memory in results[:limit]]}


async def sse_event_stream(request: Request) -> AsyncIterator[str]:
    async for event in bus.stream():
        if await request.is_disconnected():
            break
        data = event.model_dump_json()
        yield f"data: {data}\n\n"


@app.get("/events/stream")
async def events_stream(request: Request) -> StreamingResponse:
    generator = sse_event_stream(request)
    return StreamingResponse(generator, media_type="text/event-stream")


@app.post("/events/mock")
async def publish_mock(event: MemoryEvent) -> dict:
    await bus.publish(event)
    return {"status": "queued", "sequence": event.sequence}


@app.on_event("startup")
async def start_dev_feeder() -> None:
    async def feeder() -> None:
        # Developer convenience: emit sample events every 30 seconds
        counter = 0
        while True:
            await asyncio.sleep(30)
            counter += 1
            await bus.publish(
                MemoryEvent(
                    type="memory_created",
                    wing_id="wing-research",
                    hall_id="hall-product",
                    room_id="room-ui-pass",
                    payload={
                        "id": f"mem-auto-{counter}",
                        "title": f"Heartbeat auto event {counter}",
                        "summary": "Synthetic event from dev feeder",
                    },
                )
            )

    asyncio.create_task(feeder())
