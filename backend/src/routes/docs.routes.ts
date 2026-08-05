import { Router } from "express";
import * as docsController from "../controllers/docs.controller";

const router = Router();

/**
 * @openapi
 * /docs/{repoId}/readme:
 *   post:
 *     summary: Generate a README.md for the repository
 *     tags: [Docs]
 *     parameters:
 *       - in: path
 *         name: repoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Repository id from /api/repos/analyze
 *     responses:
 *       200:
 *         description: Generated README markdown
 */
router.post("/:repoId/readme", docsController.generateReadme);

/**
 * @openapi
 * /docs/{repoId}/architecture-diagram:
 *   post:
 *     summary: Generate a Mermaid architecture diagram
 *     tags: [Docs]
 *     parameters:
 *       - in: path
 *         name: repoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Repository id from /api/repos/analyze
 *     responses:
 *       200:
 *         description: Generated Mermaid diagram code
 */
router.post("/:repoId/architecture-diagram", docsController.generateArchitectureDiagram);

export default router;
