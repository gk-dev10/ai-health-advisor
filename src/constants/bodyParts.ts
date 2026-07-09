import type { BodyPartDefinition, PrimitiveGeometry } from "@/types/body";

type Vec3 = [number, number, number];

function def(
  id: string,
  name: string,
  geometry: PrimitiveGeometry,
  args: number[],
  position: Vec3,
  group: BodyPartDefinition["group"],
  rotation?: Vec3,
  scale?: Vec3
): BodyPartDefinition {
  return { id, name, geometry, args, position, rotation, scale, group };
}

function ellipsoid(
  id: string,
  name: string,
  radius: number,
  position: Vec3,
  scale: Vec3,
  group: BodyPartDefinition["group"],
  rotation?: Vec3,
  segments: [number, number] = [14, 12]
): BodyPartDefinition {
  return def(id, name, "sphere", [radius, segments[0], segments[1]], position, group, rotation, scale);
}

function bilateral(
  idBase: string,
  nameBase: string,
  geometry: PrimitiveGeometry,
  args: number[],
  rightPosition: Vec3,
  group: BodyPartDefinition["group"],
  rotation?: Vec3,
  scale?: Vec3
): BodyPartDefinition[] {
  const [x, y, z] = rightPosition;
  const mirroredRot: Vec3 | undefined = rotation ? [rotation[0], -rotation[1], -rotation[2]] : undefined;
  return [
    def(`left-${idBase}`, `Left ${nameBase}`, geometry, args, [-x, y, z], group, mirroredRot, scale),
    def(`right-${idBase}`, `Right ${nameBase}`, geometry, args, [x, y, z], group, rotation, scale),
  ];
}

function bilateralEllipsoid(
  idBase: string,
  nameBase: string,
  radius: number,
  rightPosition: Vec3,
  scale: Vec3,
  group: BodyPartDefinition["group"],
  rotation?: Vec3,
  segments: [number, number] = [14, 12]
): BodyPartDefinition[] {
  return bilateral(idBase, nameBase, "sphere", [radius, segments[0], segments[1]], rightPosition, group, rotation, scale);
}

const parts: BodyPartDefinition[] = [];

parts.push(
  ellipsoid("scalp", "Scalp", 0.135, [0, 1.71, -0.01], [1, 1.05, 1.05], "head"),
  ellipsoid("crown-of-head", "Crown of Head", 0.075, [0, 1.79, 0], [1.1, 0.8, 1.1], "head"),
  ellipsoid("forehead", "Forehead", 0.095, [0, 1.68, 0.1], [1.15, 0.85, 0.9], "head"),
  ellipsoid("back-of-head", "Back of Head", 0.1, [0, 1.68, -0.12], [1, 1, 0.9], "head"),
  ellipsoid("occipital-region", "Occipital Region", 0.065, [0, 1.62, -0.13], [1.1, 0.9, 0.8], "head"),
  ellipsoid("bridge-of-nose", "Bridge of Nose", 0.022, [0, 1.635, 0.155], [0.8, 1.6, 1], "head"),
  ellipsoid("chin", "Chin", 0.045, [0, 1.53, 0.13], [1.1, 0.9, 1], "head"),
  ellipsoid("upper-jaw", "Upper Jaw", 0.065, [0, 1.575, 0.095], [1.5, 0.55, 1.15], "head"),
  ellipsoid("lower-jaw", "Lower Jaw", 0.06, [0, 1.545, 0.09], [1.4, 0.5, 1.1], "head")
);
parts.push(...bilateralEllipsoid("temple", "Temple", 0.035, [0.11, 1.67, 0.05], [1, 1.2, 0.9], "head"));
parts.push(...bilateralEllipsoid("eye", "Eye", 0.025, [0.045, 1.655, 0.14], [1, 1, 1], "head", undefined, [10, 10]));
parts.push(
  ...bilateralEllipsoid("eyelid", "Eyelid", 0.026, [0.045, 1.669, 0.145], [1.5, 0.4, 0.9], "head", undefined, [8, 8])
);
parts.push(...bilateralEllipsoid("nostril", "Nostril", 0.015, [0.02, 1.615, 0.165], [1, 1, 1], "head", undefined, [8, 8]));
parts.push(...bilateralEllipsoid("cheek", "Cheek", 0.055, [0.08, 1.6, 0.1], [1.1, 1, 0.8], "head"));
parts.push(...bilateral("ear", "Ear", "capsule", [0.02, 0.045, 4, 8], [0.13, 1.63, -0.01], "head", [0, 0, Math.PI / 2]));

