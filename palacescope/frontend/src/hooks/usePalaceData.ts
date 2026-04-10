import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "../lib/api";
import type { MemoryEvent, PalaceSnapshot, Wing, Hall, Room } from "../types/palace";

const HIERARCHY_KEY = ["palace", "hierarchy"];

export function usePalaceHierarchy() {
  return useQuery({
    queryKey: HIERARCHY_KEY,
    queryFn: async () => {
      const { data } = await api.get<PalaceSnapshot>("/hierarchy");
      return data;
    },
    staleTime: 5_000,
  });
}

export function useLiveEvents() {
  const client = useQueryClient();

  useEffect(() => {
    const url = new URL("/events/stream", api.defaults.baseURL);
    const source = new EventSource(url.toString());

    source.onmessage = (evt) => {
      try {
        const event: MemoryEvent = JSON.parse(evt.data);
        client.setQueryData<PalaceSnapshot | undefined>(HIERARCHY_KEY, (snapshot) => {
          if (!snapshot) return snapshot;
          const copy: PalaceSnapshot = JSON.parse(JSON.stringify(snapshot));
          const wing = copy.wings.find((w: Wing) => w.id === event.wing_id);
          const hall = wing?.halls.find((h: Hall) => h.id === event.hall_id);
          const room = hall?.rooms.find((r: Room) => r.id === event.room_id);
          if (!room) return snapshot;

          if (event.type === "memory_created" && event.payload) {
            room.memories.push({
              id: String(event.payload.id ?? `mem-${event.sequence}`),
              title: String(event.payload.title ?? "New memory"),
              summary: String(event.payload.summary ?? ""),
              timestamp: new Date().toISOString(),
              tokens: Number(event.payload.tokens ?? 0),
              author: String(event.payload.author ?? "unknown"),
            });
          }
          return copy;
        });
      } catch (err) {
        console.error("Failed to parse SSE payload", err);
      }
    };

    source.onerror = () => {
      console.warn("Event stream disconnected — waiting for browser retry");
    };

    return () => source.close();
  }, [client]);
}
