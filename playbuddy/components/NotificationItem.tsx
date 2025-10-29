import React from "react";

import { INotification } from "@/types";
import FriendRequestNotificationItem from "./FriendRequestNotificationItem";
import FriendRequestAcceptedNotificationItem from "./FriendRequestAcceptedNotificationItem";
import GroupInvitationNotificationItem from "./GroupInvitationNotificationItem";
import GroupInvitationAcceptedNotificationItem from "./GroupInvitationAcceptedNotificationItem";
import DirectMessageNotificationItem from "./DirectMessageNotificationItem";
import GroupMessageNotificationItem from "./GroupMessageNotificationItem";
import KickFromGroupChatNotificationItem from "./KickFromGroupChatNotificationItem";
import GroupChatDeletetionNotificationItem from "./GroupChatDeletetionNotificationItem";

export default function NotificationItem({
  notification,
}: {
  notification: INotification;
}) {
  const { type } = notification;
  let content: any;

  switch (type) {
    case "FriendRequest":
      content = <FriendRequestNotificationItem notification={notification} />;
      break;
    case "FriendRequestAccepted":
      content = (
        <FriendRequestAcceptedNotificationItem notification={notification} />
      );
      break;
    case "GroupInvitation":
      content = <GroupInvitationNotificationItem notification={notification} />;
      break;
    case "GroupInvitationAccepted":
      content = (
        <GroupInvitationAcceptedNotificationItem notification={notification} />
      );
      break;
    case "DirectMessage":
      content = <DirectMessageNotificationItem notification={notification} />;
      break;
    case "GroupMessage":
      content = <GroupMessageNotificationItem notification={notification} />;
      break;
    case "KickFromGroupChat":
      content = (
        <KickFromGroupChatNotificationItem notification={notification} />
      );
      break;
    case "GroupChatDeletion":
      content = (
        <GroupChatDeletetionNotificationItem notification={notification} />
      );
      break;
    default:
      content = null;
  }
  return content;
}
