import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { location } from "./location.schema";
import { rescuer } from "./rescuer.schema";
import { vehicle } from "./vehicle.schema";
import { timestamps } from "./share";

export const rescuePlanStatusEnum = pgEnum("rescue_plan_status", [
  "draft",
  "active",
  "completed",
  "cancelled",
]);

export const rescuePlanPriorityEnum = pgEnum("rescue_plan_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const rescuePlanStatusEnumValues = rescuePlanStatusEnum.enumValues;
export const rescuePlanPriorityEnumValues = rescuePlanPriorityEnum.enumValues;

export const rescuePlan = pgTable("rescue_plan", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  status: rescuePlanStatusEnum("status").default("draft").notNull(),
  priority: rescuePlanPriorityEnum("priority").default("medium").notNull(),
  ...timestamps,
});

export const rescuePlanLocation = pgTable("rescue_plan_location", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id")
    .references(() => rescuePlan.id, { onDelete: "cascade" })
    .notNull(),
  locationId: uuid("location_id")
    .references(() => location.id, { onDelete: "cascade" })
    .notNull(),
});

export const rescuePlanRescuer = pgTable("rescue_plan_rescuer", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id")
    .references(() => rescuePlan.id, { onDelete: "cascade" })
    .notNull(),
  rescuerId: uuid("rescuer_id")
    .references(() => rescuer.id, { onDelete: "cascade" })
    .notNull(),
});

export const rescuePlanVehicle = pgTable("rescue_plan_vehicle", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id")
    .references(() => rescuePlan.id, { onDelete: "cascade" })
    .notNull(),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicle.id, { onDelete: "cascade" })
    .notNull(),
});

export const rescuePlanRelations = relations(rescuePlan, ({ many }) => ({
  locations: many(rescuePlanLocation),
  rescuers: many(rescuePlanRescuer),
  vehicles: many(rescuePlanVehicle),
}));

export const rescuePlanLocationRelations = relations(
  rescuePlanLocation,
  ({ one }) => ({
    plan: one(rescuePlan, {
      fields: [rescuePlanLocation.planId],
      references: [rescuePlan.id],
    }),
    location: one(location, {
      fields: [rescuePlanLocation.locationId],
      references: [location.id],
    }),
  }),
);

export const rescuePlanRescuerRelations = relations(
  rescuePlanRescuer,
  ({ one }) => ({
    plan: one(rescuePlan, {
      fields: [rescuePlanRescuer.planId],
      references: [rescuePlan.id],
    }),
    rescuer: one(rescuer, {
      fields: [rescuePlanRescuer.rescuerId],
      references: [rescuer.id],
    }),
  }),
);

export const rescuePlanVehicleRelations = relations(
  rescuePlanVehicle,
  ({ one }) => ({
    plan: one(rescuePlan, {
      fields: [rescuePlanVehicle.planId],
      references: [rescuePlan.id],
    }),
    vehicle: one(vehicle, {
      fields: [rescuePlanVehicle.vehicleId],
      references: [vehicle.id],
    }),
  }),
);
