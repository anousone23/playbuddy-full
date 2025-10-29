import * as Location from "expo-location";
import { LocationObject } from "expo-location";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

type UserLocationContextType = {
  userLocation: LocationObject | null;
  setUserLocation: Dispatch<SetStateAction<LocationObject | null>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  errorLocation: string | null;
  setErrorLocation: Dispatch<SetStateAction<string | null>>;
};

const UserLocationContext = createContext<UserLocationContextType | undefined>(
  undefined
);

export const UserLocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userLocation, setUserLocation] = useState<LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorLocation, setErrorLocation] = useState<string | null>(null);

  useEffect(() => {
    async function getUserLocation() {
      try {
        setIsLoading(true);

        // request for location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Permission to access location was denied.");
        }
        const location = await Location.getCurrentPositionAsync({});

        setUserLocation(location);
      } catch (error: any) {
        console.log(
          "Error in getUserLocation in UserLocationContext",
          error.message
        );
        setErrorLocation(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    getUserLocation();
  }, []);

  return (
    <UserLocationContext.Provider
      value={{
        userLocation,
        isLoading,
        errorLocation,
        setUserLocation,
        setIsLoading,
        setErrorLocation,
      }}
    >
      {children}
    </UserLocationContext.Provider>
  );
};

export const useUserLocation = () => {
  const context = useContext(UserLocationContext);

  if (!context)
    throw new Error("useOnlineUsers must be used within UserLocationProvider");
  return context;
};
