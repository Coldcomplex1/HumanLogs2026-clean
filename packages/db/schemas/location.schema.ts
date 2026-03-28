import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { victim } from "./victim.schema";
import { label } from "./label.schema";
import { rescuePlanLocation } from "./rescue-plan.schema";
import { routeReport } from "./route-report.schema";
import { conversation } from "./conversation.schema";
import { timestamps } from "./share";

export const emergencyLevelEnum = pgEnum("emergency_level", [
  "critical",
  "high",
  "medium",
]);
export const locationStatusEnum = pgEnum("location_status", [
  "active",
  "in_progress",
  "safe",
]);
export const routeConfidenceEnum = pgEnum("route_confidence", [
  "high",
  "medium",
  "low",
  "unverified",
  "dangerous",
]);
export const transportModeEnum = pgEnum("transport_mode", [
  "road",
  "boat",
  "walk",
  "ambulance",
  "drone",
  "hand_off",
]);
export const locationSourceEnum = pgEnum("location_source", [
  "call",
  "chat",
  "manual",
  "web",
]);

export const emergencyLevelEnumValues = emergencyLevelEnum.enumValues;
export const locationStatusEnumValues = locationStatusEnum.enumValues;
export const routeConfidenceEnumValues = routeConfidenceEnum.enumValues;
export const transportModeEnumValues = transportModeEnum.enumValues;
export const locationSourceEnumValues = locationSourceEnum.enumValues;

export type EmergencyLevelEnumValues = typeof emergencyLevelEnumValues;
export type EmergencyLevelEnum = EmergencyLevelEnumValues[number];
export type LocationStatusEnum = (typeof locationStatusEnumValues)[number];
export type RouteConfidenceEnum = (typeof routeConfidenceEnumValues)[number];
export type TransportModeEnum = (typeof transportModeEnumValues)[number];
export type LocationSourceEnum = (typeof locationSourceEnumValues)[number];

export const location = pgTable("location", {
  id: uuid("id").primaryKey().defaultRandom(),
  summary: text("summary"),
  note: text("note"),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  address: text("address"),
  emergencyLevel: emergencyLevelEnum("emergency_level")
    .default("medium")
    .notNull(),
  status: locationStatusEnum("status").default("active").notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  tags: text("tags").array().default([]).notNull(),
  labelId: uuid("label_id").references(() => label.id, {
    onDelete: "set null",
  }),
  routeConfidence: routeConfidenceEnum("route_confidence")
    .default("unverified")
    .notNull(),
  preferredTransportMode: transportModeEnum("preferred_transport_mode").default(
    "road",
  ),
  source: locationSourceEnum("source").default("manual").notNull(),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  ...timestamps,
});

export type Location = typeof location.$inferSelect;

export const locationRelations = relations(location, ({ one, many }) => ({
  victims: many(victim),
  label: one(label, {
    fields: [location.labelId],
    references: [label.id],
  }),
  rescuePlanLinks: many(rescuePlanLocation),
  routeReports: many(routeReport),
  relatedConversations: many(conversation),
}));
