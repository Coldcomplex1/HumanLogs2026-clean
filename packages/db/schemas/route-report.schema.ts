import { relations } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { location } from "./location.schema";
import { marker } from "./marker.schema";
import { rescuer } from "./rescuer.schema";
import { routeConfidenceEnum, transportModeEnum } from "./location.schema";
import { timestamps } from "./share";

export const routeReport = pgTable("route_report", {
  id: uuid("id").primaryKey().defaultRandom(),
  locationId: uuid("location_id").references(() => location.id, {
    onDelete: "set null",
  }),
  markerId: uuid("marker_id").references(() => marker.id, {
    onDelete: "set null",
  }),
  reporterId: uuid("reporter_id").references(() => rescuer.id, {
    onDelete: "set null",
  }),
  transportMode: transportModeEnum("transport_mode").default("road").notNull(),
  confidence: routeConfidenceEnum("confidence").default("medium").notNull(),
  isPassable: boolean("is_passable").default(true).notNull(),
  waterDepthText: text("water_depth_text"),
  currentStrengthText: text("current_strength_text"),
  note: text("note"),
  path: jsonb("path").$type<Array<[number, number]>>(),
  reportedAt: timestamp("reported_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  ...timestamps,
});

export type RouteReport = typeof routeReport.$inferSelect;

export const routeReportRelations = relations(routeReport, ({ one }) => ({
  location: one(location, {
    fields: [routeReport.locationId],
    references: [location.id],
  }),
  marker: one(marker, {
    fields: [routeReport.markerId],
    references: [marker.id],
  }),
  reporter: one(rescuer, {
    fields: [routeReport.reporterId],
    references: [rescuer.id],
  }),
}));
