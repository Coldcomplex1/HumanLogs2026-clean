import {
  routeConfidenceEnumValues,
  transportModeEnumValues,
} from "@repo/db";
import { z } from "zod";

export const findRouteReportsInputDto = z.object({
  locationId: z.string().optional(),
  markerId: z.string().optional(),
  transportMode: z.enum(transportModeEnumValues).optional(),
});

export type FindRouteReportsInputDto = z.infer<
  typeof findRouteReportsInputDto
>;

export const createRouteReportInputDto = z.object({
  locationId: z.string().optional(),
  markerId: z.string().optional(),
  reporterId: z.string().optional(),
  transportMode: z.enum(transportModeEnumValues).optional(),
  confidence: z.enum(routeConfidenceEnumValues).optional(),
  isPassable: z.boolean().optional(),
  waterDepthText: z.string().optional(),
  currentStrengthText: z.string().optional(),
  note: z.string().optional(),
  path: z.array(z.tuple([z.number(), z.number()])).optional(),
  reportedAt: z.coerce.date().optional(),
});

export type CreateRouteReportInputDto = z.infer<
  typeof createRouteReportInputDto
>;

export const updateRouteReportInputDto = z.object({
  id: z.string(),
  data: createRouteReportInputDto.partial(),
});

export type UpdateRouteReportInputDto = z.infer<
  typeof updateRouteReportInputDto
>;
