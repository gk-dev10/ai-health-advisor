"use client";

import { OrbitControls } from "@react-three/drei";
import HumanBody from "./HumanBody";

interface OrbitSceneProps {
  selectedIds: Set<string>;
  severities: Record<string, number>;
  onSelect: (id: string, name: string) => void;
  onHover: (id: string | null, name: string | null) => void;
}

export default function OrbitScene({ selectedIds, severities, onSelect, onHover }: OrbitSceneProps) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
      />
      <directionalLight position={[-3, 2, -4]} intensity={0.35} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.905, 0]} receiveShadow>
        <circleGeometry args={[1.4, 32]} />
        <shadowMaterial opacity={0.18} />
      </mesh>

      <HumanBody selectedIds={selectedIds} severities={severities} onSelect={onSelect} onHover={onHover} />

      <OrbitControls
        enableRotate
        enablePan
        enableZoom
        makeDefault
        target={[0, 0.15, 0]}
        minDistance={1.2}
        maxDistance={4}
        minPolarAngle={Math.PI * 0.12}
        maxPolarAngle={Math.PI * 0.85}
        maxAzimuthAngle={Infinity}
        minAzimuthAngle={-Infinity}
        panSpeed={0.6}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        screenSpacePanning
      />
    </>
  );
}
