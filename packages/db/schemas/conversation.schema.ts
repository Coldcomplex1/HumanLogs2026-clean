import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { victim } from "./victim.schema";
import { location } from "./location.schema";
import { timestamps } from "./share";

export const conversationChannelEnum = pgEnum("conversation_channel", [
  "call",
  "chat",
]);

export const conversationStatusEnum = pgEnum("conversation_status", [
  "initiated",
  "in_progress",
  "processing",
  "done",
  "failed",
]);

export const conversationChannelEnumValues =
  conversationChannelEnum.enumValues;
export const conversationStatusEnumValues = conversationStatusEnum.enumValues;

export const conversation = pgTable("conversation", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerConversationId: text("provider_conversation_id").unique().notNull(),
  channel: conversationChannelEnum("channel").default("call").notNull(),
  agentName: text("agent_name"),
  status: conversationStatusEnum("status").default("processing").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow(),
  durationSeconds: integer("duration_seconds").default(0).notNull(),
  messageCount: integer("message_count").default(0).notNull(),
  phoneNumber: text("phone_number"),
  summary: text("summary"),
  dataCollectionResults: jsonb("data_collection_results"),
  transcript: jsonb("transcript").$type<
    Array<{ role: string; message: string; timeInCallSecs?: number | null }>
  >(),
  rawPayload: jsonb("raw_payload"),
  victimId: uuid("victim_id").references(() => victim.id, {
    onDelete: "set null",
  }),
  locationId: uuid("location_id").references(() => location.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export type Conversation = typeof conversation.$inferSelect;

export const conversationRelations = relations(conversation, ({ one }) => ({
  victim: one(victim, {
    fields: [conversation.victimId],
    references: [victim.id],
  }),
  location: one(location, {
    fields: [conversation.locationId],
    references: [location.id],
  }),
}));
