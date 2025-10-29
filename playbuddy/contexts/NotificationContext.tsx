import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { PermissionsAndroid } from "react-native";
import { getMessaging } from "@react-native-firebase/messaging";

type NotificationContextType = {
  token: string | null;
  setToken: Dispatch<SetStateAction<string | null>>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [token, setToken] = useState<string | null>(null);
  const messaging = getMessaging();

  useEffect(() => {
    async function requestPermissionAndGetToken() {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          const token = await messaging.getToken();

          setToken(token);
        } else {
          console.log("Notification Permission denied");
        }
      } catch (error) {
        console.error(
          "Error in requesting permission or getting token",
          (error as Error).message || ""
        );
      }
    }

    requestPermissionAndGetToken();
  }, [messaging]); // 🔥 only run once

  return (
    <NotificationContext.Provider value={{ token, setToken }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context)
    throw new Error("useOnlineUsers must be used within NotificationProvider");
  return context;
};
