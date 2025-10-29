import mongoose, { Document, Schema } from "mongoose";

interface INotificationSchema extends Document {
  _id: Schema.Types.ObjectId;
  type: "friendRequest" | "groupInvitation" | "directMessage" | "groupMessage";
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  relatedId: Schema.Types.ObjectId;
  isRead: Boolean;
}

const NotificationSchema = new Schema<INotificationSchema>(
  {
    type: {
      type: String,
      enum: [
        "FriendRequest",
        "FriendRequestAccepted",
        "GroupInvitation",
        "GroupInvitationAccepted",
        "DirectMessage",
        "GroupMessage",
        "KickFromGroupChat",
        "GroupChatDeletion",
      ],
      required: true,
    },
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
    relatedId: {
      type: Schema.Types.ObjectId,
      refPath: "type",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", NotificationSchema);
