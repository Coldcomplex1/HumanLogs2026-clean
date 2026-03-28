import { z } from "zod";
import { publicProcedure, t } from "../../trpc";
import {
  createRouteReportInputDto,
  findRouteReportsInputDto,
  updateRouteReportInputDto,
} from "./route-report.dto";

export const routeReportController = t.router({
  findMany: publicProcedure
    .input(findRouteReportsInputDto)
    .query(({ ctx, input }) => ctx.services.routeReport.findMany(input)),
  findById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => ctx.services.routeReport.findById(input.id)),
  create: publicProcedure
    .input(createRouteReportInputDto)
    .mutation(({ ctx, input }) => ctx.services.routeReport.create(input)),
  update: publicProcedure
    .input(updateRouteReportInputDto)
    .mutation(({ ctx, input }) => ctx.services.routeReport.update(input)),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => ctx.services.routeReport.delete(input.id)),
});
