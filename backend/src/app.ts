import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import apiRoutes from "./routes";
import { mountSwagger } from "./swagger/swagger";
import { errorHandler } from "./middlewares/error-handler";

export const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://github-repo-assistant-taupe.vercel.app",
];


app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

mountSwagger(app);

app.use("/api", apiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

app.use(errorHandler);
