"use client";

import { memo } from "react";
import { BODY_PARTS } from "@/constants/bodyParts";
import BodyPart from "./BodyPart";

interface HumanBodyProps {
  selectedIds: Set<string>;
  onSelect: (id: string, name: string) => void;
  onHover: (id: string | null, name: string | null) => void;
}

function HumanBody({ selectedIds, onSelect, onHover }: HumanBodyProps) {
  return (
    <group position={[0, -0.9, 0]}>
      {BODY_PARTS.map((definition) => (
        <BodyPart
          key={definition.id}
          definition={definition}
          selected={selectedIds.has(definition.id)}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </group>
  );
}

export default memo(HumanBody);
