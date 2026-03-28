"use client";

import type * as React from "react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import { env } from "../env";
import { createQueryClient } from "./query-client";
import type { AppRouter } from "@repo/api/root";
import { createMockApi, MockQueryProvider } from "@/mock/mock-api";
export type { RouterInputs, RouterOutputs } from "@repo/api/root";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    return createQueryClient();
  }
  return (clientQueryClientSingleton ??= createQueryClient());
};

const trpcApi = createTRPCReact<AppRouter>();
const mockApi = createMockApi();

export const api = (env.VITE_USE_MOCK_DATA ? mockApi : trpcApi) as typeof trpcApi;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    trpcApi.createClient({
      links: [
        loggerLink({
          enabled: op =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
          url: `${env.VITE_API_URL}/api`,
          headers: () => {
            const headers: Record<string, string> = {
              "Content-Type": "application/json",
              "x-trpc-source": "react",
            };
            return headers;
          },
        }),
      ],
    }),
  );

  if (env.VITE_USE_MOCK_DATA) {
    return (
      <MockQueryProvider queryClient={queryClient}>
        {props.children}
      </MockQueryProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <trpcApi.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </trpcApi.Provider>
    </QueryClientProvider>
  );
}
