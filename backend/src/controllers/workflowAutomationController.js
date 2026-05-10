import AutomationExecution from "../models/AutomationExecution.js";
import AutomationRule from "../models/AutomationRule.js";
import NotificationEvent from "../models/NotificationEvent.js";
import { nextSequentialNumber } from "../utils/docNumbers.js";
import { writeAudit } from "../services/auditService.js";
import { runWorkflowAutomations } from "../services/workflowEngineService.js";

function withCompany(req, filter = {}) {
  return { ...filter, companyId: req.companyId };
}

export async function listWorkflowRules(req, res) {
  try {
    const filter = withCompany(req, {});
    if (req.query.module) filter.module = String(req.query.module).trim().toUpperCase();
    if (req.query.active === "true") filter.active = true;
    if (req.query.active === "false") filter.active = false;
    const items = await AutomationRule.find(filter).sort({ updatedAt: -1 }).limit(500).lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createWorkflowRule(req, res) {
  try {
    const body = req.body || {};
    const ruleNo = await nextSequentialNumber(AutomationRule, "ruleNo", `${req.companyCode || "CMP"}-WFR`, {
      companyId: req.companyId,
    });
    const doc = await AutomationRule.create({
      companyId: req.companyId,
      ruleNo,
      name: String(body.name || "").trim(),
      module: String(body.module || "").trim().toUpperCase(),
      eventKey: String(body.eventKey || "").trim(),
      active: body.active !== false,
      conditions: body.conditions && typeof body.conditions === "object" ? body.conditions : {},
      actions: Array.isArray(body.actions) ? body.actions : [],
      createdBy: req.user?.email || "",
      updatedBy: req.user?.email || "",
    });
    await writeAudit(req, {
      action: "CREATE",
      module: "WORKFLOW",
      entityType: "AUTOMATION_RULE",
      entityId: doc._id,
      documentNo: doc.ruleNo,
      description: `Workflow rule created: ${doc.name}`,
      metadata: { module: doc.module, eventKey: doc.eventKey },
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateWorkflowRule(req, res) {
  try {
    const row = await AutomationRule.findOne(withCompany(req, { _id: req.params.id }));
    if (!row) return res.status(404).json({ message: "Rule not found" });
    const body = req.body || {};
    if (body.name != null) row.name = String(body.name).trim();
    if (body.eventKey != null) row.eventKey = String(body.eventKey).trim();
    if (body.active != null) row.active = Boolean(body.active);
    if (body.module != null) row.module = String(body.module).trim().toUpperCase();
    if (body.conditions && typeof body.conditions === "object") row.conditions = body.conditions;
    if (Array.isArray(body.actions)) row.actions = body.actions;
    row.updatedBy = req.user?.email || "";
    await row.save();
    res.json(row);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function triggerWorkflowEvent(req, res) {
  try {
    const body = req.body || {};
    const module = String(body.module || "").trim().toUpperCase();
    const eventKey = String(body.eventKey || "").trim();
    if (!module || !eventKey) {
      return res.status(400).json({ message: "module and eventKey are required" });
    }
    const payload = body.payload && typeof body.payload === "object" ? body.payload : {};
    const executions = await runWorkflowAutomations(req, {
      companyId: req.companyId,
      module,
      eventKey,
      payload,
    });
    res.json({ ok: true, module, eventKey, triggered: executions.length, executions });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function listWorkflowExecutions(req, res) {
  try {
    const filter = withCompany(req, {});
    if (req.query.module) filter.module = String(req.query.module).trim().toUpperCase();
    if (req.query.eventKey) filter.eventKey = String(req.query.eventKey).trim();
    if (req.query.status) filter.status = String(req.query.status).trim().toUpperCase();
    const items = await AutomationExecution.find(filter).sort({ createdAt: -1 }).limit(500).lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function listNotificationEvents(req, res) {
  try {
    const filter = withCompany(req, {});
    if (req.query.module) filter.module = String(req.query.module).trim().toUpperCase();
    if (req.query.eventKey) filter.eventKey = String(req.query.eventKey).trim();
    if (req.query.status) filter.status = String(req.query.status).trim().toUpperCase();
    const items = await NotificationEvent.find(filter).sort({ createdAt: -1 }).limit(500).lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

