import { Document, model, Schema } from "mongoose";
import { IDirectMessageSchema } from "../types";

const DirectMessageSchema = new Schema<IDirectMessageSchema>(
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
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
    directChatId: {
      type: Schema.Types.ObjectId,
      ref: "DirectChat",
      required: true,
    },
  },
  { timestamps: true }
);

export const DirectMessage = model("DirectMessage", DirectMessageSchema);
