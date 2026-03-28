import { z } from "zod";
import { publicProcedure, t } from "../../trpc";
import {
  createVictimInputDto,
  findVictimsWhereInputDto,
  updateVictimInputDto,
  findByIdVictimInputDto,
} from "./victim.dto";

export const victimController = t.router({
  findMany: publicProcedure
    .input(findVictimsWhereInputDto)
    .query(({ ctx, input }) => {
      return ctx.services.victim.findMany(input);
    }),
  findById: publicProcedure
    .input(findByIdVictimInputDto)
    .query(({ ctx, input }) => {
      return ctx.services.victim.findById(input.id);
    }),
  create: publicProcedure
    .input(createVictimInputDto)
    .mutation(({ ctx, input }) => {
      return ctx.services.victim.create(input);
    }),
  update: publicProcedure
    .input(updateVictimInputDto)
    .mutation(({ ctx, input }) => {
      return ctx.services.victim.update(input);
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.services.victim.delete(input.id);
    }),
});
