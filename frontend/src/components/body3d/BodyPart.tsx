"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { BodyPartMeshProps } from "@/types/body";

const COLOR_DEFAULT = new THREE.Color("#c9cdd6");
const COLOR_HOVER = new THREE.Color("#7fb2ff");
const COLOR_SELECTED = new THREE.Color("#2563eb");
const COLOR_SELECTED_HOVER = new THREE.Color("#1e3a8a");

const SEVERITY_COLORS: Record<number, THREE.Color> = {
  1: new THREE.Color("#a8e6cf"),
  2: new THREE.Color("#4caf50"),
  3: new THREE.Color("#ffeb3b"),
  4: new THREE.Color("#ff9800"),
  5: new THREE.Color("#f44336"),
};

function buildGeometry(geometry: BodyPartMeshProps["definition"]["geometry"], args: number[]) {
  switch (geometry) {
    case "sphere":
      return new THREE.SphereGeometry(...(args as [number, number, number]));
    case "capsule":
      return new THREE.CapsuleGeometry(...(args as [number, number, number, number]));
    case "cylinder":
      return new THREE.CylinderGeometry(...(args as [number, number, number, number]));
    case "box":
    default:
      return new THREE.BoxGeometry(...(args as [number, number, number]));
  }
}

export default function BodyPart({ definition, selected, severity, onSelect, onHover }: BodyPartMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const geometry = useMemo(
    () => buildGeometry(definition.geometry, definition.args),
    [definition.geometry, definition.args]
  );

  const targetColor = useMemo(() => {
    if (selected && severity !== undefined) {
      const c = SEVERITY_COLORS[severity];
      return hovered ? c.clone().multiplyScalar(0.8) : c;
    }
    if (selected && hovered) return COLOR_SELECTED_HOVER;
    if (selected) return COLOR_SELECTED;
    if (hovered) return COLOR_HOVER;
    return COLOR_DEFAULT;
  }, [selected, hovered, severity]);

  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    const mat = matRef.current;
    const mesh = meshRef.current;
    if (!mat || !mesh) return;
    mat.color.lerp(targetColor, Math.min(1, delta * 10));
    mat.emissive.lerp(hovered || selected ? targetColor : new THREE.Color("#000000"), Math.min(1, delta * 10));
    mat.emissiveIntensity = selected ? 0.55 : hovered ? 0.4 : 0.15;

    const pulse = selected ? 1.04 : hovered ? 1.02 : 1;
    const [bx, by, bz] = definition.scale ?? [1, 1, 1];
    mesh.scale.lerp(new THREE.Vector3(bx * pulse, by * pulse, bz * pulse), Math.min(1, delta * 12));
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover(definition.id, definition.name);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    onHover(null, null);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(definition.id, definition.name);
  };

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={definition.position}
      rotation={definition.rotation ?? [0, 0, 0]}
      scale={definition.scale ?? [1, 1, 1]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      castShadow
      receiveShadow
      userData={{ id: definition.id, name: definition.name }}
    >
      <meshStandardMaterial
        ref={matRef}
        color={COLOR_DEFAULT}
        emissive={"#000000"}
        emissiveIntensity={0.35}
        roughness={0.55}
        metalness={0.05}
      />
    </mesh>
  );
}
