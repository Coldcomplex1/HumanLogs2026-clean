import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((value) => value || undefined);

const envSchema = z.object({
  VITE_API_URL: z.string().default("http://localhost:8000"),
  VITE_SOCKET_URL: z.string().default("http://localhost:8000"),
  VITE_AGENT_ID: optionalString,
  VITE_CLOUDINARY_CLOUD_NAME: optionalString,
  VITE_CLOUDINARY_UPLOAD_PRESET: optionalString,
});

export const env = envSchema.parse(import.meta.env);
