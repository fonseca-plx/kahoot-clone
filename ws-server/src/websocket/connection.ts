import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { ClientInfo, WSMessage, serializeMessage } from './protocol';

/**
 * Gerenciador de conexões WebSocket
 * Responsável por gerenciar ciclo de vida das conexões dos clientes
 */
export class ConnectionManager {
  private clients: Map<string, ClientInfo> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 segundos

  constructor() {
    this.startHeartbeat();
  }

  /**
   * Adiciona um novo cliente e retorna seu ID único
   */
  addClient(ws: WebSocket): string {
    const clientId = uuidv4();
    
    const clientInfo: ClientInfo = {
      id: clientId,
      ws,
      isAlive: true,
      connectedAt: Date.now(),
    };

    this.clients.set(clientId, clientInfo);
    this.setupHeartbeat(clientId);

    console.log(`[ConnectionManager] Client ${clientId} added. Total clients: ${this.clients.size}`);
    
    return clientId;
  }

  /**
   * Remove um cliente e fecha sua conexão
   */
  removeClient(id: string): void {
    const client = this.clients.get(id);
    
    if (client) {
      try {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.close();
        }
      } catch (error) {
        console.error(`[ConnectionManager] Error closing client ${id}:`, error);
      }

      this.clients.delete(id);
      console.log(`[ConnectionManager] Client ${id} removed. Total clients: ${this.clients.size}`);
    }
  }

  /**
   * Obtém informações de um cliente
   */
  getClient(id: string): ClientInfo | undefined {
    return this.clients.get(id);
  }

  /**
   * Atualiza informações de um cliente
   */
  updateClient(id: string, updates: Partial<Omit<ClientInfo, 'id' | 'ws' | 'connectedAt'>>): void {
    const client = this.clients.get(id);
    
    if (client) {
      Object.assign(client, updates);
    }
  }

  /**
   * Envia uma mensagem para um cliente específico
   */
  sendMessage(id: string, message: WSMessage): boolean {
    const client = this.clients.get(id);
    
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.ws.send(serializeMessage(message));
      return true;
    } catch (error) {
      console.error(`[ConnectionManager] Error sending message to ${id}:`, error);
      return false;
    }
  }

  /**
   * Envia mensagem para múltiplos clientes
   */
  broadcast(clientIds: string[], message: WSMessage): void {
    const serialized = serializeMessage(message);
    
    for (const clientId of clientIds) {
      const client = this.clients.get(clientId);
      
      if (client && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(serialized);
        } catch (error) {
          console.error(`[ConnectionManager] Error broadcasting to ${clientId}:`, error);
        }
      }
    }
  }

  /**
   * Obtém todos os clientes de uma sala
   */
  getClientsInRoom(roomId: string): ClientInfo[] {
    return Array.from(this.clients.values()).filter(
      client => client.roomId === roomId
    );
  }

  /**
   * Obtém apenas os IDs dos clientes de uma sala
   */
  getClientIdsInRoom(roomId: string): string[] {
    return Array.from(this.clients.values())
      .filter(client => client.roomId === roomId)
      .map(client => client.id);
  }

  /**
   * Conta o número de clientes ativos
   */
  getActiveCount(): number {
    return this.clients.size;
  }

  /**
   * Configura heartbeat (ping/pong) para um cliente
   */
  setupHeartbeat(id: string): void {
    const client = this.clients.get(id);
    
    if (!client) return;

    // Listener para pong - marca cliente como vivo
    client.ws.on('pong', () => {
      const currentClient = this.clients.get(id);
      if (currentClient) {
        currentClient.isAlive = true;
      }
    });
  }

  /**
   * Inicia o heartbeat global para todos os clientes
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [clientId, client] of this.clients.entries()) {
        if (!client.isAlive) {
          console.log(`[ConnectionManager] Client ${clientId} failed heartbeat, removing...`);
          this.removeClient(clientId);
          continue;
        }

        // Marca como não vivo e envia ping
        client.isAlive = false;
        
        if (client.ws.readyState === WebSocket.OPEN) {
          try {
            client.ws.ping();
          } catch (error) {
            console.error(`[ConnectionManager] Error pinging client ${clientId}:`, error);
          }
        }
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Limpa todas as conexões (shutdown graceful)
   */
  cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    console.log(`[ConnectionManager] Cleaning up ${this.clients.size} clients...`);

    for (const [clientId, client] of this.clients.entries()) {
      try {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.close(1000, 'Server shutting down');
        }
      } catch (error) {
        console.error(`[ConnectionManager] Error closing client ${clientId}:`, error);
      }
    }

    this.clients.clear();
    console.log('[ConnectionManager] Cleanup complete');
  }
}