import express from "express";
import http from "http";
import cors from "cors";
import { registerGameEvents } from "./controller/gameController";
import { rabbitMQ } from "./messaging/rabbitmq";
import { GameWebSocketServer } from "./websocket/server";

const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['http://yourdomain.com']
    : '*',
  credentials: true
}));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "ws-server",
    rabbitmq: rabbitMQ.getConnectionStatus() ? 'connected' : 'disconnected'
  });
});

const httpServer = http.createServer(app);

// Criar servidor WebSocket nativo
const wsServer = new GameWebSocketServer(httpServer);

const PORT = process.env.PORT || 4000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

async function startServer() {
  try {
    console.log('[Server] Connecting to RabbitMQ...');
    await rabbitMQ.connect(RABBITMQ_URL);
    
    registerGameEvents(wsServer, rabbitMQ);
    
    httpServer.listen(PORT, () => {
      console.log(`✅ WS Server rodando na porta ${PORT}`);
      console.log(`📡 REST API URL: ${process.env.REST_API_URL || "http://localhost:3001/api"}`);
      console.log(`🐰 RabbitMQ: ${rabbitMQ.getConnectionStatus() ? 'Connected' : 'Disconnected'}`);
      
      const stats = wsServer.getStats();
      console.log(`🔌 WebSocket: ${stats.activeConnections} connections, ${stats.activeRooms} rooms`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    console.log('[Server] Retrying in 5 seconds...');
    
    setTimeout(() => {
      startServer();
    }, 5000);
  }
}

process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received, closing gracefully...');
  await wsServer.shutdown();
  await rabbitMQ.disconnect();
  httpServer.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('[Server] SIGINT received, closing gracefully...');
  await wsServer.shutdown();
  await rabbitMQ.disconnect();
  httpServer.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});

startServer();