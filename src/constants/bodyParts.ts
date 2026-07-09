import type { BodyPartDefinition, PrimitiveGeometry } from "@/types/body";

function def(
  id: string,
  name: string,
  geometry: PrimitiveGeometry,
  args: number[],
  position: [number, number, number],
  group: BodyPartDefinition["group"],
  rotation?: [number, number, number]
): BodyPartDefinition {
  return { id, name, geometry, args, position, rotation, group };
}

function bilateral(
  idBase: string,
  nameBase: string,
  geometry: PrimitiveGeometry,
  args: number[],
  rightPosition: [number, number, number],
  group: BodyPartDefinition["group"],
  rotation?: [number, number, number]
): BodyPartDefinition[] {
  const [x, y, z] = rightPosition;
  const mirroredRot: [number, number, number] | undefined = rotation
    ? [rotation[0], -rotation[1], -rotation[2]]
    : undefined;
  return [
    def(`left-${idBase}`, `Left ${nameBase}`, geometry, args, [-x, y, z], group, mirroredRot),
    def(`right-${idBase}`, `Right ${nameBase}`, geometry, args, [x, y, z], group, rotation),
  ];
}

const parts: BodyPartDefinition[] = [];

parts.push(
  def("scalp", "Scalp", "sphere", [0.135, 16, 16], [0, 1.71, -0.01], "head"),
  def("crown-of-head", "Crown of Head", "sphere", [0.07, 12, 12], [0, 1.79, 0], "head"),
  def("forehead", "Forehead", "sphere", [0.09, 12, 12], [0, 1.68, 0.11], "head"),
  def("back-of-head", "Back of Head", "sphere", [0.1, 12, 12], [0, 1.68, -0.12], "head"),
  def("occipital-region", "Occipital Region", "sphere", [0.06, 10, 10], [0, 1.62, -0.13], "head"),
  def("bridge-of-nose", "Bridge of Nose", "box", [0.03, 0.06, 0.04], [0, 1.63, 0.15], "head"),
  def("chin", "Chin", "sphere", [0.045, 10, 10], [0, 1.53, 0.13], "head"),
  def("upper-jaw", "Upper Jaw", "box", [0.14, 0.04, 0.1], [0, 1.575, 0.1], "head"),
  def("lower-jaw", "Lower Jaw", "box", [0.13, 0.04, 0.1], [0, 1.545, 0.1], "head")
);
parts.push(...bilateral("temple", "Temple", "sphere", [0.035, 8, 8], [0.11, 1.67, 0.05], "head"));
parts.push(...bilateral("eye", "Eye", "sphere", [0.025, 10, 10], [0.045, 1.655, 0.14], "head"));
parts.push(...bilateral("eyelid", "Eyelid", "box", [0.05, 0.015, 0.02], [0.045, 1.67, 0.145], "head"));
parts.push(...bilateral("nostril", "Nostril", "sphere", [0.015, 8, 8], [0.02, 1.615, 0.165], "head"));
parts.push(...bilateral("cheek", "Cheek", "sphere", [0.05, 10, 10], [0.08, 1.6, 0.11], "head"));
parts.push(...bilateral("ear", "Ear", "sphere", [0.035, 0.06, 0.02], [0.13, 1.63, -0.01], "head"));

parts.push(
  def("front-neck", "Front Neck", "box", [0.09, 0.1, 0.05], [0, 1.46, 0.075], "neck"),
  def("back-neck", "Back Neck", "box", [0.09, 0.1, 0.05], [0, 1.46, -0.075], "neck"),
  def("throat", "Throat", "sphere", [0.03, 8, 8], [0, 1.45, 0.09], "neck"),
  def("base-of-neck", "Base of Neck", "cylinder", [0.09, 0.1, 0.04, 12], [0, 1.415, 0], "neck"),
  def("cervical-spine", "Cervical Spine", "capsule", [0.02, 0.14, 4, 8], [0, 1.46, -0.06], "spine")
);
parts.push(...bilateral("side-neck", "Side Neck", "box", [0.03, 0.1, 0.08], [0.09, 1.46, 0], "neck"));

