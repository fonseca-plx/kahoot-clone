import { nanoid } from "nanoid";
import { Player, RoomState } from "../types";

const rooms = new Map<string, RoomState>();

export function createRoomState(roomId: string, quizId: string, code: string): RoomState {
  const room: RoomState = {
    roomId,
    quizId,
    code: code ?? nanoid(6).toUpperCase(),
    questionIndex: 0,
    status: "waiting",
    hostSocketId: null,
    players: new Map(),
    questionTimer: null
  };

  rooms.set(roomId, room);
  return room;
}

export function getRoomState(idOrCode: string): RoomState | undefined {
  if (rooms.has(idOrCode)) return rooms.get(idOrCode);

  for (const r of rooms.values()) {
    if (r.code === idOrCode) return r;
  }

  return undefined;
}

export function addPlayer(room: RoomState, player: Player) {
  room.players.set(player.socketId, player);
}

export function removePlayer(room: RoomState, socketId: string): string | null {
  room.players.delete(socketId);
  
  // Se o host saiu, transferir para outro jogador
  if (room.hostSocketId === socketId && room.players.size > 0) {
    const firstPlayer = Array.from(room.players.values())[0];
    if (firstPlayer) {
      room.hostSocketId = firstPlayer.socketId;
      return firstPlayer.socketId;
    }
  }
  
  return null;
}

export function isHost(room: RoomState, socketId: string): boolean {
  return room.hostSocketId === socketId;
}

export function setHost(room: RoomState, socketId: string) {
  if (!room.hostSocketId) {
    room.hostSocketId = socketId;
  }
}

export function resetAnswers(room: RoomState) {
  room.players.forEach(p => (p.answeredCurrent = false));
}

export function listPlayers(room: RoomState) {
  return Array.from(room.players.values());
}

export function getAllRooms(): RoomState[] {
  return Array.from(rooms.values());
}

export function deleteRoom(roomId: string) {
  rooms.delete(roomId);
}