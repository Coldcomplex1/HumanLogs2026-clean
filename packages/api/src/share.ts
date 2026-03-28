export const genderEnumValues = ["male", "female", "other"] as const;

export const needTypeEnumValues = [
  "thuoc",
  "nuoc",
  "luong_thuc",
  "sua_em_be",
  "so_tan",
  "sac_dien",
  "ao_phao",
  "ve_sinh",
  "lien_lac",
] as const;

export const emergencyLevelEnumValues = [
  "critical",
  "high",
  "medium",
] as const;

export const locationStatusEnumValues = [
  "active",
  "in_progress",
  "safe",
] as const;

export const routeConfidenceEnumValues = [
  "high",
  "medium",
  "low",
  "unverified",
  "dangerous",
] as const;

export const transportModeEnumValues = [
  "road",
  "boat",
  "walk",
  "ambulance",
  "drone",
  "hand_off",
] as const;

export const locationSourceEnumValues = [
  "call",
  "chat",
  "manual",
  "web",
] as const;

export const markerTypeEnumValues = ["mark", "area", "route"] as const;

export const markerMarkTypeEnumValues = [
  "flood_area",
  "strong_current",
  "blocked_road",
  "electric_hazard",
  "debris",
  "dangerous",
  "safe_pickup",
  "shelter",
  "medical_point",
  "supply_drop",
] as const;

export const vehicleTypeEnumValues = [
  "boat",
  "truck",
  "ambulance",
  "motorbike",
  "drone",
] as const;

export const vehicleStatusEnumValues = [
  "available",
  "on_mission",
  "maintenance",
  "offline",
] as const;

export const rescuerRoleEnumValues = [
  "medic",
  "boat_operator",
  "driver",
  "logistics",
  "coordinator",
  "diver",
  "volunteer",
] as const;

export const rescuerStatusEnumValues = [
  "available",
  "on_mission",
  "off_duty",
  "injured",
] as const;

export const rescuerExperienceLevelEnumValues = [
  "junior",
  "intermediate",
  "senior",
  "lead",
] as const;

export const rescuePlanStatusEnumValues = [
  "draft",
  "active",
  "completed",
  "cancelled",
] as const;

export const rescuePlanPriorityEnumValues = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const conversationChannelEnumValues = ["call", "chat"] as const;

export const conversationStatusEnumValues = [
  "initiated",
  "in_progress",
  "processing",
  "done",
  "failed",
] as const;

export type GenderEnumValues = typeof genderEnumValues;
export type NeedTypeEnumValues = typeof needTypeEnumValues;
