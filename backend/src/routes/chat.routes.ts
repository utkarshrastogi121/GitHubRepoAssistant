import { Router } from "express";
import { validate } from "../middlewares/validate";
import * as chatController from "../controllers/chat.controller";

const router = Router();

/**
 * @openapi
 * /chat/{repoId}/index:
 *   post:
 *     summary: Chunk, embed, and store repository code in ChromaDB
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: repoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Repository id from /api/repos/analyze
 *     responses:
 *       201:
 *         description: Number of chunks indexed
 */
router.post("/:repoId/index", chatController.indexRepo);

/**
 * @openapi
 * /chat/{repoId}/message:
 *   post:
 *     summary: Ask a question about the repository (RAG)
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: repoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Repository id from /api/repos/analyze
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 example: What does this repository do?
 *               sessionId:
 *                 type: string
 *                 description: Omit on first message - a new session will be created and returned
 *     responses:
 *       200:
 *         description: RAG answer with sources
 */
router.post(
  "/:repoId/message",
  validate(chatController.sendMessageSchema),
  chatController.sendMessage
);

/**
 * @openapi
 * /chat/history/{sessionId}:
 *   get:
 *     summary: Get chat message history for a session
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session id returned from the first /message call
 *     responses:
 *       200:
 *         description: List of chat messages
 */
router.get("/history/:sessionId", chatController.getHistory);

export default router;
