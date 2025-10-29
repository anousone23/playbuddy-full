import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AccontInformationItem from "@/components/AccontInformationItem";
import EditModal from "@/components/shared/EditModal";
import { CLOUDINARY_PROFILE_IMAGE_FOLDER } from "@/constants";
import { useLogout } from "@/libs/React Query/auth";
import {
  useDeactivateAccount,
  useUpdateProfile,
  useUploadImage,
} from "@/libs/React Query/user";
import { compressImage, openImagePicker } from "@/utils/helper";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { useQueryClient } from "@tanstack/react-query";
import FastImage from "react-native-fast-image";
import { Modal } from "react-native-paper";
import { useAuthUser } from "@/contexts/AuthUserContext";

export default function AccountScreen() {
  const queryClient = useQueryClient();

  const [image, setImage] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState({
    displayName: false,
    password: false,
  });
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const { authUser } = useAuthUser();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useUpdateProfile();
  const { mutateAsync: deactivateAccount, isPending: isDeactivatingAccount } =
    useDeactivateAccount();

  const { mutateAsync: uploadProfileImage, isPending: isUploadingImage } =
    useUploadImage();

  async function handleUpdateName() {
    const name = /^(?!.*\s{2,})[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/;

    if (!accountForm.name)
      return toast.error("Display name is required", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });

    if (accountForm.name.length < 3) {
      return toast.error("Display name must be at least 3 characters long", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
    }

    if (!name.test(accountForm.name)) {
      return toast.error(
        "Invalid display name, only letter and number are allowed",
        {
          position: ToastPosition.BOTTOM,
          duration: 2000,
        }
      );
    }

    await updateProfile(
      { name: accountForm.name },
      {
        onSuccess: () => {
          setEditModalVisible({ ...editModalVisible, displayName: false });
        },
      }
    );
  }

  async function handleUpdatePassword() {
    if (!accountForm.newPassword || !accountForm.confirmNewPassword)
      return toast.error("Password is required", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });

    if (accountForm.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters long", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
    }

    if (accountForm.newPassword !== accountForm.confirmNewPassword) {
      return toast.error("Passwords do not match", {
        position: ToastPosition.BOTTOM,
        duration: 2000,
      });
    }

    await updateProfile(
      {
        newPassword: accountForm.newPassword,
        confirmNewPassword: accountForm.confirmNewPassword,
      },
      {
        onSuccess: () => {
          setEditModalVisible({ ...editModalVisible, password: false });
        },
      }
    );
  }

  async function handleDeactivateAccount() {
    await deactivateAccount();
  }

  async function handleUpadteProfileImage() {
    const result = await openImagePicker();

    if (!result || result.canceled) return;

    const compressedImage = await compressImage(result.assets[0].uri);

    setImage(compressedImage);

    const source = {
      uri: compressedImage,
      type: "image/jpeg",
      name: result.assets[0].fileName!,
    };

    await uploadProfileImage(
      { image: source, folder: CLOUDINARY_PROFILE_IMAGE_FOLDER },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ["authUser"] });

          updateProfile({ image: data });
        },
      }
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5">
      <ScrollView className="mt-16" contentContainerStyle={{ rowGap: 20 }}>
        <View className="items-center justify-center relative">
          <View className="flex-1 items-center justify-center">
            {isUploadingImage || isUpdatingProfile ? (
              <View
                className={`w-40 h-40 rounded-full items-center justify-center border border-slate-300`}
              >
                <ActivityIndicator size={"small"} color="#0ea5e9" />
              </View>
            ) : (
              // profile image
              <TouchableOpacity
                className={`w-40 h-40 rounded-full items-center justify-center`}
              >
                <FastImage
                  source={{
                    uri: image || authUser?.image,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                  style={{ width: "100%", height: "100%", borderRadius: 999 }}
                />
              </TouchableOpacity>
            )}

            {/* edit profile image button */}
            <TouchableOpacity
              className="absolute right-2 bottom-0 bg-primary p-3 rounded-full"
              onPress={handleUpadteProfileImage}
              style={{ elevation: 3 }}
            >
              <Feather name="camera" size={20} color="#f0f9ff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-[1px] bg-slate-200 " />

        <AccontInformationItem
          type="text"
          label="Name"
          value={authUser?.name!}
          onOpenEditModal={() =>
            setEditModalVisible({ ...editModalVisible, displayName: true })
          }
        />

        <AccontInformationItem label="Email" value={authUser?.email!} />

        <AccontInformationItem
          type="password"
          label="Password"
          value="********"
          onOpenEditModal={() =>
            setEditModalVisible({ ...editModalVisible, password: true })
          }
        />

        <View
          className={`bg-slate-100 px-2 py-2 rounded-lg `}
          style={{ elevation: 3 }}
        >
          <TouchableOpacity
            className="flex-row items-center gap-x-2"
            onPress={() => setDeleteAccountModal(true)}
          >
            <MaterialIcons name="delete-outline" size={24} color="#ef4444" />
            <Text className="font-poppins-semiBold text-red-500">
              Deactivate account
            </Text>
          </TouchableOpacity>
        </View>

        <View
          className={`bg-slate-100 px-2 py-2 rounded-lg ${
            isLoggingOut && "bg-slate-300"
          }`}
          style={{ elevation: 3 }}
        >
          <TouchableOpacity
            className="flex-row items-center gap-x-2"
            onPress={() => setLogoutModal(true)}
          >
            <MaterialIcons name="logout" size={24} color="#ef4444" />
            <Text className="font-poppins-semiBold text-red-500">Logout</Text>
          </TouchableOpacity>
        </View>

        <View className="h-[1px]"></View>
      </ScrollView>

      {/* edit display name modal */}
      <EditModal
        type="text"
        label="Edit name"
        placeholder="Enter your name"
        visible={editModalVisible.displayName}
        onDismiss={() =>
          setEditModalVisible({ ...editModalVisible, displayName: false })
        }
        value={accountForm.name}
        onChangeText={(value) =>
          setAccountForm({ ...accountForm, name: value })
        }
        onButtonPress={handleUpdateName}
        isUpdating={isUpdatingProfile}
      />

      {/* edit password modal */}
      <EditModal
        type="password"
        label="New password"
        secondLabel="Confirm password"
        placeholder="Enter your password"
        secondPlaceholder="Enter your password"
        visible={editModalVisible.password}
        onDismiss={() =>
          setEditModalVisible({ ...editModalVisible, password: false })
        }
        value={accountForm.newPassword}
        secondValue={accountForm.confirmNewPassword}
        onChangeText={(value) =>
          setAccountForm({ ...accountForm, newPassword: value })
        }
        onChangeSecondText={(value) =>
          setAccountForm({ ...accountForm, confirmNewPassword: value })
        }
        onButtonPress={handleUpdatePassword}
        onSubmitEditing={handleUpdatePassword}
      />

      {/* delete account modal */}
      <Modal
        visible={deleteAccountModal}
        onDismiss={() => setDeleteAccountModal(false)}
      >
        <View className="bg-slate-50 px-4 py-8 mx-4 rounded-md gap-y-8">
          <View className="gap-y-4">
            <Text className="text-red-500 font-poppins-bold text-center text-lg">
              Confirm deactivate account
            </Text>
            <Text className="text-black font-poppins-regular text-center">
              You won’t be able to access the application and your account will
              be deleted within 7 days
            </Text>
          </View>

          <View className="flex-row justify-evenly items-center">
            <TouchableOpacity
              className="bg-red-500 px-4 py-2 rounded-lg"
              onPress={handleDeactivateAccount}
              disabled={isDeactivatingAccount}
            >
              {isDeactivatingAccount ? (
                <ActivityIndicator color={"#f0f9ff"} className="px-6" />
              ) : (
                <Text className="text-white font-poppins-regular text-center">
                  Confirm
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-slate-100 border border-slate-300 px-4 py-2 rounded-lg "
              onPress={() => {
                setDeleteAccountModal(false);
              }}
              disabled={isDeactivatingAccount}
            >
              <Text className="text-black font-poppins-regular text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* logout modal */}
      <Modal visible={logoutModal} onDismiss={() => setLogoutModal(false)}>
        <View className="bg-slate-50 px-4 py-8 mx-4 rounded-md gap-y-8">
          <View className="gap-y-4">
            <Text className="text-red-500 font-poppins-bold text-center text-lg">
              Confirm logout
            </Text>
            <Text className="text-black font-poppins-regular text-center">
              This action will log you out of your account
            </Text>
          </View>

          <View className="flex-row justify-evenly items-center">
            <TouchableOpacity
              className="bg-red-500 px-4 py-2 rounded-lg"
              onPress={async () => {
                await logout();
              }}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <View className="w-20">
                  <ActivityIndicator size={"small"} color={"#f0f9ff"} />
                </View>
              ) : (
                <Text className="text-white font-poppins-regular text-center">
                  Confirm
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-slate-100 border border-slate-300 px-4 py-2 rounded-lg"
              onPress={() => {
                setLogoutModal(false);
              }}
              disabled={isLoggingOut}
            >
              <Text className="text-black font-poppins-regular text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
