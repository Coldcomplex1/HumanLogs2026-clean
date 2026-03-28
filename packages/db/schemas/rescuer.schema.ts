import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { rescuePlanRescuer } from "./rescue-plan.schema";
import { routeReport } from "./route-report.schema";
import { timestamps } from "./share";

export const rescuerRoleEnum = pgEnum("rescuer_role", [
  "medic",
  "boat_operator",
  "driver",
  "logistics",
  "coordinator",
  "diver",
  "volunteer",
]);

export const rescuerStatusEnum = pgEnum("rescuer_status", [
  "available",
  "on_mission",
  "off_duty",
  "injured",
]);

export const rescuerExperienceLevelEnum = pgEnum("rescuer_experience_level", [
  "junior",
  "intermediate",
  "senior",
  "lead",
]);

export const rescuerRoleEnumValues = rescuerRoleEnum.enumValues;
export const rescuerStatusEnumValues = rescuerStatusEnum.enumValues;
export const rescuerExperienceLevelEnumValues =
  rescuerExperienceLevelEnum.enumValues;

export type RescuerRoleEnumValues = typeof rescuerRoleEnumValues;
export type RescuerStatusEnumValues = typeof rescuerStatusEnumValues;
export type RescuerExperienceLevelEnumValues =
  typeof rescuerExperienceLevelEnumValues;

export const rescuer = pgTable("rescuer", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  secondaryPhone: text("secondary_phone"),
  email: text("email"),
  address: text("address"),
  role: rescuerRoleEnum("role").default("volunteer").notNull(),
  status: rescuerStatusEnum("status").default("available").notNull(),
  experienceLevel: rescuerExperienceLevelEnum("experience_level")
    .default("intermediate")
    .notNull(),
  certifications: text("certifications").array().default([]).notNull(),
  region: text("region"),
  avatarUrl: text("avatar_url"),
  note: text("note"),
  ...timestamps,
});

export type Rescuer = typeof rescuer.$inferSelect;

export const rescuerRelations = relations(rescuer, ({ many }) => ({
  rescuePlanLinks: many(rescuePlanRescuer),
  routeReports: many(routeReport),
}));
