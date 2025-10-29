import mongoose, { Document, Schema } from "mongoose";

interface IGroupInvitation extends Document {
  _id: Schema.Types.ObjectId;
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  status: string;
  groupChat: Schema.Types.ObjectId;
}

const GroupInvitationSchema = new mongoose.Schema<IGroupInvitation>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted", "rejected", "pending"],
      default: "pending",
    },
    groupChat: {
      type: Schema.Types.ObjectId,
      ref: "GroupChat",
      required: true,
    },
  },
  { timestamps: true }
);

export const GroupInvitation = mongoose.model(
  "GroupInvitation",
  GroupInvitationSchema
);
