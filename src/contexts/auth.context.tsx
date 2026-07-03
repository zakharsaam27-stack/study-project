import {
  account,
  avatars_bucket_id,
  database_id,
  profiles_table_id,
  storage,
  tablesDB,
} from "@/lib/appwrite";
import React, {createContext, useContext, useEffect, useState} from "react";
import {ID, Models, Permission, Role} from "react-native-appwrite";
import {AvatarAsset} from "./reg.context";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    nickname: string,
    name: string,
    avatarAsset: AvatarAsset | null,
  ) => Promise<void>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const loggedUser = await account.get();
        setUser(loggedUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession(email, password);
    const loggedInUser = await account.get();
    setUser(loggedInUser);
  };
  const register = async (
    email: string,
    password: string,
    nickname: string,
    name: string,
    avatarAsset: AvatarAsset | null,
  ) => {
    const newUser = await account.create({
      userId: ID.unique(),
      email,
      password,
      name,
    });
    await login(email, password);

    let uploadedFile
    if (avatarAsset !== null) {
      uploadedFile = await storage.createFile({
        bucketId: avatars_bucket_id,
        fileId: ID.unique(),
        file: {name: avatarAsset.fileName, type: avatarAsset.mimeType, size: avatarAsset.fileSize, uri: avatarAsset.uri},
        permissions: [
          Permission.update(Role.user(newUser.$id)),
          Permission.delete(Role.user(newUser.$id)),
        ],
      });
    }

    let avatarURL
    if (uploadedFile) {
      avatarURL = storage.getFileViewURL(avatars_bucket_id, uploadedFile.$id).toString()
    }

    await tablesDB.createRow({
      databaseId: database_id,
      tableId: profiles_table_id,
      rowId: newUser.$id,
      data: {
        nickname: nickname,
        name: name,
        avatarURL: avatarURL,
        statusEmoji: "🤔",
        statusText: "Неизвестно",
        statusUpdatedAt: new Date().toISOString(),
      },
      permissions: [
        Permission.update(Role.user(newUser.$id)),
        Permission.delete(Role.user(newUser.$id)),
      ],
    });
  };
  const logOut = async () => {
    await account.deleteSession({sessionId: "current"});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{user, isLoading, login, register, logOut}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
