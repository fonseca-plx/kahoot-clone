import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerGameEvents } from "./controller/gameController";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" }
});

registerGameEvents(io);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`WS Server rodando na porta ${PORT}`);
});
