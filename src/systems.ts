import { HeartPulse, Wind, Bone, Dumbbell, Utensils } from "lucide-react";

export const systems = [
  {
    id: "cardiovascular",
    label: "Cardiovascular",
    organ: "Heart",
    icon: HeartPulse,
    meshes: ["Heart"],
    primary: { label: "Heart rate", value: "68", unit: "bpm" },
    readings: [
      { label: "Blood pressure", value: "118 / 76", unit: "mmHg" },
      { label: "Heart-rate variability", value: "52", unit: "ms" },
    ],
    note: "Explore the heart and its place within the chest. These readings are a fixed example, not a live assessment.",
  },
  {
    id: "respiratory",
    label: "Respiratory",
    organ: "Lungs",
    icon: Wind,
    meshes: ["Lung_left", "Lung_right"],
    primary: { label: "Oxygen saturation", value: "98", unit: "%" },
    readings: [
      { label: "Respiratory rate", value: "14", unit: "breaths/min" },
      { label: "Cabin CO₂", value: "2.1", unit: "mmHg" },
    ],
    note: "Both lungs are highlighted. Sample breathing and cabin readings are shown together for this prototype.",
  },
  {
    id: "skeletal",
    label: "Skeletal",
    organ: "Skeleton",
    icon: Bone,
    meshes: ["Skeleton"],
    primary: { label: "Bone density baseline", value: "100", unit: "%" },
    readings: [
      { label: "Baseline change", value: "−0.4", unit: "%" },
      { label: "Mission day", value: "42", unit: "days" },
    ],
    note: "The simplified skeleton provides the body’s structural context. Baseline values are illustrative.",
  },
  {
    id: "muscular",
    label: "Muscular",
    organ: "Thigh muscles",
    icon: Dumbbell,
    meshes: ["Quadriceps_left", "Quadriceps_right"],
    primary: { label: "Exercise today", value: "90", unit: "min" },
    readings: [
      { label: "Resistance training", value: "45", unit: "min" },
      { label: "Grip strength", value: "42", unit: "kg" },
    ],
    note: "The left and right rectus femoris muscles represent the muscular system. Activity readings are sample entries.",
  },
  {
    id: "digestive",
    label: "Digestive",
    organ: "Liver & stomach",
    icon: Utensils,
    meshes: ["Liver", "Stomach"],
    primary: { label: "Energy intake", value: "2,350", unit: "kcal" },
    readings: [
      { label: "Water intake", value: "2.4", unit: "L" },
      { label: "Meals logged", value: "3", unit: "meals" },
    ],
    note: "The liver and stomach are kept as separate named meshes. Nutrition totals are simulated for this session.",
  },
] as const;
export type SystemId = (typeof systems)[number]["id"];
export const requiredMeshes = systems.flatMap((system) => [...system.meshes]);
