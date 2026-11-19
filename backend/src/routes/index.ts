
import { Router } from "express";
import repoRoutes from "./repo.routes";
import chatRoutes from "./chat.routes";
import docsRoutes from "./docs.routes";
import reviewRoutes from "./review.routes";
import metricsRoutes from "./metrics.routes";


const router = Router();

router.use("/repos", repoRoutes);
router.use("/chat", chatRoutes);
router.use("/docs", docsRoutes);
router.use("/review", reviewRoutes);
router.use("/metrics", metricsRoutes);


export default router;
