import type * as React from "react";
import {
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { RouterInputs, RouterOutputs } from "@repo/api/root";
import { mockStoreApi } from "./mock-store";

const MOCK_NAMESPACE = ["humanlogs2026", "mock"];

type QueryOptions<TData> = Omit<
  UseQueryOptions<TData, Error, TData, readonly unknown[]>,
  "queryKey" | "queryFn"
>;

type MutationOptions<TData, TVariables> = UseMutationOptions<
  TData,
  Error,
  TVariables
>;

const keyFor = (router: string, procedure: string, input?: unknown) =>
  [...MOCK_NAMESPACE, router, procedure, input ?? null] as const;

const invalidateRouter = (queryClient: QueryClient, router: string, procedure: string) =>
  queryClient.invalidateQueries({
    queryKey: [...MOCK_NAMESPACE, router, procedure],
  });

const createQueryHook = <TInput, TOutput>(
  router: string,
  procedure: string,
  resolver: (input: TInput) => TOutput,
) => ({
  useQuery: (input: TInput, options?: QueryOptions<TOutput>) =>
    useQuery({
      queryKey: keyFor(router, procedure, input),
      queryFn: async () => resolver(input),
      ...(options ?? {}),
    }),
});

const createMutationHook = <TVariables, TOutput>(
  _router: string,
  _procedure: string,
  mutationFn: (input: TVariables) => TOutput,
  invalidateTargets: Array<[string, string]>,
) => ({
  useMutation: (options?: MutationOptions<TOutput, TVariables>) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (variables: TVariables) => mutationFn(variables),
      ...options,
      onSuccess: async (data, variables, context) => {
        invalidateTargets.forEach(([targetRouter, targetProcedure]) => {
          invalidateRouter(queryClient, targetRouter, targetProcedure);
        });

        await options?.onSuccess?.(data, variables, context);
      },
    });
  },
});

const createUtils = (queryClient: QueryClient) => ({
  victim: {
    findMany: {
      invalidate: () => invalidateRouter(queryClient, "victim", "findMany"),
    },
    findById: {
      invalidate: () => invalidateRouter(queryClient, "victim", "findById"),
    },
  },
  location: {
    findMany: {
      invalidate: () => invalidateRouter(queryClient, "location", "findMany"),
    },
    findById: {
      invalidate: () => invalidateRouter(queryClient, "location", "findById"),
    },
  },
  marker: {
    findMany: {
      invalidate: () => invalidateRouter(queryClient, "marker", "findMany"),
    },
    findById: {
      invalidate: () => invalidateRouter(queryClient, "marker", "findById"),
    },
  },
  vehicle: {
    findMany: {
      invalidate: () => invalidateRouter(queryClient, "vehicle", "findMany"),
    },
    findById: {
      invalidate: () => invalidateRouter(queryClient, "vehicle", "findById"),
    },
  },
  rescuer: {
    findMany: {
      invalidate: () => invalidateRouter(queryClient, "rescuer", "findMany"),
    },
    findById: {
      invalidate: () => invalidateRouter(queryClient, "rescuer", "findById"),
    },
  },
  rescuePlan: {
    findMany: {
      invalidate: () => invalidateRouter(queryClient, "rescuePlan", "findMany"),
      setData: (
        input: RouterInputs["rescuePlan"]["findMany"],
        updater: (
          data: RouterOutputs["rescuePlan"]["findMany"] | undefined,
        ) => RouterOutputs["rescuePlan"]["findMany"] | undefined,
      ) =>
        queryClient.setQueryData(
          keyFor("rescuePlan", "findMany", input),
          updater as (oldData: unknown) => unknown,
        ),
    },
    findById: {
      invalidate: () => invalidateRouter(queryClient, "rescuePlan", "findById"),
    },
  },
  conversation: {
    findMany: {
      invalidate: () => invalidateRouter(queryClient, "conversation", "findMany"),
    },
    findById: {
      invalidate: () => invalidateRouter(queryClient, "conversation", "findById"),
    },
  },
  routeReport: {
    findMany: {
      invalidate: () => invalidateRouter(queryClient, "routeReport", "findMany"),
    },
    findById: {
      invalidate: () => invalidateRouter(queryClient, "routeReport", "findById"),
    },
  },
});

