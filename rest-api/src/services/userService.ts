import prisma from "../prisma";
import { User } from "@prisma/client";

export const createUser = async (data: { name: string; email: string; }): Promise<User> => {
  return prisma.user.create({ data });
};

export const getUser = async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

export const listUsers = async () => {
  return prisma.user.findMany();
};

export const updateUser = async (id: string, data: Partial<{ name: string; email: string; }>) => {
  return prisma.user.update({ where: { id }, data });
};

export const deleteUser = async (id: string) => {
  return prisma.user.delete({ where: { id } });
};
