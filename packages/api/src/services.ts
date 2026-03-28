import { db } from "@repo/db";
import { ConversationService } from "./modules/conversation/conversation.service";
import { LocationService } from "./modules/location/location.service";
import { MarkerService } from "./modules/marker/marker.service";
import { RescuePlanService } from "./modules/rescue-plan/rescue-plan.service";
import { RescuerService } from "./modules/rescuer/rescuer.service";
import { RouteReportService } from "./modules/route-report/route-report.service";
import { VehicleService } from "./modules/vehicle/vehicle.service";
import { VictimService } from "./modules/victim/victim.service";
import { WebhookService } from "./modules/webhook/webhook.service";
import { elevenLabsClient } from "./libs/elevenlabs";
import { mapClient } from "./libs/map";
import { wsServer } from "./ws/ws-server";

const victimService = new VictimService(db, wsServer);
const locationService = new LocationService(db, wsServer, mapClient);
const markerService = new MarkerService(db, wsServer);
const vehicleService = new VehicleService(db, wsServer);
const rescuerService = new RescuerService(db, wsServer);
const rescuePlanService = new RescuePlanService(db, wsServer);
const conversationService = new ConversationService(db);
const routeReportService = new RouteReportService(db, wsServer);
const webhookService = new WebhookService(
  db,
  elevenLabsClient,
  mapClient,
  wsServer,
);

const services = {
  victim: victimService,
  location: locationService,
  marker: markerService,
  vehicle: vehicleService,
  rescuer: rescuerService,
  rescuePlan: rescuePlanService,
  conversation: conversationService,
  routeReport: routeReportService,
  webhook: webhookService,
};

export default services;
