import prisma from "../prisma";

export const createQuiz = async (data: {
  title: string;
  description?: string;
  authorId: string;
  questions: { text: string; choices: string[]; correctIndex: number; timeLimitSeconds?: number }[];
}) => {
  const quiz = await prisma.quiz.create({
    data: {
      title: data.title,
      authorId: data.authorId,
      ...(data.description && { description: data.description }),
      questions: {
        create: data.questions.map(q => ({
          text: q.text,
          choices: q.choices,
          correctIndex: q.correctIndex,
          timeLimitSeconds: q.timeLimitSeconds ?? 10
        }))
      }
    },
    include: { questions: true }
  });
  return quiz;
};

export const getQuiz = async (id: string) =>
  prisma.quiz.findUnique({ where: { id }, include: { questions: true } });

export const listQuizzes = async () =>
  prisma.quiz.findMany({ include: { questions: true } });

export const deleteQuiz = async (id: string) =>
  prisma.quiz.delete({ where: { id } });
