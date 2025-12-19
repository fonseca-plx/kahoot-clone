import { ConnectionManager } from './connection';
import { WSMessage, ClientInfo } from './protocol';

/**
 * Gerenciador de salas
 * Responsável por organizar clientes em salas e fazer broadcast
 */
export class RoomManager {
  private connectionManager: ConnectionManager;

  constructor(connectionManager: ConnectionManager) {
    this.connectionManager = connectionManager;
  }

  /**
   * Adiciona um cliente a uma sala
   */
  joinRoom(clientId: string, roomId: string): void {
    this.connectionManager.updateClient(clientId, { roomId });
    console.log(`[RoomManager] Client ${clientId} joined room ${roomId}`);
  }

  /**
   * Remove um cliente de sua sala atual
   */
  leaveRoom(clientId: string): void {
    const client = this.connectionManager.getClient(clientId);
    
    if (client && client.roomId) {
      const roomId = client.roomId;
      this.connectionManager.updateClient(clientId, { roomId: null });
      console.log(`[RoomManager] Client ${clientId} left room ${roomId}`);
    }
  }

  /**
   * Envia mensagem para todos os clientes de uma sala
   */
  broadcastToRoom(roomId: string, message: WSMessage, excludeClientId?: string): void {
    const clientIds = this.connectionManager.getClientIdsInRoom(roomId);
    
    const targetIds = excludeClientId
      ? clientIds.filter(id => id !== excludeClientId)
      : clientIds;

    this.connectionManager.broadcast(targetIds, message);
  }

  /**
   * Envia mensagem para um cliente específico em uma sala
   */
  sendToClientInRoom(roomId: string, clientId: string, message: WSMessage): boolean {
    const client = this.connectionManager.getClient(clientId);
    
    if (!client || client.roomId !== roomId) {
      return false;
    }

    return this.connectionManager.sendMessage(clientId, message);
  }

  /**
   * Obtém todos os clientes de uma sala
   */
  getRoomClients(roomId: string): ClientInfo[] {
    return this.connectionManager.getClientsInRoom(roomId);
  }

  /**
   * Conta o número de clientes em uma sala
   */
  getRoomSize(roomId: string): number {
    return this.connectionManager.getClientIdsInRoom(roomId).length;
  }

  /**
   * Verifica se uma sala existe (tem pelo menos um cliente)
   */
  roomExists(roomId: string): boolean {
    return this.getRoomSize(roomId) > 0;
  }

  /**
   * Lista todas as salas ativas
   */
  getActiveRooms(): string[] {
    const rooms = new Set<string>();
    
    const allClients = Array.from({ length: this.connectionManager.getActiveCount() })
      .map((_, i) => this.connectionManager.getClient(String(i)))
      .filter(Boolean) as ClientInfo[];

    for (const client of allClients) {
      if (client.roomId) {
        rooms.add(client.roomId);
      }
    }

    return Array.from(rooms);
  }
}