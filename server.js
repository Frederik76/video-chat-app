// server.js
import express from "express";
import http from "http";
import { v4 } from "uuid";
import {Server} from "socket.io";
import { ExpressPeerServer } from "peer";

const app = express();
const server = http.Server(app);
app.set("view engine", "ejs");
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});
const peerServer = ExpressPeerServer(server, {
    debug: true,
  });

app.use("/peerjs", peerServer);  
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.redirect(`/${v4()}`);
  });
  
  app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
  });

  io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
      socket.join(roomId);
      socket.to(roomId).broadcast.emit("user-connected", userId);
      socket.on("message", (message) => {
        io.to(roomId).emit("createMessage", message, userName);
      });
    });
  });
server.listen(3030);