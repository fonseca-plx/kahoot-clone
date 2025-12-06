import { Request, Response } from "express";
import * as roomService from "../services/roomService";

const makeRoomLinks = (room: any) => ({
  self: { href: `/api/rooms/${room.id}` },
  join: { href: `/api/rooms/${room.code}/join`, method: "POST" },
  info: { href: `/api/rooms/${room.id}`, method: "GET" }
});

export const createRoom = async (req: Request, res: Response) => {
  const { quizId, title } = req.body;
  const room = await roomService.createRoom(quizId, title);
  res.status(201).json({ room, _links: makeRoomLinks(room) });
};

export const getRoom = async (req: Request, res: Response) => {
  const id  = req.params.id as string;
  const room = await roomService.getRoom({ id });
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ room, _links: makeRoomLinks(room) });
};

export const getRoomByCode = async (req: Request, res: Response) => {
  const code = req.params.code as string;
  const room = await roomService.getRoom({ code });
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ room, _links: makeRoomLinks(room) });
};

export const listRooms = async (req: Request, res: Response) => {
  const rooms = await roomService.listRooms();
  res.json(rooms.map((r:any) => ({ room: r, _links: makeRoomLinks(r) })));
};
