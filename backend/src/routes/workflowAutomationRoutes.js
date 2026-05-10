import express from "express";
import { requireErpAccess } from "../middleware/erpAccess.js";
import { requirePermission } from "../middleware/permissions.js";
import * as c from "../controllers/workflowAutomationController.js";

const router = express.Router();
router.use(...requireErpAccess);

const reportsView = requirePermission("REPORTS", "view");
const reportsCreate = requirePermission("REPORTS", "create");
const reportsEdit = requirePermission("REPORTS", "edit");

router.get("/rules", reportsView, c.listWorkflowRules);
router.post("/rules", reportsCreate, c.createWorkflowRule);
router.patch("/rules/:id", reportsEdit, c.updateWorkflowRule);

router.post("/trigger", reportsEdit, c.triggerWorkflowEvent);
router.get("/executions", reportsView, c.listWorkflowExecutions);
router.get("/notifications", reportsView, c.listNotificationEvents);

export default router;

