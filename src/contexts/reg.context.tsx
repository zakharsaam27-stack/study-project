import React, {createContext, useContext, useState} from "react";

export type AvatarAsset = {
  uri: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

type RegContextType = {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  nickname: string;
  setNickname: (v: string) => void;
  avatarAsset: AvatarAsset | null;
  setAvatarAsset: (v: AvatarAsset | null) => void;
};

const RegContext = createContext<RegContextType | undefined>(undefined);

export function RegProvider({children}: {children: React.ReactNode}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatarAsset, setAvatarAsset] = useState<AvatarAsset | null>(null);

  return (
    <RegContext.Provider
      value={{
        email,
        setEmail,
        password,
        setPassword,
        name,
        setName,
        nickname,
        setNickname,
        avatarAsset,
        setAvatarAsset,
      }}
    >
      {children}
    </RegContext.Provider>
  );
}

export function useReg() {
  const context = useContext(RegContext);
  if (!context) throw new Error("useReg must be used within a regProvider");
  return context;
}
