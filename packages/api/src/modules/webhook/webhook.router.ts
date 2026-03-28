import { env } from "../../env";
import services from "../../services";

const validateWebhookSecret = (request: Request) => {
  if (!env.ELEVENLABS_WEBHOOK_SECRET) {
    return true;
  }

  const headerSecret =
    request.headers.get("x-elevenlabs-signature") ||
    request.headers.get("x-webhook-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  return headerSecret === env.ELEVENLABS_WEBHOOK_SECRET;
};

export const webhookRouter = {
  elevenLabsWebhook: async (req: Request) => {
    if (!validateWebhookSecret(req)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const result = await services.webhook.handleElevenLabsWebhook(body);
    return Response.json(result, { status: 202 });
  },

  debugElevenLabsWebhook: async (req: Request) => {
    const body = await req.json();
    const result = await services.webhook.handleElevenLabsWebhook(body);
    return Response.json(result, { status: 202 });
  },
};
