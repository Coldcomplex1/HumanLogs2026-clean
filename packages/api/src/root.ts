/// CONTROLLERS_IMPORTS
import { t } from "./trpc";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { conversationController } from "./modules/conversation/conversation.controller";
import { locationController } from "./modules/location/location.controller";
import { markerController } from "./modules/marker/marker.controller";
import { rescuePlanController } from "./modules/rescue-plan/rescue-plan.controller";
import { rescuerController } from "./modules/rescuer/rescuer.controller";
import { routeReportController } from "./modules/route-report/route-report.controller";
import { vehicleController } from "./modules/vehicle/vehicle.controller";
import { victimController } from "./modules/victim/victim.controller";

export { webhookRouter } from "./modules/webhook/webhook.router";

export const appRouter = t.router({
  victim: victimController,
  location: locationController,
  marker: markerController,
  conversation: conversationController,
  vehicle: vehicleController,
  rescuer: rescuerController,
  rescuePlan: rescuePlanController,
  routeReport: routeReportController,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
