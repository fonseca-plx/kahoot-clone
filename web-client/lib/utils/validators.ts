import { z } from "zod";
import { GAME_CONSTANTS } from "./constants";

// ==================== USER VALIDATORS ====================
export const userSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50),
  email: z.string().email("Email inválido")
});

// ==================== QUIZ VALIDATORS ====================
export const questionSchema = z.object({
  text: z.string().min(5, "Pergunta deve ter pelo menos 5 caracteres"),
  choices: z
    .array(z.string().min(1))
    .min(GAME_CONSTANTS.MIN_CHOICES, `Mínimo ${GAME_CONSTANTS.MIN_CHOICES} alternativas`)
    .max(GAME_CONSTANTS.MAX_CHOICES, `Máximo ${GAME_CONSTANTS.MAX_CHOICES} alternativas`),
  correctIndex: z.number().int().min(0),
  timeLimitSeconds: z
    .number()
    .int()
    .min(GAME_CONSTANTS.MIN_TIME_LIMIT)
    .max(GAME_CONSTANTS.MAX_TIME_LIMIT)
    .default(GAME_CONSTANTS.DEFAULT_TIME_LIMIT)
});

export const quizSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(100),
  description: z.string().max(500).optional(),
  questions: z
    .array(questionSchema)
    .min(GAME_CONSTANTS.MIN_QUESTIONS, `Mínimo ${GAME_CONSTANTS.MIN_QUESTIONS} pergunta`)
    .max(GAME_CONSTANTS.MAX_QUESTIONS, `Máximo ${GAME_CONSTANTS.MAX_QUESTIONS} perguntas`)
});

// ==================== ROOM VALIDATORS ====================
export const roomCodeSchema = z
  .string()
  .length(GAME_CONSTANTS.ROOM_CODE_LENGTH, `Código deve ter ${GAME_CONSTANTS.ROOM_CODE_LENGTH} caracteres`)
  .regex(/^[A-Z0-9]+$/, "Código deve conter apenas letras maiúsculas e números");

export const displayNameSchema = z
  .string()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(20, "Nome deve ter no máximo 20 caracteres");

export const joinRoomSchema = z.object({
  displayName: displayNameSchema,
  roomCode: roomCodeSchema
});

// ==================== HELPER FUNCTIONS ====================
export function validateRoomCode(code: string): boolean {
  return roomCodeSchema.safeParse(code).success;
}

export function validateDisplayName(name: string): boolean {
  return displayNameSchema.safeParse(name).success;
}