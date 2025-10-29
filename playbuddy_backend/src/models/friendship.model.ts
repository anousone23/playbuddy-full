import { model, Schema } from "mongoose";

interface IFriendSchema extends Document {
  user1: Schema.Types.ObjectId;
  user2: Schema.Types.ObjectId;
}

const FriendshipSchema = new Schema<IFriendSchema>(
  {
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
  },
  { timestamps: true }
);

export const Friendship = model("Friendship", FriendshipSchema);
