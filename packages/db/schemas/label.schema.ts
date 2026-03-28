import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { location } from "./location.schema";
import { timestamps } from "./share";

export const label = pgTable("label", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon"),
  description: text("description"),
  ...timestamps,
});

export const labelRelations = relations(label, ({ many }) => ({
  locations: many(location),
}));
