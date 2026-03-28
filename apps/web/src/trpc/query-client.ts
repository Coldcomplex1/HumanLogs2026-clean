import { QueryCache, QueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof TRPCClientError) {
            console.log("retry");
            const shouldNotRetry: NonNullable<typeof error.data>["code"][] = [
              "FORBIDDEN",
              "TOO_MANY_REQUESTS",
            ];

            if (shouldNotRetry.includes(error.data?.code as any)) {
              return false;
            }
            return failureCount < 3;
          }
          return true;
        },
      },
    },
    queryCache: new QueryCache({}),
  });
