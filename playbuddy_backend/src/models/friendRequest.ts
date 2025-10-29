import mongoose, { Document, Schema } from "mongoose";

interface IFriendRequestSchema extends Document {
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const FriendRequestSchema = new mongoose.Schema<IFriendRequestSchema>(
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
  },
  { timestamps: true }
);

export const FriendRequest = mongoose.model(
  "FriendRequest",
  FriendRequestSchema
);
