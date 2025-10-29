// firebase.ts
import images from "@/constants/images";
import notifee from "@notifee/react-native";
import { getMessaging } from "@react-native-firebase/messaging";

const messaging = getMessaging();

export async function registerFirebaseBackgroundHandler() {
  messaging.setBackgroundMessageHandler(async (message) => {
    if (message.data?.type === "FriendRequest") {
      await notifee.displayNotification({
        title: `${message.data.username} send a friend request to you.`,
        android: {
          channelId: "default",
          largeIcon: `${message.data.userImage}`,
          pressAction: {
            id: "friendRequest",
            launchActivity: "default",
          },
          showTimestamp: true,
          color: "#ef4444",
        },
      });
    }

    if (message.data?.type === "FriendRequestAccepted") {
      await notifee.displayNotification({
        title: `${message.data.username} accept your friend request.`,
        android: {
          channelId: "default",
          largeIcon: `${message.data.userImage}`,
          pressAction: {
            id: "friendRequestAccepted",
            launchActivity: "default",
          },
          showTimestamp: true,
          color: "#ef4444",
        },
      });
    }

    if (message.data?.type === "GroupInvitation") {
      await notifee.displayNotification({
        title: `${message.data.username} invite you to join ${message.data.groupName}.`,
        android: {
          channelId: "default",
          largeIcon:
            `${message.data.groupImage}` || images.groupChatPlaceHolder,
          pressAction: {
            id: "groupInvitation",
            launchActivity: "default",
          },
          showTimestamp: true,
          color: "#ef4444",
        },
        data: {
          groupId: message.data.groupId,
          invitationId: message.data.invitationId,
        },
      });
    }

    if (message.data?.type === "GroupInvitationAccepted") {
      await notifee.displayNotification({
        title: `${message.data.username} accept your group invitation.`,
        android: {
          channelId: "default",
          largeIcon:
            `${message.data.groupImage}` || images.groupChatPlaceHolder,
          pressAction: {
            id: "groupInvitationAccepted",
            launchActivity: "default",
          },
          showTimestamp: true,
          color: "#ef4444",
        },
      });
    }

    if (message.data?.type === "DirectMessage") {
      await notifee.displayNotification({
        title: message.data.username as string,
        body: message.data.text
          ? (message.data.text as string)
          : "send a photo",
        android: {
          channelId: "default",
          largeIcon: message.data.userImage,
          pressAction: {
            id: "directMessage",
            launchActivity: "default",
          },
          showTimestamp: true,
          color: "#ef4444",
        },
        data: {
          directChatId: message.data.directChatId,
        },
      });
    }

    if (message.data?.type === "GroupMessage") {
      await notifee.displayNotification({
        title: message.data.username as string,
        body: message.data.text
          ? (message.data.text as string)
          : "send a photo",
        android: {
          channelId: "default",
          largeIcon: message.data.userImage,
          pressAction: {
            id: "groupMessage",
            launchActivity: "default",
          },
          showTimestamp: true,
          color: "#ef4444",
        },
        data: {
          groupChatId: message.data.groupChatId,
        },
      });
    }
  });
}
