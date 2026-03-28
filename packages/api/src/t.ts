import { initTRPC } from "@trpc/server";
import type { Context } from "./trpc";
import { ZodError } from "zod";
import { fromError } from "zod-validation-error";

export type Meta = {};

export const t = initTRPC
  .context<Context>()
  .meta<Meta>()
  .create({
    errorFormatter(opts) {
      const { shape, error } = opts;
      console.log(error);

      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.code === "BAD_REQUEST" && error.cause instanceof ZodError
              ? fromError(error.cause).message
              : null,
        },
      };
    },
  });