export const createMockApi = () => {
  const api = {
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useUtils: () => createUtils(useQueryClient()),

    victim: {
      findMany: createQueryHook("victim", "findMany", mockStoreApi.victim.findMany),
      findById: createQueryHook("victim", "findById", mockStoreApi.victim.findById),
      create: createMutationHook("victim", "create", mockStoreApi.victim.create, [
        ["victim", "findMany"],
        ["victim", "findById"],
        ["location", "findMany"],
        ["location", "findById"],
      ]),
      update: createMutationHook("victim", "update", mockStoreApi.victim.update, [
        ["victim", "findMany"],
        ["victim", "findById"],
        ["location", "findMany"],
        ["location", "findById"],
      ]),
      delete: createMutationHook("victim", "delete", mockStoreApi.victim.delete, [
        ["victim", "findMany"],
        ["victim", "findById"],
        ["location", "findMany"],
        ["location", "findById"],
      ]),
    },

    location: {
      findMany: createQueryHook("location", "findMany", mockStoreApi.location.findMany),
      findById: createQueryHook("location", "findById", mockStoreApi.location.findById),
      create: createMutationHook("location", "create", mockStoreApi.location.create, [
        ["location", "findMany"],
        ["location", "findById"],
        ["victim", "findMany"],
        ["victim", "findById"],
      ]),
      delete: createMutationHook("location", "delete", mockStoreApi.location.delete, [
        ["location", "findMany"],
        ["location", "findById"],
        ["victim", "findMany"],
        ["victim", "findById"],
        ["rescuePlan", "findMany"],
      ]),
    },

    marker: {
      findMany: createQueryHook("marker", "findMany", mockStoreApi.marker.findMany),
      findById: createQueryHook("marker", "findById", mockStoreApi.marker.findById),
      create: createMutationHook("marker", "create", mockStoreApi.marker.create, [
        ["marker", "findMany"],
        ["marker", "findById"],
      ]),
      update: createMutationHook("marker", "update", mockStoreApi.marker.update, [
        ["marker", "findMany"],
        ["marker", "findById"],
      ]),
      delete: createMutationHook("marker", "delete", mockStoreApi.marker.delete, [
        ["marker", "findMany"],
        ["marker", "findById"],
        ["routeReport", "findMany"],
      ]),
    },

    vehicle: {
      findMany: createQueryHook("vehicle", "findMany", mockStoreApi.vehicle.findMany),
      findById: createQueryHook("vehicle", "findById", mockStoreApi.vehicle.findById),
      create: createMutationHook("vehicle", "create", mockStoreApi.vehicle.create, [
        ["vehicle", "findMany"],
        ["vehicle", "findById"],
      ]),
      update: createMutationHook("vehicle", "update", mockStoreApi.vehicle.update, [
        ["vehicle", "findMany"],
        ["vehicle", "findById"],
      ]),
      delete: createMutationHook("vehicle", "delete", mockStoreApi.vehicle.delete, [
        ["vehicle", "findMany"],
        ["vehicle", "findById"],
        ["rescuePlan", "findMany"],
      ]),
    },

    rescuer: {
      findMany: createQueryHook("rescuer", "findMany", mockStoreApi.rescuer.findMany),
      findById: createQueryHook("rescuer", "findById", mockStoreApi.rescuer.findById),
      create: createMutationHook("rescuer", "create", mockStoreApi.rescuer.create, [
        ["rescuer", "findMany"],
        ["rescuer", "findById"],
      ]),
      update: createMutationHook("rescuer", "update", mockStoreApi.rescuer.update, [
        ["rescuer", "findMany"],
        ["rescuer", "findById"],
        ["rescuePlan", "findMany"],
      ]),
      delete: createMutationHook("rescuer", "delete", mockStoreApi.rescuer.delete, [
        ["rescuer", "findMany"],
        ["rescuer", "findById"],
        ["rescuePlan", "findMany"],
        ["routeReport", "findMany"],
      ]),
    },

    rescuePlan: {
      findMany: createQueryHook("rescuePlan", "findMany", mockStoreApi.rescuePlan.findMany),
      findById: createQueryHook("rescuePlan", "findById", mockStoreApi.rescuePlan.findById),
      create: createMutationHook("rescuePlan", "create", mockStoreApi.rescuePlan.create, [
        ["rescuePlan", "findMany"],
        ["rescuePlan", "findById"],
        ["rescuer", "findMany"],
        ["location", "findMany"],
      ]),
      update: createMutationHook("rescuePlan", "update", mockStoreApi.rescuePlan.update, [
        ["rescuePlan", "findMany"],
        ["rescuePlan", "findById"],
        ["rescuer", "findMany"],
        ["location", "findMany"],
        ["location", "findById"],
      ]),
      delete: createMutationHook("rescuePlan", "delete", mockStoreApi.rescuePlan.delete, [
        ["rescuePlan", "findMany"],
        ["rescuePlan", "findById"],
        ["rescuer", "findMany"],
      ]),
      generateDescription: createMutationHook(
        "rescuePlan",
        "generateDescription",
        mockStoreApi.rescuePlan.generateDescription,
        [],
      ),
    },

    conversation: {
      findMany: createQueryHook("conversation", "findMany", mockStoreApi.conversation.findMany),
      findById: createQueryHook("conversation", "findById", mockStoreApi.conversation.findById),
    },

    routeReport: {
      findMany: createQueryHook("routeReport", "findMany", mockStoreApi.routeReport.findMany),
      findById: createQueryHook("routeReport", "findById", mockStoreApi.routeReport.findById),
    },
  };

  return api as unknown as {
    Provider: React.FC<{ children: React.ReactNode }>;
    useUtils: () => ReturnType<typeof createUtils>;
  } & Record<string, unknown>;
};

export const MockQueryProvider = ({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
