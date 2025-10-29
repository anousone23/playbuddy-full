import { Document, model, Schema } from "mongoose";

interface IDirectChat extends Document {
  user1: Schema.Types.ObjectId;
  user2: Schema.Types.ObjectId;
  lastMessage: Schema.Types.ObjectId;
}

const DirectChatSchema = new Schema<IDirectChat>({
  user1: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  user2: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: "DirectMessage",
    default: null,
  },
});

export const DirectChat = model("DirectChat", DirectChatSchema);
