import { createContext } from "@repo/api/context";
import { env } from "@repo/api/env";
import { appRouter, webhookRouter } from "@repo/api/root";
import services from "@repo/api/services";
import { socketHandler } from "@repo/api/ws-server";
import { createBunHttpHandler } from "trpc-bun-adapter";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers": "*",
};

const bunHandler = createBunHttpHandler({
  router: appRouter,
  createContext: createContext as any,
  endpoint: "/api",
  batching: {
    enabled: true,
  },
  responseMeta() {
    return {
      status: 200,
      headers: {
        ...CORS_HEADERS,
      },
    };
  },
  emitWsUpgrades: false,
});

const server = Bun.serve({
  port: env.PORT,
  async fetch(request, serverInstance) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    const url = new URL(request.url);

    if (url.pathname.startsWith("/socket.io/")) {
      return socketHandler.fetch(request, serverInstance);
    }

    if (url.pathname === "/health") {
      return Response.json({
        ok: true,
        service: "HumanLogs2026 API",
        now: new Date().toISOString(),
      });
    }

    if (url.pathname === "/webhook/elevenlabs") {
      return webhookRouter.elevenLabsWebhook(request);
    }

    if (url.pathname === "/webhook/debug/elevenlabs") {
      return webhookRouter.debugElevenLabsWebhook(request);
    }

    if (url.pathname === "/twilio/personalize") {
      const phoneNumber =
        url.searchParams.get("phone_number") || url.searchParams.get("phone");
      return Response.json(await services.webhook.getPersonalization(phoneNumber));
    }

    let trpcRequest = request;

    if (
      url.pathname.startsWith("/api") &&
      ["POST", "PUT", "PATCH"].includes(request.method) &&
      !request.headers.get("content-type")
    ) {
      const headers = new Headers(request.headers);
      headers.set("content-type", "application/json");
      trpcRequest = new Request(request, { headers });
    }

    return (
      bunHandler(trpcRequest, serverInstance) ??
      new Response("Not found", { status: 404 })
    );
  },
  websocket: socketHandler.websocket,
});

console.log(
  `HumanLogs2026 API listening at http://localhost:${server.port} and ws://localhost:${server.port}/socket.io/`,
);
