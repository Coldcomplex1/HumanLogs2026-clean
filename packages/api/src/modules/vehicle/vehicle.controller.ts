import { z } from "zod";
import { publicProcedure, t } from "../../trpc";
import {
  createVehicleInputDto,
  findVehiclesWhereInputDto,
  updateVehicleInputDto,
  findByIdVehicleInputDto,
} from "./vehicle.dto";

export const vehicleController = t.router({
  findMany: publicProcedure
    .input(findVehiclesWhereInputDto)
    .query(({ ctx, input }) => {
      return ctx.services.vehicle.findMany(input);
    }),
  findById: publicProcedure
    .input(findByIdVehicleInputDto)
    .query(({ ctx, input }) => {
      return ctx.services.vehicle.findById(input.id);
    }),
  create: publicProcedure
    .input(createVehicleInputDto)
    .mutation(({ ctx, input }) => {
      return ctx.services.vehicle.create(input);
    }),
  update: publicProcedure
    .input(updateVehicleInputDto)
    .mutation(({ ctx, input }) => {
      return ctx.services.vehicle.update(input);
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.services.vehicle.delete(input.id);
    }),
});
