import {account} from "@/lib/appwrite";
import React, {createContext, useContext, useEffect, useState} from "react";
import {ID, Models} from "react-native-appwrite";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
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
        setIsLoading(false)
      }
    }
    loadUser()
  }, []);

  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession(email, password)
    const loggedInUser = await account.get()
    setUser(loggedInUser)
  }
  const register = async (email: string, password: string, name: string) => {
    await account.create({ userId: ID.unique(), email, password, name})
    await login(email, password)
  }
  const logOut = async () => {
    await account.deleteSession({sessionId: 'current'})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{user, isLoading, login, register, logOut}}>
        {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within an AuthProvider")
    return context
}