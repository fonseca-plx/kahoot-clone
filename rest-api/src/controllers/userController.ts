import { Request, Response } from "express";
import * as userService from "../services/userService";

export const createUser = async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const user = await userService.createUser({ name, email });
  res.status(201).json({ user, _links: { self: { href: `/api/users/${user.id}` } } });
};

export const getUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await userService.getUser(id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: user, _links: { self: { href: `/api/users/${user.id}` } } });
};

export const listUsers = async (req: Request, res: Response) => {
  const users = await userService.listUsers();
  res.json(users.map((user:any) => ({ user: user, _links: { self: { href: `/api/users/${user.id}` } } })));
};
