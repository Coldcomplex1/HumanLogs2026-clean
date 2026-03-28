import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((value) => value || undefined);

const optionalBoolean = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    return value === "true" || value === "1";
  });

const envSchema = z.object({
  VITE_API_URL: z.string().default("http://localhost:8000"),
  VITE_SOCKET_URL: z.string().default("http://localhost:8000"),
  VITE_USE_MOCK_DATA: optionalBoolean,
  VITE_AGENT_ID: optionalString,
  VITE_CLOUDINARY_CLOUD_NAME: optionalString,
  VITE_CLOUDINARY_UPLOAD_PRESET: optionalString,
});

const parsedEnv = envSchema.parse(import.meta.env);

export const env = {
  ...parsedEnv,
  VITE_USE_MOCK_DATA: parsedEnv.VITE_USE_MOCK_DATA ?? true,
};
