const app = require("express")();
const http = require("https").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:5001",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});
const cors = require("cors");

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/display.html");
});

io.on("connection", (socket) => {
  socket.on("join-message", (roomId) => {
    // Try to join the room
    socket.join(roomId);

    // Check if the connection was successful
    const success = io.sockets.adapter.rooms.has(roomId);

    // Acknowledge the client
    if (success) {
      socket.emit("join-success");
      console.log("User Joined in a room: " + roomId);
    } else {
      socket.emit("join-failure", `Error: Unable to join room ${roomId}`);
    }
  });

  socket.on("screen-data", (data) => {
    data = JSON.parse(data);
    const room = data.room;
    const imgStr = data.image;

    socket.broadcast.to(room).emit("screen-data", imgStr);
  });
});

const server_port = process.env.PORT || 5001;
http.listen(server_port, () => {
  console.log("Started Server on: " + server_port);
});
