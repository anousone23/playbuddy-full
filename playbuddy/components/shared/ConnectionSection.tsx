import {
  IFriendship,
  IFriendRequest,
  IGroupInvitation,
  UnfriendDataType,
} from "@/types";
import { EvilIcons } from "@expo/vector-icons";
import React, { Dispatch, SetStateAction } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Collapsible from "react-native-collapsible";
import FriendRequestItem from "../FriendRequestItem";
import FriendItem from "../FriendItem";
import GroupInvitationItem from "../GroupInvitationItem";

type SectionProps = {
  type: string;
  title: string;
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
  data: IFriendRequest[] | IFriendship[] | IGroupInvitation[] | any;
  setUnfriendData?: Dispatch<SetStateAction<UnfriendDataType>>;
  refreshing: boolean;
  onRefresh: () => any;
};

export default function ConnectionSection({
  type,
  title,
  isCollapsed,
  setIsCollapsed,
  data,
  setUnfriendData,
  refreshing,
  onRefresh,
}: SectionProps) {
  return (
    <View className={`border-b border-b-slate-200 py-4`}>
      {/* Section Header */}
      <View className="flex-row items-center justify-between">
        <Text className="font-poppins-semiBold text-black">{title}</Text>
        <TouchableOpacity
          className="items-center justify-center"
          onPress={() => {
            if (data.length === 0) return;

            setIsCollapsed(!isCollapsed);
          }}
        >
          <EvilIcons name="chevron-down" size={28} color="#172554" />
        </TouchableOpacity>
      </View>

      {/* Collapsible Content */}
      <Collapsible collapsed={isCollapsed}>
        {type === "friendRequest" && (
          <FlatList
            data={data}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              return <FriendRequestItem friendRequest={item} />;
            }}
            ItemSeparatorComponent={() => (
              <View className="h-[1px] bg-slate-100"></View>
            )}
            style={{ maxHeight: 400 }}
            // refreshControl={
            //   <RefreshControl
            //     refreshing={refreshing}
            //     onRefresh={onRefresh}
            //     colors={["#0ea5e9"]}
            //   />
            // }
          />
        )}

        {type === "friend" && (
          <FlatList
            data={data}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              return (
                <FriendItem friend={item} setUnfriendData={setUnfriendData} />
              );
            }}
            ItemSeparatorComponent={() => (
              <View className="h-[1px] bg-slate-100"></View>
            )}
            style={{ maxHeight: 400 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#0ea5e9"]}
              />
            }
          />
        )}

        {type === "groupInvitation" && (
          <FlatList
            data={data}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              return <GroupInvitationItem invitation={item} />;
            }}
            ItemSeparatorComponent={() => (
              <View className="h-[1px] bg-slate-100"></View>
            )}
            style={{ maxHeight: 400 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#0ea5e9"]}
              />
            }
          />
        )}
      </Collapsible>
    </View>
  );
}
