
import { Request, Response, NextFunction } from "express";
import * as readmeService from "../services/readme.service";
import * as diagramService from "../services/diagram.service";

export async function generateReadme(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await readmeService.generateReadme(req.params.repoId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function generateArchitectureDiagram(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await diagramService.generateArchitectureDiagram(req.params.repoId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
