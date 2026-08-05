// Single Gemini client instance, reused everywhere we need to call the model.
// Keeping this in one file means the API key and model names are configured
// exactly once.

import { GoogleGenAI } from "@google/genai";
import { env } from "./env";

export const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export const GEMINI_MODEL = env.GEMINI_MODEL;
export const GEMINI_EMBEDDING_MODEL = env.GEMINI_EMBEDDING_MODEL;
