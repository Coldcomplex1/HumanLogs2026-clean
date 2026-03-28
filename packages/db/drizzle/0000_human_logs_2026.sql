CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."need_type" AS ENUM('thuoc', 'nuoc', 'luong_thuc', 'sua_em_be', 'so_tan', 'sac_dien', 'ao_phao', 've_sinh', 'lien_lac');--> statement-breakpoint
CREATE TYPE "public"."emergency_level" AS ENUM('critical', 'high', 'medium');--> statement-breakpoint
CREATE TYPE "public"."location_status" AS ENUM('active', 'in_progress', 'safe');--> statement-breakpoint
CREATE TYPE "public"."route_confidence" AS ENUM('high', 'medium', 'low', 'unverified', 'dangerous');--> statement-breakpoint
CREATE TYPE "public"."transport_mode" AS ENUM('road', 'boat', 'walk', 'ambulance', 'drone', 'hand_off');--> statement-breakpoint
CREATE TYPE "public"."location_source" AS ENUM('call', 'chat', 'manual', 'web');--> statement-breakpoint
CREATE TYPE "public"."marker_type" AS ENUM('mark', 'area', 'route');--> statement-breakpoint
CREATE TYPE "public"."marker_mark_type" AS ENUM('flood_area', 'strong_current', 'blocked_road', 'electric_hazard', 'debris', 'dangerous', 'safe_pickup', 'shelter', 'medical_point', 'supply_drop');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('boat', 'truck', 'ambulance', 'motorbike', 'drone');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('available', 'on_mission', 'maintenance', 'offline');--> statement-breakpoint
CREATE TYPE "public"."rescuer_role" AS ENUM('medic', 'boat_operator', 'driver', 'logistics', 'coordinator', 'diver', 'volunteer');--> statement-breakpoint
CREATE TYPE "public"."rescuer_status" AS ENUM('available', 'on_mission', 'off_duty', 'injured');--> statement-breakpoint
CREATE TYPE "public"."rescuer_experience_level" AS ENUM('junior', 'intermediate', 'senior', 'lead');--> statement-breakpoint
CREATE TYPE "public"."rescue_plan_status" AS ENUM('draft', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."rescue_plan_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."conversation_channel" AS ENUM('call', 'chat');--> statement-breakpoint
CREATE TYPE "public"."conversation_status" AS ENUM('initiated', 'in_progress', 'processing', 'done', 'failed');--> statement-breakpoint

CREATE TABLE "label" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "color" text NOT NULL,
  "icon" text,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE "location" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "summary" text,
  "note" text,
  "lat" real NOT NULL,
  "lng" real NOT NULL,
  "address" text,
  "emergency_level" "emergency_level" DEFAULT 'medium' NOT NULL,
  "status" "location_status" DEFAULT 'active' NOT NULL,
  "is_resolved" boolean DEFAULT false NOT NULL,
  "tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "label_id" uuid,
  "route_confidence" "route_confidence" DEFAULT 'unverified' NOT NULL,
  "preferred_transport_mode" "transport_mode" DEFAULT 'road',
  "source" "location_source" DEFAULT 'manual' NOT NULL,
  "last_verified_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE "victim" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fullname" text NOT NULL,
  "phone" text,
  "phone2" text,
  "email" text,
  "age" integer,
  "gender" "gender",
  "note" text,
  "facebook_url" text,
  "address_text" text,
  "conversations" text[] DEFAULT '{}'::text[] NOT NULL,
  "location_id" uuid,
  "household_size" integer,
  "has_children" boolean DEFAULT false NOT NULL,
  "has_elderly" boolean DEFAULT false NOT NULL,
  "has_disability" boolean DEFAULT false NOT NULL,
  "is_pregnant" boolean DEFAULT false NOT NULL,
  "needs_medical" boolean DEFAULT false NOT NULL,
  "need_types" "need_type"[] DEFAULT '{}'::"need_type"[] NOT NULL,
  "medicine_list" text[] DEFAULT '{}'::text[] NOT NULL,
  "days_without_aid" integer,
  "water_depth_estimate" text,
  "boat_accessible" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "victim_phone_unique" UNIQUE("phone")
);--> statement-breakpoint

