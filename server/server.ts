// TO DO: STABLE CONNECTION FROM MULTIPLE DEVICES,
// LAST SEEN

import http from "http";
import {Server} from "socket.io";
import {verifyJWT} from "./appwrite";
import {
  database_id,
  friendship_table_id,
  profiles_table_id,
  tablesDB,
} from "./appwrite";
import {Query} from "node-appwrite";

const server = http.createServer();
const io = new Server(server);
const onlineUsers = new Map<string, string>();

server.listen(3500);

io.on("connection", async (socket) => {
  const jwt = socket.handshake.auth.jwt;
  if (!jwt) {
    socket.disconnect();
    return;
  }

  try {
    // connect
    const user = await verifyJWT(jwt);

console.log("verified", user.$id);

onlineUsers.set(user.$id, socket.id);

console.log("onlineUsers", [...onlineUsers.keys()]);

    const fetchFriendsProfiles = async () => {
      const fetchFriendListResult = await tablesDB.listRows({
        databaseId: database_id,
        tableId: friendship_table_id,
        queries: [
          Query.equal("status", "accepted"),
          Query.equal("requesterId", user.$id),
        ],
      });

      console.log(fetchFriendListResult.rows);

      const profiles = await Promise.all(
        fetchFriendListResult.rows.map((friend) =>
          tablesDB.getRow({
            databaseId: database_id,
            tableId: profiles_table_id,
            rowId: friend.addresseeId,
          }),
        ),
      );
      return profiles;
    };

    onlineUsers.set(user.$id, socket.id);
    socket.join(`user:${user.$id}`);

    const sendOnlineFriends = async () => {
      const profiles = await fetchFriendsProfiles();
      const onlineFriends: string[] = [];
      for (const profile of profiles) {
        if (onlineUsers.has(profile.$id)) {
          onlineFriends.push(profile.$id);
        }
      }
      console.log("sending", onlineFriends);
      socket.emit("onlineFriends", onlineFriends);
    };
    const profiles = await fetchFriendsProfiles();
    
    console.log("profiles", profiles.map(p => p.$id));
console.log("onlineUsers", [...onlineUsers.keys()]);
    
    for (const profile of profiles) {
      
console.log(
  profile.$id,
  onlineUsers.has(profile.$id)
);

      if (onlineUsers.has(profile.$id)) {
        io.to(`user:${profile.$id}`).emit("friend.online", user.$id);
      }
    }
    await sendOnlineFriends();
    socket.on("getOnlineFriends", sendOnlineFriends);

    // disconnect
    socket.on("disconnect", async () => {
      const profiles = await fetchFriendsProfiles();
      onlineUsers.delete(user.$id);
      for (const profile of profiles) {
        if (onlineUsers.has(profile.$id)) {
          io.to(`user:${profile.$id}`).emit("friend.offline", user.$id);
        }
      }
    });
  } catch (err) {
    socket.disconnect();
  }
});
