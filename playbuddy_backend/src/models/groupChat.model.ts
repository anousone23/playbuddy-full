import { Document, model, Schema } from "mongoose";

interface IGroupChatSchema extends Document {
  _id: Schema.Types.ObjectId;
  creator: Schema.Types.ObjectId;
  admin: Schema.Types.ObjectId;
  name: string;
  image: string;
  description: string;
  maxMembers: number;
  sportType: Schema.Types.ObjectId;
  preferredSkill: string;
  members: Schema.Types.ObjectId[];
  locationId: Schema.Types.ObjectId;
  joinedAt: Map<Schema.Types.ObjectId, Date>;
  lastMessage: Schema.Types.ObjectId;
}

const GroupChatSchema = new Schema<IGroupChatSchema>({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
  },
  image: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    maxlength: 300,
  },
  maxMembers: {
    type: Number,
    required: true,
    min: 2,
    max: 30,
  },
  sportType: {
    type: Schema.Types.ObjectId,
    ref: "SportType",
    required: true,
  },
  preferredSkill: {
    type: String,
    required: true,
    enum: ["casual", "beginner", "intermediate", "advanced"],
    default: "casual",
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  locationId: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  joinedAt: {
    type: Map,
    of: Date,
    default: {},
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: "GroupMessage",
    default: null,
  },
});

export const GroupChat = model("GroupChat", GroupChatSchema);
