import { getAuthUser } from "@/api/auth";
import axiosInstance from "@/libs/axios";
import { IUser } from "@/types";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";

type AuthUserContextType = {
  authUser: IUser | null;
  setAuthUser: Dispatch<SetStateAction<IUser | null>>;
  isLoadingAuthUser: boolean;
  setIsLoadingAuthUser: Dispatch<SetStateAction<boolean>>;
};

const AuthUserContext = createContext<AuthUserContextType | undefined>(
  undefined
);

export function AuthUserProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<IUser | null>(null);
  const [isLoadingAuthUser, setIsLoadingAuthUser] = useState(false);

  useEffect(() => {
    async function getAuthUser() {
      const jwtToken = await SecureStore.getItemAsync("jwt");

      if (!jwtToken) {
        return;
      }

      const res = await axiosInstance.get("/api/auth/user");

      if (res.data.data) {
        setAuthUser(res.data.data);
      }
    }

    getAuthUser();
  }, []);

  return (
    <AuthUserContext.Provider
      value={{
        authUser,
        setAuthUser,
        isLoadingAuthUser,
        setIsLoadingAuthUser,
      }}
    >
      {children}
    </AuthUserContext.Provider>
  );
}

export const useAuthUser = () => {
  const context = useContext(AuthUserContext);

  if (!context)
    throw new Error("useAuthUser must be used within AuthUserProvider");
  return context;
};
