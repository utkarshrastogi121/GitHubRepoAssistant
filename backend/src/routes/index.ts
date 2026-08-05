
import { Router } from "express";
import repoRoutes from "./repo.routes";
import chatRoutes from "./chat.routes";
import docsRoutes from "./docs.routes";
import reviewRoutes from "./review.routes";

const router = Router();

router.use("/repos", repoRoutes);
router.use("/chat", chatRoutes);
router.use("/docs", docsRoutes);
router.use("/review", reviewRoutes);

export default router;
