// Configures the Express app: middleware, routes, swagger, error handler.
// Kept separate from server.ts so the app can be imported in tests
// without actually starting a listening server.

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import apiRoutes from "./routes";
import { mountSwagger } from "./swagger/swagger";
import { errorHandler } from "./middlewares/error-handler";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

mountSwagger(app);

app.use("/api", apiRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler - must be registered last
app.use(errorHandler);
