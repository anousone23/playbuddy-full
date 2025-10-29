import mongoose, { Document, Schema } from "mongoose";

interface IReportSchema extends Document {
  type: "groupChat" | "user";
  reportedId: Schema.Types.ObjectId;
  reportBy: Schema.Types.ObjectId;
  reason:
    | "Inappropriate name"
    | "Inappropriate profile image"
    | "Use of offensive words"
    | "Inappropriate group name"
    | "Inappropriate group image"
    | "Inappropriate group content";
  description: string;
  image: string;
  isAcknowledged: boolean;
}

const ReportSchema = new mongoose.Schema<IReportSchema>(
  {
    type: {
      type: String,
      enum: ["GroupChat", "User"],
      required: true,
    },
    reportedId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "type",
    },
    reportBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "Inappropriate name",
        "Inappropriate profile image",
        "Use of offensive words",
        "Inappropriate group name",
        "Inappropriate group image",
        "Inappropriate group content",
      ],
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    isAcknowledged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", ReportSchema);
