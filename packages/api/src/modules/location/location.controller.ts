import { z } from "zod";
import { publicProcedure, t } from "../../trpc";
import {
  createLocationInputDto,
  findLocationsWhereInputDto,
  updateLocationInputDto,
  findByIdLocationInputDto,
} from "./location.dto";

export const locationController = t.router({
  findMany: publicProcedure
    .input(findLocationsWhereInputDto)
    .query(({ ctx, input }) => {
      return ctx.services.location.findMany(input);
    }),
  findById: publicProcedure
    .input(findByIdLocationInputDto)
    .query(({ ctx, input }) => {
      return ctx.services.location.findById(input.id);
    }),
  create: publicProcedure
    .input(createLocationInputDto)
    .mutation(({ ctx, input }) => {
      return ctx.services.location.create(input);
    }),
  update: publicProcedure
    .input(updateLocationInputDto)
    .mutation(({ ctx, input }) => {
      return ctx.services.location.update(input);
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.services.location.delete(input.id);
    }),
});
