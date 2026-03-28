import { drizzle } from "drizzle-orm/bun-sql";
import { SQL } from "bun";

import * as conversationSchema from "./schemas/conversation.schema";
import * as labelSchema from "./schemas/label.schema";
import * as locationSchema from "./schemas/location.schema";
import * as markerSchema from "./schemas/marker.schema";
import * as rescuePlanSchema from "./schemas/rescue-plan.schema";
import * as rescuerSchema from "./schemas/rescuer.schema";
import * as routeReportSchema from "./schemas/route-report.schema";
import * as vehicleSchema from "./schemas/vehicle.schema";
import * as victimsSchema from "./schemas/victim.schema";

export {
  genderEnumValues,
  needTypeEnumValues,
} from "./schemas/victim.schema";
export {
  emergencyLevelEnumValues,
  locationSourceEnumValues,
  locationStatusEnumValues,
  routeConfidenceEnumValues,
  transportModeEnumValues,
} from "./schemas/location.schema";
export {
  markerMarkTypeEnumValues,
  markerTypeEnumValues,
} from "./schemas/marker.schema";
export {
  vehicleStatusEnumValues,
  vehicleTypeEnumValues,
} from "./schemas/vehicle.schema";
export {
  rescuerExperienceLevelEnumValues,
  rescuerRoleEnumValues,
  rescuerStatusEnumValues,
} from "./schemas/rescuer.schema";
export {
  rescuePlanPriorityEnumValues,
  rescuePlanStatusEnumValues,
} from "./schemas/rescue-plan.schema";
export {
  conversationChannelEnumValues,
  conversationStatusEnumValues,
} from "./schemas/conversation.schema";

export type {
  EmergencyLevelEnum,
  LocationSourceEnum,
  LocationStatusEnum,
  RouteConfidenceEnum,
  TransportModeEnum,
} from "./schemas/location.schema";
export type {
  RescuerExperienceLevelEnumValues,
  RescuerRoleEnumValues,
  RescuerStatusEnumValues,
} from "./schemas/rescuer.schema";

const schema = {
  ...victimsSchema,
  ...locationSchema,
  ...markerSchema,
  ...labelSchema,
  ...vehicleSchema,
  ...rescuerSchema,
  ...rescuePlanSchema,
  ...routeReportSchema,
  ...conversationSchema,
};

export const tables = schema;
type Schema = typeof schema;

const client = new SQL(process.env.DATABASE_URL!);

export const db = drizzle<Schema>({ client, schema });

export type Database = typeof db;
