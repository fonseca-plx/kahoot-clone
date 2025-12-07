import { Request, Response } from "express";
import restProxy from "../services/restProxyService";
import { makeRoomLinks, makeQuizLinks, makeUserLinks } from "../utils/hateoas";

export default class GatewayController {

  static async createUser(req: Request, res: Response) {
    try {
      const data = await restProxy.createUser(req.body);
      const user = data.user?.user ?? data.user ?? data;
      res.status(201).json({ user, _links: makeUserLinks(user) });
    } catch (err: any) {
      res.status(err.response?.status || 500).json({ error: err.message });
    }
  }

  static async listUsers(req: Request, res: Response) {
    try {
      const data = await restProxy.listUsers();
      let users: any[];
      
      if (Array.isArray(data)) {
        users = data.map((item: any) => item.user?.user ?? item.user ?? item);
      } else {
        const usersList = data.users ?? data;
        users = usersList.map((item: any) => item.user?.user ?? item.user ?? item);
      }

      res.json(users.map((user: any) => ({ user, _links: makeUserLinks(user) })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const data = await restProxy.getUser(id);
      const user = data.user?.user ?? data.user ?? data;
      res.json({ user, _links: makeUserLinks(user) });
    } catch (err: any) {
      res.status(err.response?.status || 500).json({ error: err.message });
    }
  }

  static async createQuiz(req: Request, res: Response) {
    try {
      const data = await restProxy.createQuiz(req.body);
      const quiz = data.quiz?.quiz ?? data.quiz ?? data;
      res.status(201).json({ quiz, _links: makeQuizLinks(quiz) });
    } catch (err: any) {
      res.status(err.response?.status || 500).json({ error: err.message });
    }
  }
  
  static async listQuizzes(req: Request, res: Response) {
    try {
      const data = await restProxy.listQuizzes();

      let quizzes: any[];
      
      if (Array.isArray(data)) {
        quizzes = data.map((item: any) => item.quiz?.quiz ?? item.quiz ?? item);
      } else {
        const quizzesList = data.quizzes ?? data;
        quizzes = quizzesList.map((item: any) => item.quiz?.quiz ?? item.quiz ?? item);
      }

      res.json(quizzes.map((quiz: any) => ({ quiz, _links: makeQuizLinks(quiz) })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getQuiz(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const data = await restProxy.getQuiz(id);
      const quiz = data.quiz?.quiz ?? data.quiz ?? data;
      res.json({ quiz, _links: makeQuizLinks(quiz) });
    } catch (err: any) {
      res.status(err.response?.status || 500).json({ error: err.message });
    }
  }

  static async createRoom(req: Request, res: Response) {
    try {
      const data = await restProxy.createRoom(req.body);
      const room = data.room?.room ?? data.room ?? data;
      const wsUrl = process.env.WS_URL || "http://localhost:4000";

      res.status(201).json({ 
        room, 
        _links: makeRoomLinks(room, wsUrl) 
      });
    } catch (err: any) {
      res.status(err.response?.status || 500).json({ error: err.message });
    }
  }

  static async listRooms(req: Request, res: Response) {
    try {
      const data = await restProxy.listRooms();

      let rooms: any[];
      
      if (Array.isArray(data)) {
        rooms = data.map((item: any) => item.room?.room ?? item.room ?? item);
      } else {
        const roomsList = data.rooms ?? data;
        rooms = roomsList.map((item: any) => item.room?.room ?? item.room ?? item);
      }

      const wsUrl = process.env.WS_URL || "http://localhost:4000";

      res.json(
        rooms.map((room: any) => ({
          room,
          _links: makeRoomLinks(room, wsUrl)
        }))
      );
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getRoom(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const data = await restProxy.getRoomById(id);
      const room = data.room?.room ?? data.room ?? data;
      const wsUrl = process.env.WS_URL || "http://localhost:4000";

      res.json({ 
        room, 
        _links: makeRoomLinks(room, wsUrl) 
      });
    } catch (err: any) {
      res.status(err.response?.status || 500).json({ error: err.message });
    }
  }

  static async getRoomByCode(req: Request, res: Response) {
    try {
      const code = req.params.code as string;
      const data = await restProxy.getRoomByCode(code);
      const room = data.room?.room ?? data.room ?? data;
      const wsUrl = process.env.WS_URL || "http://localhost:4000";

      res.json({ 
        room, 
        _links: makeRoomLinks(room, wsUrl) 
      });
    } catch (err: any) {
      res.status(err.response?.status || 500).json({ error: err.message });
    }
  }
}