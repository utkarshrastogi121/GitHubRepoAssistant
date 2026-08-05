import { Router } from "express";
import * as reviewController from "../controllers/review.controller";

const router = Router();

/**
 * @openapi
 * /review/{repoId}/bugs:
 *   post:
 *     summary: Detect potential bugs in a repository
 *     description: Uses AI to analyze the repository and identify potential bugs.
 *     tags:
 *       - Review
 *     parameters:
 *       - in: path
 *         name: repoId
 *         required: true
 *         description: Repository ID returned from the Analyze Repository endpoint.
 *         schema:
 *           type: string
 *           example: "cmf2abc123xyz"
 *     responses:
 *       200:
 *         description: Bug analysis completed successfully.
 *       404:
 *         description: Repository not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/:repoId/bugs", reviewController.detectBugs);

/**
 * @openapi
 * /review/{repoId}/code-smells:
 *   post:
 *     summary: Detect code smells in a repository
 *     description: Uses AI to identify maintainability and code quality issues.
 *     tags:
 *       - Review
 *     parameters:
 *       - in: path
 *         name: repoId
 *         required: true
 *         description: Repository ID returned from the Analyze Repository endpoint.
 *         schema:
 *           type: string
 *           example: "cmf2abc123xyz"
 *     responses:
 *       200:
 *         description: Code smell analysis completed successfully.
 *       404:
 *         description: Repository not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/:repoId/code-smells", reviewController.detectCodeSmells);

/**
 * @openapi
 * /review/{repoId}/suggestions:
 *   post:
 *     summary: Suggest improvements for a repository
 *     description: Uses AI to recommend improvements for code quality, readability, performance, and maintainability.
 *     tags:
 *       - Review
 *     parameters:
 *       - in: path
 *         name: repoId
 *         required: true
 *         description: Repository ID returned from the Analyze Repository endpoint.
 *         schema:
 *           type: string
 *           example: "cmf2abc123xyz"
 *     responses:
 *       200:
 *         description: Suggestions generated successfully.
 *       404:
 *         description: Repository not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/:repoId/suggestions", reviewController.suggestImprovements);

/**
 * @openapi
 * /review/{repoId}/explain-api:
 *   post:
 *     summary: Explain API endpoints
 *     description: Uses AI to analyze and explain the API endpoints present in the repository.
 *     tags:
 *       - Review
 *     parameters:
 *       - in: path
 *         name: repoId
 *         required: true
 *         description: Repository ID returned from the Analyze Repository endpoint.
 *         schema:
 *           type: string
 *           example: "cmf2abc123xyz"
 *     responses:
 *       200:
 *         description: API explanation generated successfully.
 *       404:
 *         description: Repository not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/:repoId/explain-api", reviewController.explainApis);

/**
 * @openapi
 * /review/{repoId}/explain-logic:
 *   post:
 *     summary: Explain business logic
 *     description: Uses AI to explain the business logic and core functionality of the repository.
 *     tags:
 *       - Review
 *     parameters:
 *       - in: path
 *         name: repoId
 *         required: true
 *         description: Repository ID returned from the Analyze Repository endpoint.
 *         schema:
 *           type: string
 *           example: "cmf2abc123xyz"
 *     responses:
 *       200:
 *         description: Business logic explanation generated successfully.
 *       404:
 *         description: Repository not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/:repoId/explain-logic", reviewController.explainBusinessLogic);

export default router;