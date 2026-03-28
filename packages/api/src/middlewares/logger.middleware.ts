import { initTRPC } from "@trpc/server";
import consola from "consola";

const t = initTRPC.create();

export const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = performance.now();

  const result = await next();

  const durationMs = (performance.now() - start).toFixed(2);

  if (result.ok) {
    consola.success(`[tRPC] ${type} '${path}' - ${durationMs}ms`);
  } else {
    consola.error(`[tRPC] ${type} '${path}' - Failed in ${durationMs}ms`);
    consola.error(result.error);
  }

  return result;
});
