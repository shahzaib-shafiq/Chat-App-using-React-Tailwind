import { Server } from "socket.io";

const io = new Server(3000, {
  cors: {
    origin: "*",
  },
});

let users = [];

io.on("connection", (socket) => {
  const user = socket.handshake.query;

  user.socketId = socket.id;
  socket.join(user.userId);

  users.push(user);

  io.emit("user-connected", users);

  socket.on("disconnect", () => {
    users = users.filter((u) => {
      if (u.socketId != socket.id) {
        return u;
      }
    });
    io.emit("user-disconnected", users);
  });

  socket.on("send-chat-message", (data) => {
    console.log(data);
    io.to(data.sender.userId).emit("chat-message", {
      sender: data.sender,
      receiver: data.receiver,
      message: data.message,
    });
    io.to(data.receiver.userId).emit("chat-message", {
      sender: data.sender,
      receiver: data.receiver,
      message: data.message,
    });
  });
});
