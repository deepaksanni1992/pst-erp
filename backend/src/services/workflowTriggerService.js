import { runWorkflowAutomations } from "./workflowEngineService.js";

/**
 * Fire-and-forget workflow trigger.
 * Never throws in request path (main transaction must not fail).
 */
export function triggerWorkflowEventSafe(req, { module, eventKey, payload = {} }) {
  Promise.resolve()
    .then(() =>
      runWorkflowAutomations(req, {
        companyId: req.companyId,
        module,
        eventKey,
        payload: {
          ...payload,
          companyId: req.companyId,
          userId: req.user?._id ? String(req.user._id) : "",
          userEmail: req.user?.email || "",
        },
      })
    )
    .catch((err) => {
      console.warn(`[workflow] trigger failed for ${module}.${eventKey}:`, err.message);
    });
}

