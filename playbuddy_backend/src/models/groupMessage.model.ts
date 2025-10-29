import { Document, model, Schema } from "mongoose";

import { IGroupMessageSchema } from "../types";

const GroupMessageSchema = new Schema<IGroupMessageSchema>(
  {
    sender: {
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
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    groupChatId: {
      type: Schema.Types.ObjectId,
      ref: "GroupChat",
    },
  },
  { timestamps: true }
);

export const GroupMessage = model("GroupMessage", GroupMessageSchema);
