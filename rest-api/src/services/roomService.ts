import prisma from "../prisma";
import { nanoid } from "nanoid";

export const createRoom = async (quizId: string, title?: string) => {
  const code = nanoid(6).toUpperCase();
  const room = await prisma.room.create({
    data: {
        quizId,
        code,
        ...(title && { title })
    }
  });
  return room;
};

export const getRoom = async (idOrCode: { id?: string; code?: string }) => {
  if (idOrCode.id) return prisma.room.findUnique({ where: { id: idOrCode.id }, include: { quiz: { include: { questions: true } } }});
  if (idOrCode.code) return prisma.room.findUnique({ where: { code: idOrCode.code }, include: { quiz: { include: { questions: true } } }});
};

export const listRooms = async () =>
  prisma.room.findMany({ include: { quiz: { include: { questions: true } } }});
