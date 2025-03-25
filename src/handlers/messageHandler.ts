import { Socket, Server } from "socket.io";

const handleMessage = (socket: Socket, io: Server) => { // Change the type of io to Server
  socket.on("message", (msg) => {
    console.log("Message received:", msg);
    // Broadcast the message to all clients
    io.emit("server-message", msg);
  });
};

export default handleMessage;