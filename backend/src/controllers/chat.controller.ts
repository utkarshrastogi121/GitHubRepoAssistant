
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as ragService from "../services/rag.service";

export const sendMessageSchema = z.object({
  message: z.string().min(1, "message is required"),
  sessionId: z.string().uuid().optional(),
});

export async function indexRepo(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ragService.indexRepository(req.params.repoId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { repoId } = req.params;
    const { message, sessionId } = req.body;

    const session = await ragService.getOrCreateSession(repoId, sessionId);
    const result = await ragService.askQuestion(repoId, session.id, message);

    res.json({ sessionId: session.id, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const history = await ragService.getChatHistory(req.params.sessionId);
    res.json(history);
  } catch (err) {
    next(err);
  }
}
