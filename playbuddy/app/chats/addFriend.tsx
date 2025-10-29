import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useGetAllFriendRequests } from "@/libs/React Query/friendRequest";
import { useGetAllUserFriends } from "@/libs/React Query/friendship";
import { useAddFriend, useGetUsersByName } from "@/libs/React Query/user";
import { IUser } from "@/types";
import { AntDesign } from "@expo/vector-icons";
import FastImage from "react-native-fast-image";
import { useAuthUser } from "@/contexts/AuthUserContext";

export default function AddFriendScreen() {
  const [name, setName] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<IUser[] | []>([]);

  const { authUser } = useAuthUser();
  const { mutateAsync: getUsersByName, isPending: isGettingUsers } =
    useGetUsersByName();

  // filter current user out from searchedUsers
  const displayedSearchedUsers = searchedUsers.filter(
    (searchedUser) => searchedUser._id !== authUser?._id
  );

  useEffect(() => {
    async function handleGetUsersByName() {
      if (name.length >= 3) {
        await getUsersByName(name, {
          onSuccess: (data) => {
            setSearchedUsers(data);
          },
        });
      } else {
        setSearchedUsers([]);
      }
    }

    handleGetUsersByName();
  }, [name, getUsersByName]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5">
      <View className="mt-8 flex-row items-center gap-x-4">
        <TextInput
          className="bg-slate-50 border font-poppins-regular border-slate-300 rounded-xl px-4 py-2 flex-1"
          style={{ elevation: 5 }}
          placeholder="Enter a name to add friend"
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <View className="absolute top-[10px] right-4">
          <AntDesign name="search1" size={20} color="#17255490" />
        </View>
      </View>

      {isGettingUsers ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size={"large"} color="#0ea5e9" />
        </View>
      ) : (
        <FlatList
          ListEmptyComponent={() => {
            const usersNotFound =
              name.length >= 3 && searchedUsers.length === 0;
            return usersNotFound ? (
              <View className="flex-1 items-center justify-center mt-16">
                <Text className="font-poppins-medium text-black">
                  There is no user with this name
                </Text>
              </View>
            ) : null;
          }}
          className="mt-4"
          keyExtractor={(item) => item._id}
          data={displayedSearchedUsers}
          renderItem={({ item }) => <RenderItem user={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function RenderItem({ user }: { user: IUser }) {
  const { mutateAsync: addFriend, isPending: isAddingFriend } = useAddFriend();
  const { data: friendRequests } = useGetAllFriendRequests({
    status: "pending",
    type: "sent",
  });
  const { data: friendships } = useGetAllUserFriends();

  const isAlreadySentRequest = friendRequests?.some(
    (request) => (request.receiver as IUser)._id === user._id
  );
  const isAlreadyFriend = friendships?.some(
    (friend) => friend.user1._id === user._id || friend.user2._id === user._id
  );

  async function handleAddFriend(userId: string) {
    await addFriend(userId);
  }

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-x-4 py-4">
        <View className="w-14 h-14 rounded-full ">
          <FastImage
            source={{ uri: user.image }}
            resizeMode={FastImage.resizeMode.cover}
            style={{ width: "100%", height: "100%", borderRadius: 999 }}
          />
        </View>
        <Text className="font-poppins-medium text-black">{user.name}</Text>
      </View>

      {isAlreadyFriend ? null : isAlreadySentRequest ? (
        <TouchableOpacity
          className={`bg-slate-100 border border-slate-300 px-4 py-1 rounded-lg`}
          disabled={true}
        >
          <Text className="font-poppins-medium text-sm text-black">
            Request sent
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className={`bg-primary px-4 py-1 rounded-lg ${
            isAddingFriend && "bg-slate-400"
          }`}
          onPress={() => handleAddFriend(user._id)}
          disabled={false}
        >
          <Text className="font-poppins-medium text-sm text-white">
            Add friend
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
