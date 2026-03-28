import {
  emergencyLevelEnumValues,
  locationSourceEnumValues,
  routeConfidenceEnumValues,
  transportModeEnumValues,
} from "@repo/db";
import { z } from "zod";
import { createVictimInputDto } from "../victim/victim.dto";

export const findManyLocationSortEnum = z.enum([
  "newest",
  "oldest",
  "emergency",
  "a-z",
  "z-a",
]);

export type FindManyLocationSortEnum = z.infer<typeof findManyLocationSortEnum>;

export const findLocationsWhereInputDto = z.object({
  search: z.string().optional(),
  emergencyLevel: z.enum(emergencyLevelEnumValues).optional(),
  resolved: z.boolean().optional(),
  source: z.enum(locationSourceEnumValues).optional(),
  transportMode: z.enum(transportModeEnumValues).optional(),
  sort: findManyLocationSortEnum.optional(),
});

export type FindManyLocationsWhereInputDto = z.infer<
  typeof findLocationsWhereInputDto
>;

export const findByIdLocationInputDto = z.object({
  id: z.string(),
});

export const createLocationInputDto = z.object({
  summary: z.string().optional(),
  note: z.string().optional(),
  emergencyLevel: z.enum(emergencyLevelEnumValues).optional(),
  lat: z.number(),
  lng: z.number(),
  address: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.enum(locationSourceEnumValues).optional(),
  routeConfidence: z.enum(routeConfidenceEnumValues).optional(),
  preferredTransportMode: z.enum(transportModeEnumValues).optional(),
  victims: z
    .array(createVictimInputDto.omit({ locationId: true, tags: true }))
    .min(1),
});

export type CreateLocationInputDto = z.infer<typeof createLocationInputDto>;

export const updateLocationInputDto = z.object({
  id: z.string(),
  data: createLocationInputDto
    .omit({ lat: true, lng: true, victims: true })
    .partial()
    .extend({
      lat: z.number().optional(),
      lng: z.number().optional(),
      victims: z
        .array(createVictimInputDto.omit({ locationId: true, tags: true }))
        .optional(),
      status: z.enum(["active", "in_progress", "safe"]).optional(),
      isResolved: z.boolean().optional(),
      lastVerifiedAt: z.coerce.date().optional(),
    }),
});

export type UpdateLocationInputDto = z.infer<typeof updateLocationInputDto>;
