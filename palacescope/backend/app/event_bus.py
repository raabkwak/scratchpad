from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator
from typing import AsyncGenerator

from .models import MemoryEvent


class EventBus:
    def __init__(self) -> None:
        self._queue: asyncio.Queue[MemoryEvent] = asyncio.Queue()
        self._sequence = 0

    async def publish(self, event: MemoryEvent) -> None:
        self._sequence += 1
        event.sequence = self._sequence
        await self._queue.put(event)

    async def stream(self) -> AsyncGenerator[MemoryEvent, None]:
        while True:
            event = await self._queue.get()
            yield event


bus = EventBus()
