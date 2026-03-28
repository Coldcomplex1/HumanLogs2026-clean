import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { env } from "../env";

export const elevenLabsClient = env.ELEVENLABS_API_KEY
  ? new ElevenLabsClient({
      apiKey: env.ELEVENLABS_API_KEY,
    })
  : null;

export type { ElevenLabsClient };
