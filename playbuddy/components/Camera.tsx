import { FontAwesome6 } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import { CameraType, CameraView } from "expo-camera";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";

import { CLOUDINARY_DIRECT_MESSAGE_FOLDER } from "@/constants";
import { useSendDirectMessage } from "@/libs/React Query/directMessage";
import { useUploadImage } from "@/libs/React Query/user";
import { IDirectChat, IGroupChat, IUser, UploadImageType } from "@/types";
import { compressImage } from "@/utils/helper";
import { useSendGroupMessage } from "@/libs/React Query/groupMessage";
import { useAuthUser } from "@/contexts/AuthUserContext";

type CameraPropsType = {
  type: string;
  setShowCamera: Dispatch<SetStateAction<boolean>>;
  directChat?: IDirectChat | undefined;
  groupChat?: IGroupChat | undefined;
  scrollToEnd: () => void;
};

export default function Camera({
  type,
  setShowCamera,
  directChat,
  groupChat,
  scrollToEnd,
}: CameraPropsType) {
  const ref = useRef<CameraView>(null);
  const [image, setImage] = useState<UploadImageType | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");

  const { authUser } = useAuthUser();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();
  const { mutateAsync: sendDirectMessage } = useSendDirectMessage();
  const { mutateAsync: sendGroupMessage } = useSendGroupMessage();

  async function takePicture() {
    const photo = await ref.current?.takePictureAsync({ imageType: "jpg" });

    if (photo) {
      const name = photo?.uri.split("/").pop();

      setImage({ uri: photo.uri, name: name!, type: "image/jpeg" });
    }
  }

  function toggleFacing() {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  }

  async function handleSendDirectMessageImage() {
    if (!image?.uri) return;

    const receiverId =
      (directChat?.user1 as IUser)._id === authUser?._id
        ? (directChat?.user2 as IUser)._id
        : (directChat?.user1 as IUser)._id;

    // upload image
    let secureUrl;

    if (image) {
      const compressedImage = await compressImage(image.uri);

      const source = {
        uri: compressedImage,
        name: image.name,
        type: "image/jpeg",
      };

      secureUrl = await new Promise<string>((resolve, reject) => {
        uploadImage(
          {
            image: source,
            folder: `${CLOUDINARY_DIRECT_MESSAGE_FOLDER}/${directChat?._id}`,
          },
          {
            onSuccess: (data) => {
              resolve(data);
              setShowCamera(false);
              setImage(null);
            },
            onError: (err) => reject(err),
          }
        );
      });
    }

    const data = {
      receiverId,
      image: secureUrl,
    };

    await sendDirectMessage(
      { directChatId: directChat?._id as string, data },
      {
        onSuccess: () => {
          scrollToEnd();
        },
      }
    );
  }

  async function handleSendGroupMessageImage() {
    if (!image?.uri) return;

    // upload image
    let secureUrl;

    if (image) {
      const compressedImage = await compressImage(image.uri);

      const source = {
        uri: compressedImage,
        name: image.name,
        type: "image/jpeg",
      };

      secureUrl = await new Promise<string>((resolve, reject) => {
        uploadImage(
          {
            image: source,
            folder: `${CLOUDINARY_DIRECT_MESSAGE_FOLDER}/${directChat?._id}`,
          },
          {
            onSuccess: (data) => {
              resolve(data);
              setShowCamera(false);
              setImage(null);
            },
            onError: (err) => reject(err),
          }
        );
      });
    }

    const data = {
      image: secureUrl,
    };

    await sendGroupMessage(
      { groupChatId: groupChat?._id as string, data },
      {
        onSuccess: () => {
          scrollToEnd();
        },
      }
    );
  }

  function renderPicture() {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50">
        {image?.uri && (
          <Image
            source={{ uri: image?.uri }}
            resizeMode="contain"
            style={{
              height: "100%",
              aspectRatio: 1,
            }}
          />
        )}

        <View className="absolute bottom-8 flex-row items-center justify-between w-full px-8">
          <TouchableOpacity
            onPress={() => {
              setImage(null);
            }}
            className="bg-slate-100 border border-slate-300 px-4 py-2 rounded-md "
          >
            <Text className="font-poppins-medium text-black">
              Take another picture
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={
              type === "directChat"
                ? handleSendDirectMessageImage
                : handleSendGroupMessageImage
            }
            className="bg-primary px-4 py-2 rounded-md "
            disabled={isUploading}
          >
            {isUploading ? (
              <View className="px-4">
                <ActivityIndicator size={"small"} color="#f0f9ff" />
              </View>
            ) : (
              <Text className="font-poppins-medium text-white">Confirm</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  function renderCamera() {
    return (
      <CameraView
        style={styles.camera}
        ref={ref}
        mode={"picture"}
        facing={facing}
        responsiveOrientationWhenOrientationLocked
      >
        <View className="items-center flex-row absolute bottom-8 justify-between w-full px-8">
          <Pressable
            onPress={() => {
              setShowCamera(false);
            }}
          >
            <Entypo name="cross" size={48} color="white" />
          </Pressable>

          <TouchableOpacity onPress={takePicture}>
            <View className="w-24 h-24 bg-white rounded-full items-center justify-center border border-black">
              <View className="w-20 h-20 border-2 border-black rounded-full"></View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleFacing}>
            <FontAwesome6 name="rotate-left" size={32} color="#f0f9ff" />
          </TouchableOpacity>
        </View>
      </CameraView>
    );
  }

  return (
    <View style={styles.container}>
      {image?.uri ? renderPicture() : renderCamera()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
});
