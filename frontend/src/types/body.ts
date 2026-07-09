export type PrimitiveGeometry = "sphere" | "capsule" | "cylinder" | "box";

export type BodyRegionGroup =
  | "head"
  | "neck"
  | "shoulder"
  | "chest"
  | "abdomen"
  | "upperBack"
  | "lowerBack"
  | "pelvis"
  | "arm"
  | "hand"
  | "fingers"
  | "leg"
  | "foot"
  | "toes"
  | "spine";

export interface BodyPartDefinition {
  id: string;
  name: string;
  geometry: PrimitiveGeometry;
  args: number[];
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  group: BodyRegionGroup;
}

export interface SelectedBodyPart {
  id: string;
  name: string;
  severity?: number;
}

export interface BodyPartMeshProps {
  definition: BodyPartDefinition;
  selected: boolean;
  severity?: number;
  onSelect: (id: string, name: string) => void;
  onHover: (id: string | null, name: string | null) => void;
}
