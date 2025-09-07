import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("Received:", message.toString());
    // Echo back the same message
    ws.send(`Server echo: ${message}`);
  });


  ws.on("close", () => {
    console.log("Client disconnected");
  });
});