parts.push(...bilateral("collarbone", "Collarbone", "capsule", [0.015, 0.14, 4, 8], [0.14, 1.415, 0.06], "shoulder", [0, 0, 0.25]));
parts.push(...bilateral("front-shoulder", "Front Shoulder", "sphere", [0.075, 12, 12], [0.22, 1.4, 0.05], "shoulder"));
parts.push(...bilateral("rear-shoulder", "Rear Shoulder", "sphere", [0.075, 12, 12], [0.22, 1.4, -0.05], "shoulder"));
parts.push(...bilateral("shoulder-joint", "Shoulder Joint", "sphere", [0.065, 12, 12], [0.26, 1.38, 0], "shoulder"));

parts.push(
  def("center-chest", "Center Chest", "box", [0.12, 0.1, 0.09], [0, 1.29, 0.14], "chest"),
  def("upper-chest", "Upper Chest", "box", [0.28, 0.08, 0.1], [0, 1.35, 0.11], "chest"),
  def("lower-chest", "Lower Chest", "box", [0.26, 0.08, 0.1], [0, 1.22, 0.1], "chest"),
  def("breastbone", "Breastbone", "capsule", [0.015, 0.16, 4, 8], [0, 1.28, 0.15], "chest")
);
parts.push(...bilateral("chest-side", "Chest", "sphere", [0.09, 12, 12], [0.14, 1.28, 0.1], "chest"));
parts.push(...bilateral("rib-cage", "Rib Cage", "sphere", [0.1, 12, 12], [0.16, 1.22, 0.03], "chest"));
parts.push(...bilateral("pectoral-region", "Pectoral Region", "sphere", [0.08, 10, 10], [0.11, 1.31, 0.13], "chest"));

parts.push(
  def("upper-abdomen", "Upper Abdomen", "box", [0.22, 0.09, 0.09], [0, 1.12, 0.11], "abdomen"),
  def("lower-abdomen", "Lower Abdomen", "box", [0.2, 0.09, 0.09], [0, 1.02, 0.11], "abdomen"),
  def("navel-region", "Navel Region", "sphere", [0.02, 8, 8], [0, 1.06, 0.15], "abdomen")
);
parts.push(...bilateral("upper-abdomen-side", "Upper Abdomen", "sphere", [0.06, 10, 10], [0.13, 1.12, 0.09], "abdomen"));
parts.push(...bilateral("lower-abdomen-side", "Lower Abdomen", "sphere", [0.06, 10, 10], [0.12, 1.02, 0.09], "abdomen"));

parts.push(
  def("upper-spine", "Upper Spine", "capsule", [0.025, 0.16, 4, 8], [0, 1.33, -0.11], "spine"),
  def("between-shoulder-blades", "Between Shoulder Blades", "box", [0.1, 0.09, 0.06], [0, 1.34, -0.13], "upperBack"),
  def("thoracic-spine", "Thoracic Spine", "capsule", [0.025, 0.22, 4, 8], [0, 1.24, -0.12], "spine")
);
parts.push(...bilateral("upper-back-side", "Upper Back", "sphere", [0.09, 12, 12], [0.14, 1.31, -0.1], "upperBack"));
parts.push(...bilateral("scapula", "Scapula", "box", [0.09, 0.11, 0.03], [0.11, 1.32, -0.12], "upperBack", [0, 0, 0.15]));

parts.push(
  def("lumbar-spine", "Lumbar Spine", "capsule", [0.025, 0.16, 4, 8], [0, 1.06, -0.12], "spine"),
  def("center-lower-back", "Center Lower Back", "box", [0.1, 0.1, 0.06], [0, 1.0, -0.12], "lowerBack"),
  def("sacrum", "Sacrum", "box", [0.09, 0.08, 0.05], [0, 0.9, -0.11], "lowerBack"),
  def("tailbone", "Tailbone", "sphere", [0.025, 8, 8], [0, 0.85, -0.1], "lowerBack")
);
parts.push(...bilateral("lower-back-side", "Lower Back", "sphere", [0.08, 12, 12], [0.11, 1.0, -0.1], "lowerBack"));

