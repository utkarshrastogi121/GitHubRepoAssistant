// Single global error handler. Every thrown error (from controllers/services)
// ends up here via Express's next(err) mechanism, giving one consistent
// JSON error response shape for the whole API.

import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error(`${req.method} ${req.path} -`, err.message);

  const status = (err as any).status ?? 500;

  res.status(status).json({
    error: err.message || "Internal Server Error",
  });
}