CREATE TABLE "victim_tag" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "victim_id" uuid,
  "name" text NOT NULL,
  "color" text NOT NULL,
  "icon" text,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE "marker" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lat" real NOT NULL,
  "lng" real NOT NULL,
  "note" text,
  "name" text,
  "color" text,
  "fill_opacity" real,
  "is_closed_path" boolean DEFAULT false NOT NULL,
  "paths" jsonb,
  "type" "marker_type" DEFAULT 'mark' NOT NULL,
  "mark_type" "marker_mark_type",
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE "vehicle" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "image" text,
  "name" text NOT NULL,
  "vehicle_type" "vehicle_type" DEFAULT 'boat' NOT NULL,
  "capacity" integer,
  "status" "vehicle_status" DEFAULT 'available' NOT NULL,
  "note" text,
  "base_location" text,
  "fuel_level" integer,
  "tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE "rescuer" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "full_name" text NOT NULL,
  "phone" text NOT NULL,
  "secondary_phone" text,
  "email" text,
  "address" text,
  "role" "rescuer_role" DEFAULT 'volunteer' NOT NULL,
  "status" "rescuer_status" DEFAULT 'available' NOT NULL,
  "experience_level" "rescuer_experience_level" DEFAULT 'intermediate' NOT NULL,
  "certifications" text[] DEFAULT '{}'::text[] NOT NULL,
  "region" text,
  "avatar_url" text,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE "rescue_plan" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "status" "rescue_plan_status" DEFAULT 'draft' NOT NULL,
  "priority" "rescue_plan_priority" DEFAULT 'medium' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE "rescue_plan_location" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "plan_id" uuid NOT NULL,
  "location_id" uuid NOT NULL
);--> statement-breakpoint

CREATE TABLE "rescue_plan_rescuer" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "plan_id" uuid NOT NULL,
  "rescuer_id" uuid NOT NULL
);--> statement-breakpoint

CREATE TABLE "rescue_plan_vehicle" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "plan_id" uuid NOT NULL,
  "vehicle_id" uuid NOT NULL
);--> statement-breakpoint

CREATE TABLE "route_report" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "location_id" uuid,
  "marker_id" uuid,
  "reporter_id" uuid,
  "transport_mode" "transport_mode" DEFAULT 'road' NOT NULL,
  "confidence" "route_confidence" DEFAULT 'medium' NOT NULL,
  "is_passable" boolean DEFAULT true NOT NULL,
  "water_depth_text" text,
  "current_strength_text" text,
  "note" text,
  "path" jsonb,
  "reported_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE "conversation" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "provider_conversation_id" text NOT NULL,
  "channel" "conversation_channel" DEFAULT 'call' NOT NULL,
  "agent_name" text,
  "status" "conversation_status" DEFAULT 'processing' NOT NULL,
  "started_at" timestamp with time zone DEFAULT now(),
  "duration_seconds" integer DEFAULT 0 NOT NULL,
  "message_count" integer DEFAULT 0 NOT NULL,
  "phone_number" text,
  "summary" text,
  "data_collection_results" jsonb,
  "transcript" jsonb,
  "raw_payload" jsonb,
  "victim_id" uuid,
  "location_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "conversation_provider_conversation_id_unique" UNIQUE("provider_conversation_id")
);--> statement-breakpoint

ALTER TABLE "location" ADD CONSTRAINT "location_label_id_label_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."label"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "victim" ADD CONSTRAINT "victim_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "victim_tag" ADD CONSTRAINT "victim_tag_victim_id_victim_id_fk" FOREIGN KEY ("victim_id") REFERENCES "public"."victim"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_plan_location" ADD CONSTRAINT "rescue_plan_location_plan_id_rescue_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."rescue_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_plan_location" ADD CONSTRAINT "rescue_plan_location_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_plan_rescuer" ADD CONSTRAINT "rescue_plan_rescuer_plan_id_rescue_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."rescue_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_plan_rescuer" ADD CONSTRAINT "rescue_plan_rescuer_rescuer_id_rescuer_id_fk" FOREIGN KEY ("rescuer_id") REFERENCES "public"."rescuer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_plan_vehicle" ADD CONSTRAINT "rescue_plan_vehicle_plan_id_rescue_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."rescue_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_plan_vehicle" ADD CONSTRAINT "rescue_plan_vehicle_vehicle_id_vehicle_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_report" ADD CONSTRAINT "route_report_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_report" ADD CONSTRAINT "route_report_marker_id_marker_id_fk" FOREIGN KEY ("marker_id") REFERENCES "public"."marker"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_report" ADD CONSTRAINT "route_report_reporter_id_rescuer_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."rescuer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_victim_id_victim_id_fk" FOREIGN KEY ("victim_id") REFERENCES "public"."victim"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE set null ON UPDATE no action;