parts.push(
  def("upper-thoracic-spine", "Upper Thoracic Spine", "capsule", [0.02, 0.08, 4, 8], [0, 1.34, -0.115], "spine"),
  def("mid-thoracic-spine", "Mid Thoracic Spine", "capsule", [0.02, 0.08, 4, 8], [0, 1.26, -0.12], "spine"),
  def("lower-thoracic-spine", "Lower Thoracic Spine", "capsule", [0.02, 0.08, 4, 8], [0, 1.18, -0.12], "spine"),
  def("upper-lumbar-spine", "Upper Lumbar Spine", "capsule", [0.02, 0.08, 4, 8], [0, 1.1, -0.12], "spine"),
  def("lower-lumbar-spine", "Lower Lumbar Spine", "capsule", [0.02, 0.08, 4, 8], [0, 1.0, -0.115], "spine")
);

parts.push(
  def("pelvis", "Pelvis", "box", [0.26, 0.14, 0.14], [0, 0.83, 0], "pelvis"),
  def("pubic-region", "Pubic Region", "sphere", [0.045, 10, 10], [0, 0.76, 0.08], "pelvis")
);
parts.push(...bilateral("groin", "Groin", "sphere", [0.045, 10, 10], [0.08, 0.76, 0.06], "pelvis"));
parts.push(...bilateral("hip-joint", "Hip Joint", "sphere", [0.06, 12, 12], [0.15, 0.79, 0], "pelvis"));

parts.push(
  ...bilateral("upper-arm-front", "Upper Arm Front", "capsule", [0.05, 0.18, 4, 8], [0.28, 1.2, 0.03], "arm", [0, 0, 0.06])
);
parts.push(
  ...bilateral("upper-arm-back", "Upper Arm Back", "capsule", [0.05, 0.18, 4, 8], [0.28, 1.2, -0.03], "arm", [0, 0, 0.06])
);
parts.push(...bilateral("bicep", "Bicep", "capsule", [0.052, 0.16, 4, 8], [0.285, 1.21, 0.035], "arm", [0, 0, 0.06]));
parts.push(...bilateral("tricep", "Tricep", "capsule", [0.05, 0.16, 4, 8], [0.285, 1.21, -0.035], "arm", [0, 0, 0.06]));
parts.push(...bilateral("elbow-inner", "Elbow Inner", "sphere", [0.045, 10, 10], [0.29, 1.03, 0.02], "arm"));
parts.push(...bilateral("elbow-outer", "Elbow Outer", "sphere", [0.045, 10, 10], [0.29, 1.03, -0.02], "arm"));
parts.push(
  ...bilateral("forearm-top", "Forearm Top", "capsule", [0.04, 0.17, 4, 8], [0.3, 0.9, 0.02], "arm", [0, 0, 0.04])
);
parts.push(
  ...bilateral("forearm-bottom", "Forearm Bottom", "capsule", [0.04, 0.17, 4, 8], [0.3, 0.9, -0.02], "arm", [0, 0, 0.04])
);
parts.push(...bilateral("wrist-front", "Wrist Front", "sphere", [0.032, 8, 8], [0.31, 0.79, 0.015], "arm"));
parts.push(...bilateral("wrist-back", "Wrist Back", "sphere", [0.032, 8, 8], [0.31, 0.79, -0.015], "arm"));
parts.push(...bilateral("palm", "Palm", "box", [0.045, 0.08, 0.02], [0.315, 0.72, 0.015], "hand"));
parts.push(...bilateral("back-hand", "Back Hand", "box", [0.045, 0.08, 0.02], [0.315, 0.72, -0.015], "hand"));

type FingerSpec = { idBase: string; name: string; xOffset: number; length: number; zOffset?: number };

const fingerSpecs: FingerSpec[] = [
  { idBase: "thumb", name: "Thumb", xOffset: -0.025, length: 0.045, zOffset: 0.025 },
  { idBase: "index-finger", name: "Index Finger", xOffset: -0.015, length: 0.055 },
  { idBase: "middle-finger", name: "Middle Finger", xOffset: 0.0, length: 0.06 },
  { idBase: "ring-finger", name: "Ring Finger", xOffset: 0.015, length: 0.055 },
  { idBase: "little-finger", name: "Little Finger", xOffset: 0.028, length: 0.045 },
];

