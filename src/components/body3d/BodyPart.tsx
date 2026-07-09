"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { BodyPartMeshProps } from "@/types/body";

const COLOR_DEFAULT = new THREE.Color("#c9cdd6");
const COLOR_HOVER = new THREE.Color("#7fb2ff");
const COLOR_SELECTED = new THREE.Color("#2563eb");
const COLOR_SELECTED_HOVER = new THREE.Color("#1e3a8a");

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

export default function BodyPart({ definition, selected, onSelect, onHover }: BodyPartMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const geometry = useMemo(
    () => buildGeometry(definition.geometry, definition.args),
    [definition.geometry, definition.args]
  );

  const targetColor = useMemo(() => {
    if (selected && hovered) return COLOR_SELECTED_HOVER;
    if (selected) return COLOR_SELECTED;
    if (hovered) return COLOR_HOVER;
    return COLOR_DEFAULT;
  }, [selected, hovered]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: COLOR_DEFAULT.clone(),
        emissive: new THREE.Color("#000000"),
        emissiveIntensity: 0.35,
        roughness: 0.55,
        metalness: 0.05,
      }),
    []
  );

  useFrame((_, delta) => {
    const mat = material;
    mat.color.lerp(targetColor, Math.min(1, delta * 10));
    mat.emissive.lerp(hovered || selected ? targetColor : new THREE.Color("#000000"), Math.min(1, delta * 10));
    mat.emissiveIntensity = selected ? 0.55 : hovered ? 0.4 : 0.15;

    const targetScale = selected ? 1.04 : hovered ? 1.02 : 1;
    if (meshRef.current) {
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        Math.min(1, delta * 12)
      );
    }
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
      material={material}
      position={definition.position}
      rotation={definition.rotation ?? [0, 0, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      castShadow
      receiveShadow
      userData={{ id: definition.id, name: definition.name }}
    />
  );
}
