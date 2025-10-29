import mongoose from "mongoose";

interface IUserSchema {
  name: string;
  email: string;
  image: string;
  password: string;
  resetPasswordOtp: string;
  role: string;
  isDeactivate: boolean;
  deactivatedAt: Date;
  isSuspended: boolean;
  fcmToken: string;
  isAdmin: Date;
}

const UserSchema = new mongoose.Schema<IUserSchema>(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    resetPasswordOtp: {
      type: String,
    },
    isDeactivate: {
      type: Boolean,
      default: false,
    },
    deactivatedAt: {
      type: Date,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    fcmToken: {
      type: String,
    },
    isAdmin: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
