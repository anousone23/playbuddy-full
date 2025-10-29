import { z } from "zod";

import { locationFormSchema } from "@/lib/zod";

export type LocationFormValues = z.infer<typeof locationFormSchema>;

export interface IUser {
  _id: string;
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
}

export interface IReport {
  _id: string;
  type: "groupChat" | "user";
  reportedId: string;
  reportBy: IUser;
  reason:
    | "Inappropriate name"
    | "Inappropriate profile image"
    | "Use of offensive words"
    | "Inappropriate group name"
    | "Inappropriate group image"
    | "Inappropriate group content";
  description: string;
  image: string;
  createdAt: Date;
  isAcknowledged: boolean;
}

export interface ISportType {
  _id: string;
  name: string;
}

export interface ILocation {
  _id: string;
  name: string;
  images: string[];
  description?: string;
  latitude: number;
  longitude: number;
  sportTypes: ISportType[];
}

export interface IGroupChat {
  _id: string;
  creator: IUser;
  admin: IUser;
  name: string;
  image: string;
  description: string;
  maxMembers: number;
  sportType: ISportType;
  preferredSkill: string;
  members: IUser[];
  locationId: ILocation;
  joinedAt: Map<string, Date>;
  lastMessage: string;
}

/////////////////////////////

export type UploadImageType = {
  uri: string;
  type: string;
  name: string;
};

export type ImageType = {
  uri: string;
  file: File;
};

export type CreateLocationType = {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  sportTypes: string[];
  images: string[];
};

export type UpdateLocationType = {
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  sportTypes?: string[];
  images?: string[];
};

export type UpdateGroupChatType = {
  name?: string;
  image?: string;
};

export type GroupChatPerSportTypeType = {
  sportType: string;
  count: number;
};

export type DashbaordType = {
  totalUsers: number;
  onlineUsers: number;
  totalLocations: number;
  totalMessages: number;
  groupChatsPerSportType: GroupChatPerSportTypeType[];
};

export type UpdateProfileType = {
  name?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  image?: string;
};
