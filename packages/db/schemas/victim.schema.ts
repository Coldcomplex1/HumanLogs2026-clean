import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { location } from "./location.schema";
import { timestamps } from "./share";
import { conversation } from "./conversation.schema";

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const needTypeEnum = pgEnum("need_type", [
  "thuoc",
  "nuoc",
  "luong_thuc",
  "sua_em_be",
  "so_tan",
  "sac_dien",
  "ao_phao",
  "ve_sinh",
  "lien_lac",
]);

export const genderEnumValues = genderEnum.enumValues;
export const needTypeEnumValues = needTypeEnum.enumValues;
export type GenderEnumValues = typeof genderEnumValues;
export type NeedTypeEnumValues = typeof needTypeEnumValues;

export const victim = pgTable("victim", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullname: text("fullname").notNull(),
  phone: text("phone").unique(),
  phone2: text("phone2"),
  email: text("email"),
  age: integer("age"),
  gender: genderEnum("gender"),
  note: text("note"),
  facebookURL: text("facebook_url"),
  addressText: text("address_text"),
  conversations: text("conversations").array().default([]).notNull(),
  locationId: uuid("location_id").references(() => location.id, {
    onDelete: "set null",
  }),
  householdSize: integer("household_size"),
  hasChildren: boolean("has_children").default(false).notNull(),
  hasElderly: boolean("has_elderly").default(false).notNull(),
  hasDisability: boolean("has_disability").default(false).notNull(),
  isPregnant: boolean("is_pregnant").default(false).notNull(),
  needsMedical: boolean("needs_medical").default(false).notNull(),
  needTypes: needTypeEnum("need_types").array().default([]).notNull(),
  medicineList: text("medicine_list").array().default([]).notNull(),
  daysWithoutAid: integer("days_without_aid"),
  waterDepthEstimate: text("water_depth_estimate"),
  boatAccessible: boolean("boat_accessible").default(false).notNull(),
  ...timestamps,
});

export type Victim = typeof victim.$inferSelect;

export const victimTag = pgTable("victim_tag", {
  id: uuid("id").primaryKey().defaultRandom(),
  victimId: uuid("victim_id").references(() => victim.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon"),
  description: text("description"),
  ...timestamps,
});

export const victimRelations = relations(victim, ({ many, one }) => ({
  location: one(location, {
    fields: [victim.locationId],
    references: [location.id],
  }),
  tags: many(victimTag),
  relatedConversations: many(conversation),
}));

export const victimTagRelations = relations(victimTag, ({ one }) => ({
  victim: one(victim, {
    fields: [victimTag.victimId],
    references: [victim.id],
  }),
}));
