import {socket} from "@/lib/socket";
import {Models} from "node-appwrite";
import React, {createContext, useContext, useEffect, useState} from "react";

type SocketContextType = {
  onlineFriends: Set<string>;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({children}: {children: React.ReactNode}) {
  const [onlineFriends, setOnlineFriends] = useState<Set<string>>(new Set());

  useEffect(() => {
    socket.emit("getOnlineFriends");

    socket.on("friend.online", handleFriendOnline);
    socket.on("friend.offline", handleFriendOffline);
    socket.on("onlineFriends", handleOnlineFriends);

    return () => {
      socket.off("friend.online", handleFriendOnline);
      socket.off("friend.offline", handleFriendOffline);
      socket.off("onlineFriends", handleOnlineFriends);
    };
  }, []);

  const handleOnlineFriends = (data: string[]) => {
    setOnlineFriends(new Set(data));
  };
  const handleFriendOnline = (userId: string) => {
    setOnlineFriends(prev => {
      const next = new Set(prev)
      next.add(userId)
      return next
    })
  };
  const handleFriendOffline = (userId: string) => {
    setOnlineFriends(prev => {
      const next = new Set(prev)
      next.delete(userId)
      return next
    })
  };

  return (
    <SocketContext.Provider value={{onlineFriends}}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within an SocketProvider");
  return context;
}
