import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { t } from "./t";
import services from "./services";

export type Context = {
  userAgent: string;
  resHeaders: Headers;
  services: typeof services;
};

export const createContext = async (
  opts: FetchCreateContextFnOptions,
): Promise<Context> => {
  const userAgent = opts.req.headers.get("user-agent")!;

  return {
    userAgent,
    resHeaders: opts.resHeaders,
    services,
  };
};
