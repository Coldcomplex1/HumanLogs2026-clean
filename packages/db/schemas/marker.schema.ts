import { relations } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { routeReport } from "./route-report.schema";
import { timestamps } from "./share";

export const markerTypeEnum = pgEnum("marker_type", ["mark", "area", "route"]);
export const markerMarkTypeEnum = pgEnum("marker_mark_type", [
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
]);

export const markerTypeEnumValues = markerTypeEnum.enumValues;
export const markerMarkTypeEnumValues = markerMarkTypeEnum.enumValues;

export const marker = pgTable("marker", {
  id: uuid("id").primaryKey().defaultRandom(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  note: text("note"),
  name: text("name"),
  color: text("color"),
  fillOpacity: real("fill_opacity"),
  isClosedPath: boolean("is_closed_path").default(false).notNull(),
  paths: jsonb("paths").$type<Array<[number, number]>>(),
  type: markerTypeEnum("type").default("mark").notNull(),
  markType: markerMarkTypeEnum("mark_type"),
  ...timestamps,
});

export type Marker = typeof marker.$inferSelect;

export const markerRelations = relations(marker, ({ many }) => ({
  routeReports: many(routeReport),
}));
