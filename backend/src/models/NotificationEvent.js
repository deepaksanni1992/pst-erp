import mongoose from "mongoose";

const notificationEventSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    module: { type: String, default: "", trim: true, index: true },
    eventKey: { type: String, default: "", trim: true, index: true },
    channel: { type: String, enum: ["IN_APP", "EMAIL"], default: "IN_APP", index: true },
    recipient: { type: String, default: "", trim: true, index: true },
    message: { type: String, default: "" },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ["PENDING", "SENT", "FAILED"], default: "PENDING", index: true },
    sentAt: { type: Date, default: null },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

notificationEventSchema.index({ companyId: 1, createdAt: -1 });

export default mongoose.model("NotificationEvent", notificationEventSchema);

