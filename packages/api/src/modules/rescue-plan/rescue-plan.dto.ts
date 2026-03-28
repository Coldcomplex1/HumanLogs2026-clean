import {
  rescuePlanPriorityEnumValues,
  rescuePlanStatusEnumValues,
} from "@repo/db";
import { z } from "zod";

export const findRescuePlansInputDto = z.object({
  status: z.enum(rescuePlanStatusEnumValues).optional(),
});

export type FindRescuePlansInputDto = z.infer<typeof findRescuePlansInputDto>;

export const createRescuePlanInputDto = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(rescuePlanStatusEnumValues).optional(),
  priority: z.enum(rescuePlanPriorityEnumValues).optional(),
  locationIds: z.array(z.string()).optional(),
  rescuerIds: z.array(z.string()).optional(),
  vehicleIds: z.array(z.string()).optional(),
});

export type CreateRescuePlanInputDto = z.infer<typeof createRescuePlanInputDto>;

export const updateRescuePlanInputDto = z.object({
  id: z.string(),
  data: createRescuePlanInputDto
    .partial()
    .extend({
      status: z.enum(rescuePlanStatusEnumValues).optional(),
    }),
});

export type UpdateRescuePlanInputDto = z.infer<typeof updateRescuePlanInputDto>;

export const generateDescriptionInputDto = z.object({
  title: z.string().optional(),
  locationIds: z.array(z.string()).min(1),
});

export type GenerateDescriptionInputDto = z.infer<
  typeof generateDescriptionInputDto
>;