parts.push(
  ellipsoid("front-neck", "Front Neck", 0.065, [0, 1.46, 0.06], [1, 1.2, 0.65], "neck"),
  ellipsoid("back-neck", "Back Neck", 0.065, [0, 1.46, -0.06], [1, 1.2, 0.65], "neck"),
  def("throat", "Throat", "sphere", [0.03, 10, 10], [0, 1.45, 0.09], "neck"),
  def("base-of-neck", "Base of Neck", "cylinder", [0.09, 0.1, 0.04, 16], [0, 1.415, 0], "neck"),
  def("cervical-spine", "Cervical Spine", "capsule", [0.02, 0.14, 4, 8], [0, 1.46, -0.06], "spine")
);
parts.push(...bilateralEllipsoid("side-neck", "Side Neck", 0.05, [0.085, 1.46, 0], [0.7, 1.2, 1.3], "neck"));

parts.push(...bilateral("collarbone", "Collarbone", "capsule", [0.015, 0.14, 4, 8], [0.14, 1.415, 0.06], "shoulder", [0, 0, 0.25]));
parts.push(...bilateralEllipsoid("front-shoulder", "Front Shoulder", 0.075, [0.22, 1.4, 0.05], [1, 1, 1], "shoulder"));
parts.push(...bilateralEllipsoid("rear-shoulder", "Rear Shoulder", 0.075, [0.22, 1.4, -0.05], [1, 1, 1], "shoulder"));
parts.push(...bilateralEllipsoid("shoulder-joint", "Shoulder Joint", 0.065, [0.26, 1.38, 0], [1, 1, 1], "shoulder"));

parts.push(
  ellipsoid("center-chest", "Center Chest", 0.1, [0, 1.29, 0.13], [1.2, 1.0, 0.9], "chest"),
  ellipsoid("upper-chest", "Upper Chest", 0.15, [0, 1.35, 0.09], [1.85, 0.55, 0.75], "chest"),
  ellipsoid("lower-chest", "Lower Chest", 0.14, [0, 1.22, 0.08], [1.85, 0.6, 0.8], "chest"),
  def("breastbone", "Breastbone", "capsule", [0.015, 0.16, 4, 8], [0, 1.28, 0.15], "chest")
);
parts.push(...bilateralEllipsoid("chest-side", "Chest", 0.09, [0.14, 1.28, 0.1], [1, 1, 1], "chest"));
parts.push(...bilateralEllipsoid("rib-cage", "Rib Cage", 0.1, [0.16, 1.22, 0.02], [1, 1.15, 1], "chest"));
parts.push(...bilateralEllipsoid("pectoral-region", "Pectoral Region", 0.08, [0.11, 1.31, 0.12], [1.1, 1, 0.9], "chest"));

parts.push(
  ellipsoid("upper-abdomen", "Upper Abdomen", 0.13, [0, 1.12, 0.09], [1.55, 0.7, 0.75], "abdomen"),
  ellipsoid("lower-abdomen", "Lower Abdomen", 0.12, [0, 1.02, 0.09], [1.5, 0.7, 0.75], "abdomen"),
  ellipsoid("navel-region", "Navel Region", 0.02, [0, 1.06, 0.14], [1, 1, 0.6], "abdomen")
);
parts.push(...bilateralEllipsoid("upper-abdomen-side", "Upper Abdomen", 0.065, [0.13, 1.12, 0.08], [1, 1, 1], "abdomen"));
parts.push(...bilateralEllipsoid("lower-abdomen-side", "Lower Abdomen", 0.065, [0.12, 1.02, 0.08], [1, 1, 1], "abdomen"));

