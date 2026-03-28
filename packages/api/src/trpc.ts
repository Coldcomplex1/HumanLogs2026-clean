import { TRPCError } from "@trpc/server";
import { t } from "./t";
import type { Context } from "./context";
import { createContext } from "./context";
import { timingMiddleware } from "./middlewares/timing.middleware";
import { loggerMiddleware } from "./middlewares/logger.middleware";

export { t, createContext };
export type { Context };

export const publicProcedure = t.procedure
  .use(timingMiddleware)
  .use(loggerMiddleware);
