import { z } from "zod";
import { publicProcedure, t } from "../../trpc";

export const conversationController = t.router({
  findMany: publicProcedure.query(({ ctx }) => {
    return ctx.services.conversation.findMany();
  }),
  findById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.services.conversation.findById(input.id);
    }),
});
