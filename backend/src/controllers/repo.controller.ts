// Thin HTTP layer for repository analysis endpoints.
// Validates input (via middleware), calls repo.service, returns JSON.

import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as repoService from "../services/repo.service";

export const analyzeRepoSchema = z.object({
  githubUrl: z.string().url("githubUrl must be a valid URL"),
});

export async function analyzeRepo(req: Request, res: Response, next: NextFunction) {
  try {
    const { githubUrl } = req.body;
    const repository = await repoService.analyzeRepo(githubUrl);
    res.status(201).json(repository);
  } catch (err) {
    next(err);
  }
}

export async function getRepo(req: Request, res: Response, next: NextFunction) {
  try {
    const repository = await repoService.getRepoById(req.params.id);
    res.json(repository);
  } catch (err) {
    next(err);
  }
}

export async function listRepos(_req: Request, res: Response, next: NextFunction) {
  try {
    const repositories = await repoService.listRepos();
    res.json(repositories);
  } catch (err) {
    next(err);
  }
}
