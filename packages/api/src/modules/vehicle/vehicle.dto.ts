import { vehicleStatusEnumValues, vehicleTypeEnumValues } from "@repo/db";
import { z } from "zod";

export const findVehiclesWhereInputDto = z.object({
  search: z.string().optional(),
  vehicleType: z.enum(vehicleTypeEnumValues).optional(),
  status: z.enum(vehicleStatusEnumValues).optional(),
});

export type FindVehiclesWhereInputDto = z.infer<
  typeof findVehiclesWhereInputDto
>;

export const findByIdVehicleInputDto = z.object({
  id: z.string(),
});

export const createVehicleInputDto = z.object({
  image: z.string().optional(),
  name: z.string().min(1, "Tên phương tiện là bắt buộc"),
  vehicleType: z.enum(vehicleTypeEnumValues).optional(),
  capacity: z.number().int().min(0).optional(),
  status: z.enum(vehicleStatusEnumValues).optional(),
  note: z.string().optional(),
  baseLocation: z.string().optional(),
  fuelLevel: z.number().int().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateVehicleInputDto = z.infer<typeof createVehicleInputDto>;

export const updateVehicleInputDto = z.object({
  id: z.string(),
  data: createVehicleInputDto.partial(),
});

export type UpdateVehicleInputDto = z.infer<typeof updateVehicleInputDto>;
