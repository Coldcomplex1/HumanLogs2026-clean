import { markerMarkTypeEnumValues, markerTypeEnumValues } from "@repo/db";
import { z } from "zod";

export const findMarkersWhereInputDto = z.object({
  search: z.string().optional(),
  type: z.enum(markerTypeEnumValues).optional(),
  markType: z.enum(markerMarkTypeEnumValues).optional(),
});

export type FindManyMarkersWhereInputDto = z.infer<
  typeof findMarkersWhereInputDto
>;

export const findByIdMarkerInputDto = z.object({
  id: z.string(),
});

export const createMarkerInputDto = z.object({
  type: z.enum(markerTypeEnumValues),
  lat: z.number(),
  lng: z.number(),
  note: z.string().optional(),
  name: z.string().optional(),
  color: z.string().optional(),
  fillOpacity: z.number().optional(),
  isClosedPath: z.boolean().optional(),
  paths: z.array(z.tuple([z.number(), z.number()])).optional(),
  markType: z.enum(markerMarkTypeEnumValues).optional(),
});

export type CreateMarkerInputDto = z.infer<typeof createMarkerInputDto>;

export const updateMarkerInputDto = z.object({
  id: z.string(),
  data: createMarkerInputDto.partial(),
});

export type UpdateMarkerInputDto = z.infer<typeof updateMarkerInputDto>;
