import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import usersRouter from "./users.js";
import samplesRouter from "./samples.js";
import testsRouter from "./tests.js";
import inventoryRouter from "./inventory.js";
import workflowsRouter from "./workflows.js";
import storageRouter from "./storage.js";
import reportsRouter from "./reports.js";
import auditLogsRouter from "./audit-logs.js";
import dashboardRouter from "./dashboard.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users", usersRouter);
router.use("/samples", samplesRouter);
router.use("/tests", testsRouter);
router.use("/inventory", inventoryRouter);
router.use("/workflows", workflowsRouter);
router.use("/storage", storageRouter);
router.use("/reports", reportsRouter);
router.use("/audit-logs", auditLogsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
