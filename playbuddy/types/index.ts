export interface ILocation {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  images: string[];
  description: string;
  sportTypes: ISportType[];
  createdAt: Date;
}

export interface IGroupChat {
  _id: string;
  name: string;
  creator: IUser | string;
  admin: IUser | string;
  members: IUser[];
  maxMembers: number;
  description: string;
  image: string;
  sportType: ISportType;
  messages: string[];
  lastMessage: string | IGroupMessage | null;
  preferredSkill: string;
  locationId: string;
  createdAt: Date;
}

export interface IDirectChat {
  _id: string;
  user1: IUser | string;
  user2: IUser | string;
  lastMessage: IDirectMessage | string;
  createdAt: Date;
}

export interface IUser {
  _id: string;
  name: string;
  image: string;
  email: string;
  password: string;
  createdAt: Date;
  otp: string;
  friends: string[];
  fcmToken: string;
}

export type LoginFormType = {
  email: string;
  password: string;
};

export type SignupFormType = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export interface ILocations {
  _id: string;
  name: string;
  image: string;
  description: string;
  lat: string;
  lng: string;
  sportTypes: ISportType[] | string[];
  createdAt: Date;
}

export interface ISportType {
  _id: string;
  name: string;
  createdAt?: Date;
}

export interface ISkill {
  _id: string;
  name: string;
}

export type CreateGroupChatType = {
  name: string;
  description: string;
  maxMembers: number;
  sportType: string;
  preferredSkill: string;
};

export interface IFriendRequest {
  _id: string;
  sender: string | IUser;
  receiver: string | IUser;
  createdAt: Date;
  status: string;
}

export type ReportFormType = {
  reason: string;
  description?: string;
  image?: UploadImageType;
};

export type ReportDataType = {
  reason: string;
  description?: string;
  image?: string;
};

export interface IFriendship {
  _id: string;
  user1: IUser;
  user2: IUser;
  createdAt: Date;
}

export interface IGroupInvitation {
  _id: string;
  sender: IUser;
  receiver: IUser;
  createdAt: IUser;
  groupChat: IGroupChat;
  status: string;
}

export interface INotification {
  _id: string;
  type: string;
  sender: IUser;
  receiver: IUser;
  relatedId: IFriendRequest | IGroupInvitation | any;
  isRead: boolean;
  createdAt: Date;
}

export type UpdateGroupChatType = {
  name?: string;
  description?: string;
  preferredSkill?: string;
  maxMembers?: number;
  image?: string;
};

export type UnfriendDataType = {
  modalVisible: boolean;
  friendshipId: string;
};

export interface IGroupMessage {
  _id: string;
  sender: IUser | string;
  text: string | null;
  image: string | null;
  readBy: IUser[] | string[];
  createdAt: Date;
  groupChatId: string;
}

export interface IDirectMessage {
  _id: string;
  sender: IUser | string;
  receiver: IUser | string;
  text?: string | null;
  image?: string | null;
  createdAt: Date;
  isRead: boolean;
  directChatId: string;
}

export type UploadImageType = {
  uri: string;
  type: string;
  name: string;
};

export type ScaleSizeType = {
  imageWidth: number;
  imageHeight: number;
  maxWidth: number;
  maxHeight: number;
};

export type ImageModalType = {
  visible: boolean;
  imageUri: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
};

export type ReadModalType = {
  data: IUser[] | null;
  visible: boolean;
};
