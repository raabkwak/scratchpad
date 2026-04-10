import "./App.css";
import { useState } from "react";
import { PalaceScene } from "./components/PalaceScene";
import { Overlay } from "./components/Overlay";
import { usePalaceHierarchy, useLiveEvents } from "./hooks/usePalaceData";
import type { Room } from "./types/palace";
import { useQuery } from "@tanstack/react-query";
import { api } from "./lib/api";

export default function App() {
  const { data: snapshot } = usePalaceHierarchy();
  useLiveEvents();
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(undefined);

  const { data: stats } = useQuery({
    queryKey: ["palace", "stats"],
    queryFn: async () => {
      const { data } = await api.get("/stats");
      return data;
    },
    staleTime: 5_000,
  });

  const handleSelect = (room: Room) => {
    setSelectedRoom(room);
  };

  return (
    <div className="app-shell">
      <Overlay selected={selectedRoom} stats={stats} />
      <div className="scene-wrapper">
        <PalaceScene snapshot={snapshot} onSelect={handleSelect} />
      </div>
    </div>
  );
}
