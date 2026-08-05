import { Router } from "express";
import { validate } from "../middlewares/validate";
import * as repoController from "../controllers/repo.controller";

const router = Router();

/**
 * @openapi
 * /repos/analyze:
 *   post:
 *     summary: Clone and analyze a public GitHub repository
 *     tags: [Repository]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [githubUrl]
 *             properties:
 *               githubUrl:
 *                 type: string
 *                 example: https://github.com/expressjs/express
 *     responses:
 *       201:
 *         description: Repository analyzed and saved
 *       400:
 *         description: Validation error
 */
router.post(
  "/analyze",
  validate(repoController.analyzeRepoSchema),
  repoController.analyzeRepo
);

/**
 * @openapi
 * /repos:
 *   get:
 *     summary: List all previously analyzed repositories
 *     tags: [Repository]
 *     responses:
 *       200:
 *         description: List of repositories
 */
router.get("/", repoController.listRepos);

/**
 * @openapi
 * /repos/{id}:
 *   get:
 *     summary: Get a saved repository analysis by id
 *     tags: [Repository]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Repository id (uuid) returned from /analyze
 *     responses:
 *       200:
 *         description: Repository analysis
 *       404:
 *         description: Repository not found
 */
router.get("/:id", repoController.getRepo);

export default router;
