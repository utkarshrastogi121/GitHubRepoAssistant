
import { Request, Response, NextFunction } from "express";
import * as reviewService from "../services/review.service";

export async function detectBugs(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await reviewService.detectBugs(req.params.repoId));
  } catch (err) {
    next(err);
  }
}

export async function detectCodeSmells(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await reviewService.detectCodeSmells(req.params.repoId));
  } catch (err) {
    next(err);
  }
}

export async function suggestImprovements(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await reviewService.suggestImprovements(req.params.repoId));
  } catch (err) {
    next(err);
  }
}

export async function explainApis(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await reviewService.explainApis(req.params.repoId));
  } catch (err) {
    next(err);
  }
}

export async function explainBusinessLogic(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await reviewService.explainBusinessLogic(req.params.repoId));
  } catch (err) {
    next(err);
  }
}