parts.push(
  def("upper-spine", "Upper Spine", "capsule", [0.025, 0.16, 4, 8], [0, 1.33, -0.11], "spine"),
  ellipsoid("between-shoulder-blades", "Between Shoulder Blades", 0.06, [0, 1.34, -0.13], [1.4, 1.1, 0.6], "upperBack"),
  def("thoracic-spine", "Thoracic Spine", "capsule", [0.025, 0.22, 4, 8], [0, 1.24, -0.12], "spine")
);
parts.push(...bilateralEllipsoid("upper-back-side", "Upper Back", 0.09, [0.14, 1.31, -0.1], [1, 1, 1], "upperBack"));
parts.push(
  ...bilateralEllipsoid("scapula", "Scapula", 0.065, [0.12, 1.32, -0.11], [1.3, 1.5, 0.45], "upperBack", [0.1, 0, 0.2])
);

parts.push(
  def("lumbar-spine", "Lumbar Spine", "capsule", [0.025, 0.16, 4, 8], [0, 1.06, -0.12], "spine"),
  ellipsoid("center-lower-back", "Center Lower Back", 0.065, [0, 1.0, -0.11], [1.3, 1.15, 0.7], "lowerBack"),
  ellipsoid("sacrum", "Sacrum", 0.055, [0, 0.9, -0.1], [1.2, 1.0, 0.65], "lowerBack"),
  def("tailbone", "Tailbone", "sphere", [0.025, 8, 8], [0, 0.85, -0.1], "lowerBack")
);
parts.push(...bilateralEllipsoid("lower-back-side", "Lower Back", 0.08, [0.11, 1.0, -0.1], [1, 1, 1], "lowerBack"));

parts.push(
  def("upper-thoracic-spine", "Upper Thoracic Spine", "capsule", [0.02, 0.08, 4, 8], [0, 1.34, -0.115], "spine"),
  def("mid-thoracic-spine", "Mid Thoracic Spine", "capsule", [0.02, 0.08, 4, 8], [0, 1.26, -0.12], "spine"),
  def("lower-thoracic-spine", "Lower Thoracic Spine", "capsule", [0.02, 0.08, 4, 8], [0, 1.18, -0.12], "spine"),
  def("upper-lumbar-spine", "Upper Lumbar Spine", "capsule", [0.02, 0.08, 4, 8], [0, 1.1, -0.12], "spine"),
  def("lower-lumbar-spine", "Lower Lumbar Spine", "capsule", [0.02, 0.08, 4, 8], [0, 1.0, -0.115], "spine")
);

parts.push(
  ellipsoid("pelvis", "Pelvis", 0.14, [0, 0.83, 0], [1.35, 0.85, 0.95], "pelvis"),
  ellipsoid("pubic-region", "Pubic Region", 0.045, [0, 0.76, 0.07], [1, 0.9, 0.9], "pelvis")
);
parts.push(...bilateralEllipsoid("groin", "Groin", 0.045, [0.08, 0.76, 0.05], [1, 1, 1], "pelvis"));
parts.push(...bilateralEllipsoid("hip-joint", "Hip Joint", 0.06, [0.15, 0.79, 0], [1, 1, 1], "pelvis"));

