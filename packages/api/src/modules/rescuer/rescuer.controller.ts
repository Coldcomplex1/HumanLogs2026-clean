import { z } from "zod";
import { publicProcedure, t } from "../../trpc";
import {
  createRescuerInputDto,
  findByIdRescuerInputDto,
  findRescuersWhereInputDto,
  updateRescuerInputDto,
} from "./rescuer.dto";

export const rescuerController = t.router({
  findMany: publicProcedure
    .input(findRescuersWhereInputDto)
    .query(({ ctx, input }) => {
      return ctx.services.rescuer.findMany(input);
    }),
  findById: publicProcedure
    .input(findByIdRescuerInputDto)
    .query(({ ctx, input }) => {
      return ctx.services.rescuer.findById(input.id);
    }),
  create: publicProcedure
    .input(createRescuerInputDto)
    .mutation(({ ctx, input }) => {
      return ctx.services.rescuer.create(input);
    }),
  update: publicProcedure
    .input(updateRescuerInputDto)
    .mutation(({ ctx, input }) => {
      return ctx.services.rescuer.update(input);
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.services.rescuer.delete(input.id);
    }),
});