for (const f of fingerSpecs) {
  parts.push(
    ...bilateral(
      f.idBase,
      f.name,
      "capsule",
      [0.011, f.length, 4, 6],
      [0.315 + f.xOffset, 0.66 - f.length / 2, f.zOffset ?? 0.015],
      "fingers"
    )
  );
}

parts.push(
  ...bilateral("front-thigh", "Front Thigh", "capsule", [0.08, 0.24, 4, 8], [0.11, 0.68, 0.03], "leg", [0, 0, 0.03])
);
parts.push(
  ...bilateral("rear-thigh", "Rear Thigh", "capsule", [0.08, 0.24, 4, 8], [0.11, 0.68, -0.03], "leg", [0, 0, 0.03])
);
parts.push(...bilateral("inner-thigh", "Inner Thigh", "sphere", [0.06, 10, 10], [0.06, 0.6, 0], "leg"));
parts.push(...bilateral("outer-thigh", "Outer Thigh", "sphere", [0.07, 10, 10], [0.16, 0.6, 0], "leg"));
parts.push(...bilateral("knee-front", "Knee Front", "sphere", [0.06, 12, 12], [0.11, 0.45, 0.03], "leg"));
parts.push(...bilateral("knee-back", "Knee Back", "sphere", [0.055, 12, 12], [0.11, 0.45, -0.03], "leg"));
parts.push(...bilateral("knee-inner", "Knee Inner", "sphere", [0.045, 10, 10], [0.075, 0.45, 0], "leg"));
parts.push(...bilateral("knee-outer", "Knee Outer", "sphere", [0.045, 10, 10], [0.14, 0.45, 0], "leg"));
parts.push(
  ...bilateral("shin", "Shin", "capsule", [0.055, 0.24, 4, 8], [0.11, 0.28, 0.03], "leg", [0, 0, 0.02])
);
parts.push(
  ...bilateral("calf", "Calf", "capsule", [0.06, 0.24, 4, 8], [0.11, 0.28, -0.03], "leg", [0, 0, 0.02])
);
parts.push(...bilateral("ankle-inner", "Ankle Inner", "sphere", [0.035, 8, 8], [0.075, 0.09, 0], "leg"));
parts.push(...bilateral("ankle-outer", "Ankle Outer", "sphere", [0.035, 8, 8], [0.14, 0.09, 0], "leg"));

parts.push(...bilateral("heel", "Heel", "sphere", [0.05, 10, 10], [0.11, 0.04, -0.08], "foot"));
parts.push(...bilateral("sole", "Sole", "box", [0.09, 0.03, 0.2], [0.11, 0.015, 0.04], "foot"));
parts.push(...bilateral("top-foot", "Top Foot", "box", [0.08, 0.04, 0.18], [0.11, 0.05, 0.05], "foot"));

type ToeSpec = { idBase: string; name: string; xOffset: number; length: number };

const toeSpecs: ToeSpec[] = [
  { idBase: "big-toe", name: "Big Toe", xOffset: -0.06, length: 0.045 },
  { idBase: "second-toe", name: "Second Toe", xOffset: -0.03, length: 0.04 },
  { idBase: "third-toe", name: "Third Toe", xOffset: 0.0, length: 0.035 },
  { idBase: "fourth-toe", name: "Fourth Toe", xOffset: 0.03, length: 0.032 },
  { idBase: "little-toe", name: "Little Toe", xOffset: 0.055, length: 0.028 },
];

for (const t of toeSpecs) {
  parts.push(
    ...bilateral(
      t.idBase,
      t.name,
      "capsule",
      [0.014, t.length, 4, 6],
      [0.11 + t.xOffset, 0.03, 0.14 + t.length / 2],
      "toes",
      [Math.PI / 2, 0, 0]
    )
  );
}

export const BODY_PARTS: BodyPartDefinition[] = parts;

export const BODY_PART_BY_ID: Record<string, BodyPartDefinition> = Object.fromEntries(
  parts.map((p) => [p.id, p])
);