parts.push(
  ...bilateral("upper-arm-front", "Upper Arm Front", "capsule", [0.05, 0.18, 4, 8], [0.28, 1.2, 0.03], "arm", [0, 0, 0.06])
);
parts.push(
  ...bilateral("upper-arm-back", "Upper Arm Back", "capsule", [0.05, 0.18, 4, 8], [0.28, 1.2, -0.03], "arm", [0, 0, 0.06])
);
parts.push(...bilateral("bicep", "Bicep", "capsule", [0.052, 0.16, 4, 8], [0.285, 1.21, 0.035], "arm", [0, 0, 0.06]));
parts.push(...bilateral("tricep", "Tricep", "capsule", [0.05, 0.16, 4, 8], [0.285, 1.21, -0.035], "arm", [0, 0, 0.06]));
parts.push(...bilateralEllipsoid("elbow-inner", "Elbow Inner", 0.045, [0.29, 1.03, 0.02], [1, 1, 1], "arm"));
parts.push(...bilateralEllipsoid("elbow-outer", "Elbow Outer", 0.045, [0.29, 1.03, -0.02], [1, 1, 1], "arm"));
parts.push(
  ...bilateral("forearm-top", "Forearm Top", "capsule", [0.04, 0.17, 4, 8], [0.3, 0.9, 0.02], "arm", [0, 0, 0.04])
);
parts.push(
  ...bilateral("forearm-bottom", "Forearm Bottom", "capsule", [0.04, 0.17, 4, 8], [0.3, 0.9, -0.02], "arm", [0, 0, 0.04])
);
parts.push(...bilateralEllipsoid("wrist-front", "Wrist Front", 0.032, [0.31, 0.79, 0.015], [1, 1, 1], "arm", undefined, [8, 8]));
parts.push(...bilateralEllipsoid("wrist-back", "Wrist Back", 0.032, [0.31, 0.79, -0.015], [1, 1, 1], "arm", undefined, [8, 8]));
parts.push(
  ...bilateral("palm", "Palm", "capsule", [0.028, 0.05, 4, 8], [0.315, 0.7, 0.015], "hand", [0, 0, 0], [1.3, 1, 0.4])
);
parts.push(
  ...bilateral("back-hand", "Back Hand", "capsule", [0.028, 0.05, 4, 8], [0.315, 0.7, -0.015], "hand", [0, 0, 0], [1.3, 1, 0.4])
);

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
      [0.315 + f.xOffset, 0.645 - f.length / 2, f.zOffset ?? 0.015],
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
parts.push(...bilateralEllipsoid("inner-thigh", "Inner Thigh", 0.06, [0.06, 0.6, 0], [1, 1, 1], "leg"));
parts.push(...bilateralEllipsoid("outer-thigh", "Outer Thigh", 0.07, [0.16, 0.6, 0], [1, 1, 1], "leg"));
parts.push(...bilateralEllipsoid("knee-front", "Knee Front", 0.06, [0.11, 0.45, 0.03], [1, 1, 1], "leg"));
parts.push(...bilateralEllipsoid("knee-back", "Knee Back", 0.055, [0.11, 0.45, -0.03], [1, 1, 1], "leg"));
parts.push(...bilateralEllipsoid("knee-inner", "Knee Inner", 0.045, [0.075, 0.45, 0], [1, 1, 1], "leg"));
parts.push(...bilateralEllipsoid("knee-outer", "Knee Outer", 0.045, [0.14, 0.45, 0], [1, 1, 1], "leg"));
parts.push(
  ...bilateral("shin", "Shin", "capsule", [0.055, 0.24, 4, 8], [0.11, 0.28, 0.03], "leg", [0, 0, 0.02])
);
parts.push(
  ...bilateral("calf", "Calf", "capsule", [0.06, 0.24, 4, 8], [0.11, 0.28, -0.03], "leg", [0, 0, 0.02])
);
parts.push(...bilateralEllipsoid("ankle-inner", "Ankle Inner", 0.035, [0.075, 0.09, 0], [1, 1, 1], "leg", undefined, [8, 8]));
parts.push(...bilateralEllipsoid("ankle-outer", "Ankle Outer", 0.035, [0.14, 0.09, 0], [1, 1, 1], "leg", undefined, [8, 8]));

parts.push(...bilateralEllipsoid("heel", "Heel", 0.05, [0.11, 0.04, -0.08], [1, 1, 1], "foot"));
parts.push(...bilateralEllipsoid("sole", "Sole", 0.07, [0.11, 0.02, 0.04], [1.1, 0.35, 2.4], "foot"));
parts.push(...bilateralEllipsoid("top-foot", "Top Foot", 0.065, [0.11, 0.055, 0.05], [1.0, 0.55, 2.2], "foot"));

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
