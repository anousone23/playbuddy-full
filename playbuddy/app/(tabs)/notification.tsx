import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
} from "react-native";

import NotificationItem from "@/components/NotificationItem";
import {
  useGetAllNotifications,
  useMarkNotificationAsRead,
} from "@/libs/React Query/notification";
import { StatusBar } from "expo-status-bar";

export default function NotificationScreen() {
  const [notificationRefreshing] = useState(false);

  const {
    data: notifications,
    isLoading: isGettingNotifications,
    refetch: refetchNotifications,
  } = useGetAllNotifications();
  const { mutateAsync: markNotificationsAsRead } = useMarkNotificationAsRead();

  useFocusEffect(
    useCallback(() => {
      const markAsRead = async () => {
        if (notifications?.some((notification) => !notification.isRead)) {
          try {
            await markNotificationsAsRead();
          } catch (err) {
            console.error("Failed to mark notifications as read:", err);
          }
        }
      };

      markAsRead();
    }, [notifications, markNotificationsAsRead])
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5 gap-8">
      {/* header */}
      <Text className="text-black text-xl font-poppins-bold mt-20">
        Notifications
      </Text>

      {isGettingNotifications ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size={"large"} color={"#0ea5e9"} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <NotificationItem notification={item} />}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center mt-72">
              <Text className="font-poppins-medium text-black text-lg">
                You have no notifications
              </Text>
            </View>
          )}
          contentContainerStyle={{ rowGap: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={notificationRefreshing}
              onRefresh={() => refetchNotifications()}
              colors={["#0ea5e9"]}
            />
          }
        />
      )}

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
