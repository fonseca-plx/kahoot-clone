import { Server as HttpServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { ConnectionManager } from './connection';
import { RoomManager } from './rooms';
import {
  WSMessage,
  MessageType,
  isValidMessage,
  deserializeMessage,
  createMessage,
  createErrorMessage,
  WelcomePayload,
} from './protocol';

/**
 * Tipo para o handler de mensagens
 */
type MessageHandler = (clientId: string, message: WSMessage) => void | Promise<void>;
type DisconnectHandler = (clientId: string) => void | Promise<void>;

/**
 * Servidor WebSocket para o jogo
 */
export class GameWebSocketServer {
  private wss: WebSocketServer;
  private connectionManager: ConnectionManager;
  private roomManager: RoomManager;
  private messageHandler: MessageHandler | null = null;
  private disconnectHandler: DisconnectHandler | null = null;

  constructor(httpServer: HttpServer) {
    // Criar WebSocketServer
    this.wss = new WebSocketServer({ 
      server: httpServer,
      path: '/',
    });

    // Instanciar gerenciadores
    this.connectionManager = new ConnectionManager();
    this.roomManager = new RoomManager(this.connectionManager);

    // Configurar servidor
    this.setupServer();

    console.log('[GameWebSocketServer] WebSocket server initialized');
  }

  /**
   * Configura os event listeners do servidor
   */
  private setupServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      // Adicionar cliente
      const clientId = this.connectionManager.addClient(ws);

      console.log(`[GameWebSocketServer] New connection: ${clientId}`);

      // Enviar mensagem de boas-vindas
      const welcomeMessage = createMessage<WelcomePayload>(MessageType.WELCOME, {
        clientId,
        serverTime: Date.now(),
      });
      this.connectionManager.sendMessage(clientId, welcomeMessage);

      // Handler de mensagens
      ws.on('message', (data: WebSocket.Data) => {
        this.handleMessage(clientId, data);
      });

      // Handler de desconexão
      ws.on('close', () => {
        console.log(`[GameWebSocketServer] Client disconnected: ${clientId}`);
        
        // Chamar handler de desconexão se registrado
        if (this.disconnectHandler) {
          this.disconnectHandler(clientId);
        }

        // Remover cliente
        this.connectionManager.removeClient(clientId);
      });

      // Handler de erros
      ws.on('error', (error) => {
        console.error(`[GameWebSocketServer] WebSocket error for ${clientId}:`, error);
      });
    });

    console.log('[GameWebSocketServer] Server setup complete');
  }

  /**
   * Processa mensagens recebidas
   */
  private handleMessage(clientId: string, data: WebSocket.Data): void {
    try {
      // Converter para string
      const messageStr = data.toString();
      
      // Deserializar
      const message = deserializeMessage(messageStr);

      if (!message) {
        console.error(`[GameWebSocketServer] Invalid message from ${clientId}`);
        this.sendToClient(clientId, createErrorMessage('Invalid message format'));
        return;
      }

      // Validar estrutura
      if (!isValidMessage(message)) {
        console.error(`[GameWebSocketServer] Message validation failed from ${clientId}`);
        this.sendToClient(clientId, createErrorMessage('Message validation failed'));
        return;
      }

      console.log(`[GameWebSocketServer] Message from ${clientId}:`, message.type);

      // Chamar handler registrado
      if (this.messageHandler) {
        this.messageHandler(clientId, message);
      }
    } catch (error) {
      console.error(`[GameWebSocketServer] Error handling message from ${clientId}:`, error);
      this.sendToClient(clientId, createErrorMessage('Error processing message'));
    }
  }

  /**
   * Envia mensagem para um cliente específico
   */
  sendToClient(clientId: string, message: WSMessage): boolean {
    return this.connectionManager.sendMessage(clientId, message);
  }

  /**
   * Faz broadcast para uma sala
   */
  broadcastToRoom(roomId: string, message: WSMessage, excludeClientId?: string): void {
    this.roomManager.broadcastToRoom(roomId, message, excludeClientId);
  }

  /**
   * Registra o handler de mensagens
   */
  setMessageHandler(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  /**
   * Registra o handler de desconexão
   */
  setDisconnectHandler(handler: DisconnectHandler): void {
    this.disconnectHandler = handler;
  }

  /**
   * Obtém o ConnectionManager
   */
  getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }

  /**
   * Obtém o RoomManager
   */
  getRoomManager(): RoomManager {
    return this.roomManager;
  }

  /**
   * Obtém estatísticas do servidor
   */
  getStats(): {
    activeConnections: number;
    activeRooms: number;
  } {
    return {
      activeConnections: this.connectionManager.getActiveCount(),
      activeRooms: this.roomManager.getActiveRooms().length,
    };
  }

  /**
   * Desliga o servidor gracefully
   */
  async shutdown(): Promise<void> {
    console.log('[GameWebSocketServer] Shutting down...');

    // Limpar conexões
    this.connectionManager.cleanup();

    // Fechar WebSocketServer
    return new Promise((resolve) => {
      this.wss.close(() => {
        console.log('[GameWebSocketServer] Server closed');
        resolve();
      });
    });
  }
}