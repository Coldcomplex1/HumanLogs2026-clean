import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { rescuePlanVehicle } from "./rescue-plan.schema";
import { timestamps } from "./share";

export const vehicleTypeEnum = pgEnum("vehicle_type", [
  "boat",
  "truck",
  "ambulance",
  "motorbike",
  "drone",
]);
export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "available",
  "on_mission",
  "maintenance",
  "offline",
]);

export const vehicleTypeEnumValues = vehicleTypeEnum.enumValues;
export const vehicleStatusEnumValues = vehicleStatusEnum.enumValues;

export const vehicle = pgTable("vehicle", {
  id: uuid("id").primaryKey().defaultRandom(),
  image: text("image"),
  name: text("name").notNull(),
  vehicleType: vehicleTypeEnum("vehicle_type").default("boat").notNull(),
  capacity: integer("capacity"),
  status: vehicleStatusEnum("status").default("available").notNull(),
  note: text("note"),
  baseLocation: text("base_location"),
  fuelLevel: integer("fuel_level"),
  tags: text("tags").array().default([]).notNull(),
  ...timestamps,
});

export type Vehicle = typeof vehicle.$inferSelect;

export const vehicleRelations = relations(vehicle, ({ many }) => ({
  rescuePlanLinks: many(rescuePlanVehicle),
}));
