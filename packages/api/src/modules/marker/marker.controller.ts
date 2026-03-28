import { z } from "zod";
import { publicProcedure, t } from "../../trpc";
import {
  createMarkerInputDto,
  findMarkersWhereInputDto,
  updateMarkerInputDto,
  findByIdMarkerInputDto,
} from "./marker.dto";

export const markerController = t.router({
  findMany: publicProcedure
    .input(findMarkersWhereInputDto)
    .query(({ ctx, input }) => {
      return ctx.services.marker.findMany(input);
    }),
  findById: publicProcedure
    .input(findByIdMarkerInputDto)
    .query(({ ctx, input }) => {
      return ctx.services.marker.findById(input.id);
    }),
  create: publicProcedure
    .input(createMarkerInputDto)
    .mutation(({ ctx, input }) => {
      return ctx.services.marker.create(input);
    }),
  update: publicProcedure
    .input(updateMarkerInputDto)
    .mutation(({ ctx, input }) => {
      return ctx.services.marker.update(input);
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.services.marker.delete(input.id);
    }),
});
