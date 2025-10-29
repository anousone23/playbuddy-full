export const GROUP_REPORT_OPTIONS = [
  "Inappropriate group name",
  "Inappropriate group image",
  "Inappropriate group content",
];

export const USER_REPORT_OPTIONS = [
  "Inappropriate name",
  "Inappropriate profile image",
  "Use of offensive words",
];

export const PREFERRED_SKILL_OPTIONS = [
  "casual",
  "beginner",
  "intermediate",
  "advanced",
];

// avatar
export const placeholderAvatar =
  "https://avatar.iran.liara.run/username?username=[firstname+lastname]";

// cloudinary
export const CLOUDINARY_CLOUD_NAME = "dco25fazw";
export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
export const CLOUDINARY_UPLOAD_PRESET = "playbuddy";
export const CLOUDINARY_PROFILE_IMAGE_FOLDER = "user_profile_images";
export const CLOUDINARY_GROUP_CHAT_IMAGE_FOLDER = "group_chat_images";
export const CLOUDINARY_DIRECT_MESSAGE_FOLDER = "direct_message_images";
export const CLOUDINARY_GROUP_MESSAGE_FOLDER = "group_message_images";
export const CLOUDINARY_USER_REPORT_FOLDER = "user_report_images";
export const CLOUDINARY_GROUPCHAT_REPORT_FOLDER = "groupchat_report_images";

// Image sizes
export const MESSAGE_IMAGE_MAX_WIDTH = 200;
export const MESSAGE_IMAGE_MAX_HIEGHT = 300;
export const IMAGE_MODAL_MAX_WIDTH = 340;
export const IMAGE_MODAL_MAX_HEIGHT = 600;

// Local url
// export const BACK_END_URL = "http://192.168.1.177:8000";
export const BACK_END_URL = "http://10.244.146.147:8000";

// socket event
export const USER_ONLINE_EVENT = "user-online";
export const ONLINE_USERS_EVENT = "online-users";
export const SEND_DIRECT_MESSAGE_EVENT = "send-direct-message";
export const RECEIVE_DIRECT_MESSAGE_EVENT = "receive-direct-message";
export const JOIN_GROUP_EVENT = "join-group";
export const LEAVE_GROUP_EVENT = "leave-group";
export const SEND_GROUP_MESSAGE_EVENT = "send-group-message";
export const RECEIVE_GROUP_MESSAGE_EVENT = "receive-group-message";
export const READ_DIRECT_MESSAGES = "read-all-direct-messages";
export const DIRECT_MESSAGES_READ = "all-direct-messages-read";
export const UPDATE_GROUPCHAT_LASTMESSAGE = "update-groupchat-lastmessage";
export const READ_GROUP_MESSAGES = "read-all-group-messages";
export const GROUP_MESSAGES_READ = "group-messages-read";
export const UPDATE_GROUPCHAT_LASTMESSAGE_READ_STATUS =
  "update-groupchat-lastmessage-read-status";
export const UNFRIEND_EVENT = "unfriend";
export const UNFRIEND_EVENT_RECEIVE = "unfriend-receive";
