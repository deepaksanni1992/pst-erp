import mongoose from "mongoose";

const automationExecutionSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    ruleId: { type: mongoose.Schema.Types.ObjectId, ref: "AutomationRule", required: true, index: true },
    module: { type: String, default: "", trim: true, index: true },
    eventKey: { type: String, default: "", trim: true, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["SUCCESS", "SKIPPED", "FAILED"],
      default: "SUCCESS",
      index: true,
    },
    resultSummary: { type: String, default: "", trim: true },
    errorMessage: { type: String, default: "", trim: true },
    triggeredBy: { type: String, default: "" },
  },
  { timestamps: true }
);

automationExecutionSchema.index({ companyId: 1, createdAt: -1 });

export default mongoose.model("AutomationExecution", automationExecutionSchema);

