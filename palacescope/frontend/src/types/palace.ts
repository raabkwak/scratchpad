export type Memory = {
  id: string;
  title: string;
  summary: string;
  timestamp: string;
  author: string;
  tokens: number;
};

export type Room = {
  id: string;
  label: string;
  memories: Memory[];
};

export type Hall = {
  id: string;
  label: string;
  rooms: Room[];
};

export type Wing = {
  id: string;
  label: string;
  halls: Hall[];
};

export type PalaceSnapshot = {
  wings: Wing[];
};

export type MemoryEvent = {
  type: "memory_created" | "memory_updated" | "memory_deleted" | "room_stats_updated";
  wing_id: string;
  hall_id: string;
  room_id: string;
  payload: Record<string, unknown>;
  timestamp: string;
  sequence: number;
};
