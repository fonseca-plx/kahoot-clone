import { Request, Response } from "express";
import * as quizService from "../services/quizService";

export const createQuiz = async (req: Request, res: Response) => {
  const { title, description, authorId, questions } = req.body;
  const quiz = await quizService.createQuiz({ title, description, authorId, questions });
  res.status(201).json({ quiz, _links: { self: { href: `/api/quizzes/${quiz.id}` } } });
};

export const getQuiz = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const quiz = await quizService.getQuiz(id);
  if (!quiz) return res.status(404).json({ error: "Quiz not found" });
  res.json({ quiz: quiz, _links: { self: { href: `/api/quizzes/${quiz.id}` } } });
};

export const listQuizzes = async (req: Request, res: Response) => {
  const quizzes = await quizService.listQuizzes();
  res.json(quizzes.map((quiz:any) => ({ quiz, _links: { self: { href: `/api/quizzes/${quiz.id}` } } })));
};
