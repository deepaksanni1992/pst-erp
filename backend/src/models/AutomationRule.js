import mongoose from "mongoose";

const automationRuleSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    ruleNo: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    module: {
      type: String,
      enum: ["SALES", "PROCUREMENT", "ACCOUNTS", "LOGISTICS", "APPROVALS", "COMMUNICATION"],
      required: true,
      index: true,
    },
    eventKey: { type: String, required: true, trim: true, index: true },
    active: { type: Boolean, default: true, index: true },
    conditions: {
      statusEquals: { type: String, default: "" },
      minAmount: { type: Number, default: null },
    },
    actions: {
      type: [
        {
          type: {
            type: String,
            enum: ["CREATE_NOTIFICATION", "WRITE_AUDIT"],
            default: "CREATE_NOTIFICATION",
          },
          channel: { type: String, enum: ["IN_APP", "EMAIL"], default: "IN_APP" },
          recipient: { type: String, default: "", trim: true },
          messageTemplate: { type: String, default: "", trim: true },
        },
      ],
      default: [],
    },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

automationRuleSchema.index({ companyId: 1, ruleNo: 1 }, { unique: true });
automationRuleSchema.index({ companyId: 1, module: 1, eventKey: 1, active: 1 });

export default mongoose.model("AutomationRule", automationRuleSchema);

