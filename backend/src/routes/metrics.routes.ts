import { Router } from "express";
import * as metricsController from "../controllers/metrics.controller";

const router = Router();

/**
 * @openapi
 * /metrics/{repoId}/summary:
 *   get:
 *     summary: Live metrics - latest index run, avg query latency, recent queries
 *     tags: [Metrics]
 */
router.get("/:repoId/summary", metricsController.getSummary);

/**
 * @openapi
 * /metrics/{repoId}/evaluations:
 *   get:
 *     summary: Latest evaluation runs (vector-only vs graph-aware)
 *     tags: [Metrics]
 */
router.get("/:repoId/evaluations", metricsController.getEvaluations);

/**
 * @openapi
 * /metrics/{repoId}/evaluate:
 *   post:
 *     summary: Run Recall@k / MRR evaluation on labelled questions
 *     tags: [Metrics]
 */
router.post("/:repoId/evaluate", metricsController.runEvaluation);

export default router;
