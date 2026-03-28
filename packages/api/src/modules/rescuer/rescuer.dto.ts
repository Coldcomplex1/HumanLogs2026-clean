import {
  rescuerExperienceLevelEnumValues,
  rescuerRoleEnumValues,
  rescuerStatusEnumValues,
} from "@repo/db";
import { z } from "zod";

export const findRescuersWhereInputDto = z.object({
  search: z.string().optional(),
  status: z.enum(rescuerStatusEnumValues).optional(),
  role: z.enum(rescuerRoleEnumValues).optional(),
  region: z.string().optional(),
});

export type FindRescuersWhereInputDto = z.infer<
  typeof findRescuersWhereInputDto
>;

export const findByIdRescuerInputDto = z.object({
  id: z.string(),
});

export const createRescuerInputDto = z.object({
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  phone: z.string().min(1, "Số điện thoại là bắt buộc"),
  secondaryPhone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(rescuerRoleEnumValues).optional(),
  status: z.enum(rescuerStatusEnumValues).optional(),
  experienceLevel: z.enum(rescuerExperienceLevelEnumValues).optional(),
  certifications: z.array(z.string()).optional(),
  region: z.string().optional(),
  avatarUrl: z.string().optional(),
  note: z.string().optional(),
});

export type CreateRescuerInputDto = z.infer<typeof createRescuerInputDto>;

export const updateRescuerInputDto = z.object({
  id: z.string(),
  data: createRescuerInputDto.partial(),
});

export type UpdateRescuerInputDto = z.infer<typeof updateRescuerInputDto>;
