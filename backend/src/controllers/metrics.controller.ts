import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as evaluationService from "../services/evaluation.service";
import { SAMPLE_QUESTIONS } from "../metrics/sample-questions";

const evaluateSchema = z.object({
  // Omit to run the built-in starter set (for this repo - see
  // metrics/sample-questions.ts). Pass your own labelled
  // questions for any other repo.
  questions: z
    .array(
      z.object({
        question: z.string().min(1),
        expectedFiles: z.array(z.string().min(1)).min(1),
      })
    )
    .min(1)
    .max(20)
    .optional(),
});

export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await evaluationService.getQueryMetricsSummary(req.params.repoId));
  } catch (err) {
    next(err);
  }
}

export async function getEvaluations(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await evaluationService.getLatestEvaluations(req.params.repoId));
  } catch (err) {
    next(err);
  }
}

export async function runEvaluation(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = evaluateSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid questions", details: parsed.error.flatten().fieldErrors });
      return;
    }
    const questions = parsed.data.questions ?? SAMPLE_QUESTIONS;
    // Long-running: retrieval only, no LLM, but still allow the
    // client a generous window - see routes/metrics.routes.ts.
    res.json(await evaluationService.runEvaluation(req.params.repoId, questions));
  } catch (err) {
    next(err);
  }
}
