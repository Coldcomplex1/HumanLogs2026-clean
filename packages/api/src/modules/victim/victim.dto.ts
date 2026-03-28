import { needTypeEnumValues } from "@repo/db";
import { z } from "zod";

const victimTagInput = z.object({
  name: z.string().min(1, "Tên thẻ là bắt buộc"),
  color: z.string().min(1, "Màu thẻ là bắt buộc"),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export const victimSortEnum = z.enum(["newest", "oldest", "priority", "a-z"]);

export const findVictimsWhereInputDto = z.object({
  search: z.string().optional(),
  emergencyLevel: z.enum(["critical", "high", "medium"]).optional(),
  needType: z.enum(needTypeEnumValues).optional(),
  status: z.enum(["active", "in_progress", "safe"]).optional(),
  sort: victimSortEnum.optional(),
});

export type FindManyVictimsWhereInputDto = z.infer<
  typeof findVictimsWhereInputDto
>;

export const findByIdVictimInputDto = z.object({
  id: z.string(),
});

export const createVictimInputDto = z.object({
  fullname: z.string().min(1, "Họ tên là bắt buộc"),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  email: z.string().optional(),
  age: z.number().int().positive().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  note: z.string().optional(),
  facebookURL: z.string().optional(),
  addressText: z.string().optional(),
  locationId: z.string().optional(),
  householdSize: z.number().int().positive().optional(),
  hasChildren: z.boolean().optional(),
  hasElderly: z.boolean().optional(),
  hasDisability: z.boolean().optional(),
  isPregnant: z.boolean().optional(),
  needsMedical: z.boolean().optional(),
  needTypes: z.array(z.enum(needTypeEnumValues)).optional(),
  medicineList: z.array(z.string()).optional(),
  daysWithoutAid: z.number().int().min(0).optional(),
  waterDepthEstimate: z.string().optional(),
  boatAccessible: z.boolean().optional(),
  tags: z.array(victimTagInput).optional(),
  conversations: z.array(z.string()).optional(),
});

export type CreateVictimInputDto = z.infer<typeof createVictimInputDto>;

export const updateVictimInputDto = z.object({
  id: z.string(),
  data: createVictimInputDto.partial(),
});

export type UpdateVictimInputDto = z.infer<typeof updateVictimInputDto>;
