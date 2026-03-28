import { z } from "zod";
import { publicProcedure, t } from "../../trpc";
import {
  createRescuePlanInputDto,
  findRescuePlansInputDto,
  generateDescriptionInputDto,
  updateRescuePlanInputDto,
} from "./rescue-plan.dto";

export const rescuePlanController = t.router({
  findMany: publicProcedure
    .input(findRescuePlansInputDto)
    .query(({ ctx, input }) => ctx.services.rescuePlan.findMany(input)),

  findById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => ctx.services.rescuePlan.findById(input.id)),

  create: publicProcedure
    .input(createRescuePlanInputDto)
    .mutation(({ ctx, input }) => ctx.services.rescuePlan.create(input)),

  update: publicProcedure
    .input(updateRescuePlanInputDto)
    .mutation(({ ctx, input }) => ctx.services.rescuePlan.update(input)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => ctx.services.rescuePlan.delete(input.id)),

  suggestVictimGroups: publicProcedure
    .mutation(({ ctx }) => ctx.services.rescuePlan.suggestVictimGroups()),

  generateDescription: publicProcedure
    .input(generateDescriptionInputDto)
    .mutation(({ ctx, input }) =>
      ctx.services.rescuePlan.generateDescription(input),
    ),
});
