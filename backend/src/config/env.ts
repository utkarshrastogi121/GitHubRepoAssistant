
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("4000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  GEMINI_EMBEDDING_MODEL: z.string().default("text-embedding-004"),

  CHROMA_URL: z.string().default("http://localhost:8000"),
  CHROMA_TENANT: z.string().min(1, "CHROMA_TENANT is required"),
  CHROMA_DATABASE: z.string().min(1, "CHROMA_DATABASE is required"),
  CHROMA_API_KEY: z.string().min(1, "CHROMA_API_KEY is required"),

  CLONE_TMP_DIR: z.string().default("./tmp-repos"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  PORT: Number(parsed.data.PORT),
};
