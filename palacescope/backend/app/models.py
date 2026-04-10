from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class Memory(BaseModel):
    id: str
    title: str
    summary: str
    timestamp: datetime
    author: str
    tokens: int
    embedding: Optional[List[float]] = None


class Room(BaseModel):
    id: str
    label: str
    memories: List[Memory] = Field(default_factory=list)


class Hall(BaseModel):
    id: str
    label: str
    rooms: List[Room] = Field(default_factory=list)


class Wing(BaseModel):
    id: str
    label: str
    halls: List[Hall] = Field(default_factory=list)


class PalaceSnapshot(BaseModel):
    wings: List[Wing] = Field(default_factory=list)


class MemoryEvent(BaseModel):
    type: Literal[
        "memory_created",
        "memory_updated",
        "memory_deleted",
        "room_stats_updated",
    ]
    wing_id: str
    hall_id: str
    room_id: str
    payload: dict
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    sequence: int = 0
