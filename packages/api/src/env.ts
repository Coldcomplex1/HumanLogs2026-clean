import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["test", "development", "production", "staging"])
    .default("development"),
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string(),
  ADMIN_HOST_URL: z.string().default("http://localhost:3000"),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_AGENT_ID: z.string().optional(),
  ELEVENLABS_WEBHOOK_SECRET: z.string().optional(),
  GOONG_MAP_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-5.2"),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
export const isDev = env.NODE_ENV === "development";
