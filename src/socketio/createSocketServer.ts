import { Server as SocketServer, Socket } from "socket.io"; // Keep both types imported
import handleMessage from "../handlers/messageHandler"; // Import the message handler

const createSocketServer = (socketPort: number) => {
  const io = new SocketServer(socketPort, {
    cors: {
      origin: "*", // Adjust this as needed
      methods: ["GET", "POST"],
    },
  });

  // Socket.IO connection handling
  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    
    handleMessage(socket, io);

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });

  // Log that the Socket.IO server is running
  console.log(`[Socket.IO server]: Server is running at http://localhost:${socketPort}`);

  return io;
};

export default createSocketServer;