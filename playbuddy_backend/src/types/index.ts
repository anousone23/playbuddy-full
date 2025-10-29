import { Schema } from "mongoose";

export type SignupRequestDataType = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface IDirectMessageSchema extends Document {
  _id: Schema.Types.ObjectId;
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  text: string;
  image?: string;
  isRead: boolean;
  directChatId: Schema.Types.ObjectId;
}

export interface IGroupMessageSchema extends Document {
  _id: Schema.Types.ObjectId;
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  text: string;
  image?: string;
  readBy: Schema.Types.ObjectId;
  groupChatId: Schema.Types.ObjectId;
}
