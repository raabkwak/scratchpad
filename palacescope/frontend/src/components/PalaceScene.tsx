import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { memo, useMemo } from "react";
import type { PalaceSnapshot, Room } from "../types/palace";

const WING_RADIUS = 40;
const HALL_SPACING = 12;
const ROOM_SPACING = 6;

function RoomBlock({ room, position, onSelect }: { room: Room; position: [number, number, number]; onSelect?: (room: Room) => void }) {
  return (
    <mesh position={position} onClick={() => onSelect?.(room)}>
      <boxGeometry args={[4, 2, 4]} />
      <meshStandardMaterial color="#8ec5ff" />
    </mesh>
  );
}

const SceneContent = memo(({ snapshot, onSelect }: { snapshot?: PalaceSnapshot; onSelect?: (room: Room) => void }) => {
  const nodes = useMemo(() => {
    if (!snapshot) return [] as Array<{ room: Room; position: [number, number, number] }>;
    const result: Array<{ room: Room; position: [number, number, number] }> = [];
    snapshot.wings.forEach((wing, wingIndex) => {
      const angle = (wingIndex / Math.max(snapshot.wings.length, 1)) * Math.PI * 2;
      const wingX = Math.cos(angle) * WING_RADIUS;
      const wingZ = Math.sin(angle) * WING_RADIUS;
      wing.halls.forEach((hall, hallIndex) => {
        hall.rooms.forEach((room, roomIndex) => {
          const x = wingX + hallIndex * HALL_SPACING;
          const z = wingZ + roomIndex * ROOM_SPACING;
          result.push({ room, position: [x, 1 + hallIndex * 0.2, z] });
        });
      });
    });
    return result;
  }, [snapshot]);

  return (
    <group>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={0.6} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0b1a24" />
      </mesh>
      {nodes.map(({ room, position }) => (
        <RoomBlock key={room.id} room={room} position={position} onSelect={onSelect} />
      ))}
    </group>
  );
});

export function PalaceScene({ snapshot, onSelect }: { snapshot?: PalaceSnapshot; onSelect?: (room: Room) => void }) {
  return (
    <Canvas camera={{ position: [0, 30, 70], fov: 50 }} style={{ width: "100%", height: "100%" }}>
      <color attach="background" args={["#030712"]} />
      <Stars radius={50} depth={20} count={2000} factor={4} fade speed={1} />
      <SceneContent snapshot={snapshot} onSelect={onSelect} />
      <OrbitControls enablePan enableZoom enableRotate />
    </Canvas>
  );
}
