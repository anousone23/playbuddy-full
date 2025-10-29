// notifee.ts
import notifee, { AndroidImportance } from "@notifee/react-native";
import { QueryClient } from "@tanstack/react-query";
import { Href, router } from "expo-router";

export async function createDefaultChannel() {
  await notifee.createChannel({
    id: "default",
    name: "Default Channel",
    importance: AndroidImportance.HIGH,
    sound: "default",
  });
}

export function registerNotifeeBackgroundHandler({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    if (type === 1 && pressAction?.id === "friendRequest") {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequest"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      router.push("/chats/connections");
    }

    if (type === 1 && pressAction?.id === "friendRequestAccepted") {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequest"] });
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      router.push("/chats/connections");
    }

    if (type === 1 && pressAction?.id === "groupInvitation") {
      router.push({
        pathname: `groupChats/${notification?.data?.groupId}` as "/",
        params: { invitationId: notification?.data?.invitationId as string },
      });
    }

    if (type === 1 && pressAction?.id === "groupInvitationAccepted") {
      queryClient.invalidateQueries({ queryKey: ["userGroupChats"] });
      queryClient.invalidateQueries({ queryKey: ["groupChat"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      router.push(`/(tabs)/chat` as Href);
    }

    if (type === 1 && pressAction?.id === "directMessage") {
      queryClient.invalidateQueries({ queryKey: ["directChats"] });
      queryClient.invalidateQueries({
        queryKey: ["directMessages", notification?.data?.directChatId],
      });

      router.push(
        `chats/directChat/${notification?.data?.directChatId}` as Href
      );
    }

    if (type === 1 && pressAction?.id === "groupMessage") {
      queryClient.invalidateQueries({ queryKey: ["userGroupChats"] });
      queryClient.invalidateQueries({
        queryKey: ["groupMessages", notification?.data?.groupChatId],
      });

      router.push(`chats/groupChat/${notification?.data?.groupChatId}` as Href);
    }
  });
}
