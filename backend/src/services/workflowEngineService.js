import AutomationExecution from "../models/AutomationExecution.js";
import AutomationRule from "../models/AutomationRule.js";
import NotificationEvent from "../models/NotificationEvent.js";
import { writeAudit } from "./auditService.js";

function interpolate(template, payload = {}) {
  let out = String(template || "");
  for (const [k, v] of Object.entries(payload || {})) {
    const token = new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, "g");
    out = out.replace(token, String(v ?? ""));
  }
  return out;
}

function ruleMatches(rule, payload = {}) {
  const statusEquals = String(rule.conditions?.statusEquals || "").trim();
  if (statusEquals) {
    const payloadStatus = String(payload.status || "").trim().toUpperCase();
    if (payloadStatus !== statusEquals.toUpperCase()) return false;
  }
  const minAmount = rule.conditions?.minAmount;
  if (minAmount != null && Number.isFinite(Number(minAmount))) {
    const amount = Number(payload.amount || 0);
    if (amount < Number(minAmount)) return false;
  }
  return true;
}

async function executeRule(req, rule, eventPayload = {}) {
  if (!ruleMatches(rule, eventPayload)) {
    return AutomationExecution.create({
      companyId: rule.companyId,
      ruleId: rule._id,
      module: rule.module,
      eventKey: rule.eventKey,
      payload: eventPayload,
      status: "SKIPPED",
      resultSummary: "Conditions not matched",
      triggeredBy: req?.user?.email || "system",
    });
  }

  let notificationCount = 0;
  for (const action of rule.actions || []) {
    if (action.type === "CREATE_NOTIFICATION") {
      await NotificationEvent.create({
        companyId: rule.companyId,
        module: rule.module,
        eventKey: rule.eventKey,
        channel: action.channel || "IN_APP",
        recipient: String(action.recipient || req?.user?.email || "").trim(),
        message: interpolate(action.messageTemplate || "", eventPayload),
        payload: eventPayload,
        status: "PENDING",
        createdBy: req?.user?.email || "",
      });
      notificationCount += 1;
    }
    if (action.type === "WRITE_AUDIT") {
      await writeAudit(req, {
        action: "AUTOMATION_TRIGGER",
        module: "WORKFLOW",
        entityType: "AUTOMATION_RULE",
        entityId: rule._id,
        documentNo: rule.ruleNo,
        description: `Workflow rule executed: ${rule.name}`,
        metadata: { eventKey: rule.eventKey, module: rule.module },
      });
    }
  }

  return AutomationExecution.create({
    companyId: rule.companyId,
    ruleId: rule._id,
    module: rule.module,
    eventKey: rule.eventKey,
    payload: eventPayload,
    status: "SUCCESS",
    resultSummary: `Executed ${notificationCount} notification action(s)`,
    triggeredBy: req?.user?.email || "system",
  });
}

export async function runWorkflowAutomations(req, { companyId, module, eventKey, payload = {} }) {
  const rules = await AutomationRule.find({
    companyId,
    module: String(module || "").trim().toUpperCase(),
    eventKey: String(eventKey || "").trim(),
    active: true,
  })
    .sort({ createdAt: 1 })
    .lean(false);

  const executions = [];
  for (const rule of rules) {
    try {
      const exec = await executeRule(req, rule, payload);
      executions.push(exec);
    } catch (err) {
      const failed = await AutomationExecution.create({
        companyId: rule.companyId,
        ruleId: rule._id,
        module: rule.module,
        eventKey: rule.eventKey,
        payload,
        status: "FAILED",
        resultSummary: "Execution failed",
        errorMessage: err.message,
        triggeredBy: req?.user?.email || "system",
      });
      executions.push(failed);
    }
  }
  return executions;
}

