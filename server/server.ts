import http from "http";
import {Server} from "socket.io";
import {verifyJWT} from "./appwrite";

const server = http.createServer();
const io = new Server(server);
const onlineUsers = new Map();

server.listen(3500);

io.on("connection", async (socket) => {
  console.log(`user ${socket.id} connected`);
  const jwt = socket.handshake.auth.jwt;
  if (!jwt) {
    socket.disconnect();
    return;
  }

  try {
    const user = await verifyJWT(jwt);
    onlineUsers.set(user.$id, socket.id)
    socket.join(`user:${user.$id}`)
    
    
    
    socket.on("disconnect", () => {
      onlineUsers.delete(user.$id)
      console.log(`user ${socket.id} disconnected`);
    });
  } catch (err) {
    socket.disconnect()
  }
});
