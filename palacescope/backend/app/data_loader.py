from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable, Optional

from .models import Hall, Memory, PalaceSnapshot, Room, Wing


class PalaceRepository:
    """Loads palace hierarchy snapshots from JSON or Chroma."""

    def __init__(self, snapshot_path: Optional[Path] = None):
        self.snapshot_path = snapshot_path or Path(__file__).resolve().parents[1] / "data" / "sample_palace.json"

    def load_snapshot(self) -> PalaceSnapshot:
        data = json.loads(self.snapshot_path.read_text())
        return PalaceSnapshot(**data)

    def find_memory(self, memory_id: str) -> Optional[Memory]:
        snapshot = self.load_snapshot()
        for wing in snapshot.wings:
            for hall in wing.halls:
                for room in hall.rooms:
                    for memory in room.memories:
                        if memory.id == memory_id:
                            return memory
        return None

    def iter_memories(self) -> Iterable[Memory]:
        snapshot = self.load_snapshot()
        for wing in snapshot.wings:
            for hall in wing.halls:
                for room in hall.rooms:
                    for memory in room.memories:
                        yield memory


repository = PalaceRepository()
