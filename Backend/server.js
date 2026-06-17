require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

require("./socket/gameSocket")(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Pink Guess backend is running 🚀"
  });
});