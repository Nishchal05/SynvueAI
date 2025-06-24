// server.js
const express = require("express");
const { WebSocketServer } = require("ws");
const http = require("http");
const dotenv = require("dotenv");
dotenv.config();

const { handleWebSocketConnection } = require("./wsHandler");

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("🎧 Client connected");
  handleWebSocketConnection(ws);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
