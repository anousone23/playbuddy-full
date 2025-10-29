import { useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/shared/CustomButton";
import SkillSelection from "@/components/SkillSelection";
import SportTypeSelection from "@/components/SportTypeSelection";
import { useCreateGroupChat } from "@/libs/React Query/groupChat";
import { useGetLocationSportTypes } from "@/libs/React Query/location";
import { ISportType } from "@/types";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";

export default function CreateGroupChatScreen() {
  const { locationId } = useLocalSearchParams();

  const descriptionInputRef = useRef<TextInput>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    maxMembers: 0,
  });
  const [selectedSportType, setSelectedSportType] = useState<ISportType | null>(
    null
  );
  const [selectedSkill, setSelectedSkill] = useState("");

  const { data: locationSportTypes, isLoading: isGettingLocationSportTypes } =
    useGetLocationSportTypes(locationId as string);
  const { mutateAsync: createGroupChat, isPending: isCreatingGroupChat } =
    useCreateGroupChat({ setForm, setSelectedSportType, setSelectedSkill });

  const handleCreateGroupChat = async () => {
    const sportTypeId = selectedSportType?._id;

    if (!form.name || !sportTypeId || !selectedSkill)
      return toast.error("Please fill in all inputs", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });

    if (form.maxMembers < 2 || form.maxMembers > 30)
      return toast.error("Max members must be between 2-30 people", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });

    if (
      !["casual", "beginner", "intermediate", "advanced"].includes(
        selectedSkill
      )
    )
      return toast.error("Invalid preferred skill", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });

    await createGroupChat({
      locationId: locationId as string,
      groupData: {
        name: form.name,
        description: form.description,
        maxMembers: form.maxMembers,
        sportType: sportTypeId!,
        preferredSkill: selectedSkill,
      },
    });
  };

  if (isGettingLocationSportTypes)
    return (
      <SafeAreaView className="items-center justify-center">
        <ActivityIndicator size={"large"} color="#0ea5e9" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5">
      <ScrollView className="" nestedScrollEnabled={true}>
        <View className="gap-y-8">
          {/* group name */}
          <View className={`flex flex-col gap-2`}>
            <Text className={`font-poppins-medium text-black`}>Group name</Text>

            <View className="relative">
              <TextInput
                value={form.name}
                placeholder="Enter your group name"
                placeholderTextColor={"#08334480"}
                onChangeText={(value) => setForm({ ...form, name: value })}
                className={`bg-slate-100 font-poppins-regular text-black rounded-md px-2 py-2`}
                style={{ borderWidth: 1, borderColor: "#cbd5e1" }}
                returnKeyType="next"
                onSubmitEditing={() => descriptionInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
          </View>

          {/* group description */}
          <View className="gap-y-2">
            <Text className={`font-poppins-medium text-black`}>
              Group description (Optional)
            </Text>

            <TextInput
              style={{ textAlignVertical: "top" }}
              className="bg-slate-100 font-poppins-regular border border-slate-300  text-black rounded-md px-2 py-4 pb-8"
              placeholder="Enter your group chat description"
              placeholderTextColor={"#08334480"}
              multiline={true}
              numberOfLines={10}
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              maxLength={300}
              ref={descriptionInputRef}
              returnKeyType="next"
            />

            <View className="absolute right-2 bottom-2">
              <Text className="font-poppins-regular text-sm text-black opacity-70">
                {form.description.length}/300
              </Text>
            </View>
          </View>

          {/* sport type */}
          <SportTypeSelection
            sportTypes={locationSportTypes!.sort((a, b) =>
              a.name.localeCompare(b.name)
            )}
            selectedSportType={selectedSportType}
            setSelectedSportType={setSelectedSportType}
          />

          {/* preferred skill */}
          <SkillSelection
            selectedSkill={selectedSkill}
            setSelectedSkill={setSelectedSkill}
          />

          {/* max members */}
          <View className={`flex flex-col gap-2`}>
            <Text className={`font-poppins-medium text-black `}>
              Max member (2-30)
            </Text>

            <View className="relative">
              <TextInput
                keyboardType="numeric"
                value={form.maxMembers.toString()}
                placeholder="Enter your group max members"
                placeholderTextColor={"#08334480"}
                onChangeText={(value) =>
                  setForm({ ...form, maxMembers: Number(value) })
                }
                className={`bg-slate-100 font-poppins-regular  text-black rounded-md px-2 py-2`}
                style={{ borderWidth: 1, borderColor: "#cbd5e1" }}
                returnKeyType="go"
                onSubmitEditing={handleCreateGroupChat}
              />
            </View>
          </View>
        </View>

        <CustomButton
          isLoading={isCreatingGroupChat}
          disabled={isCreatingGroupChat}
          title="Create"
          onPress={handleCreateGroupChat}
          containerStyles="mb-12 mt-8"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
