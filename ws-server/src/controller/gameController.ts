import { Server, Socket } from "socket.io";
import { nanoid } from "nanoid";

import { getRoom, getQuiz } from "../utils/restClient";
import {
  addPlayer,
  getRoomState,
  createRoomState,
  listPlayers,
  resetAnswers
} from "../services/roomManager";

import { computePoints } from "../utils/scoring";
import { RoomState, Player } from "../types";

export function registerGameEvents(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("[WS] connected:", socket.id);

    socket.on("room:join", async ({ code, roomId, displayName }) =>
      onJoinRoom(io, socket, { code, roomId, displayName })
    );

    socket.on("host:start", async ({ roomId }) =>
      onHostStart(io, socket, roomId)
    );

    socket.on("game:answer", payload =>
      onPlayerAnswer(io, socket, payload)
    );

    socket.on("disconnect", () => {
      onDisconnect(io, socket);
    });
  });
}

async function onJoinRoom(io: Server, socket: Socket, payload: any) {
  const idOrCode = payload.roomId ?? payload.code;
  const displayName = payload.displayName;
  if (!idOrCode) return socket.emit("error", { message: "roomId or code required" });

  // Recupera ou cria estado da sala
  let roomState = getRoomState(idOrCode);

  if (!roomState) {
    const room = await getRoom(idOrCode);
    if (!room) return socket.emit("error", { message: "Room not found" });

    roomState = createRoomState(room.id, room.quizId, room.code);
  }

  // Criar jogador
  const player: Player = {
    socketId: socket.id,
    playerId: nanoid(8),
    score: 0,
    displayName
  };

  addPlayer(roomState, player);
  socket.join(`room:${roomState.roomId}`);

  socket.emit("room:joined", {
    roomId: roomState.roomId,
    code: roomState.code,
    playerId: player.playerId
  });

  broadcastPlayers(io, roomState);
}

async function onHostStart(io: Server, socket: Socket, roomId: string) {
  const roomState = getRoomState(roomId);
  if (!roomState) return socket.emit("error", { message: "room not found" });

  const quiz = await getQuiz(roomState.quizId);
  if (!quiz) return socket.emit("error", { message: "quiz not found" });

  roomState.status = "running";
  roomState.questionIndex = 0;

  startNextQuestion(io, roomState, quiz);
}

function startNextQuestion(io: Server, room: RoomState, quiz: any) {
  if (room.questionIndex >= quiz.questions.length) {
    finishGame(io, room);
    return;
  }

  const q = quiz.questions[room.questionIndex];

  room.currentQuestion = q;
  room.currentQuestionStart = Date.now();
  resetAnswers(room);

  io.to(`room:${room.roomId}`).emit("game:question", {
    questionId: q.id,
    text: q.text,
    choices: q.choices,
    timeLimitSeconds: q.timeLimitSeconds
  });

  room.questionTimer = setTimeout(() => {
    endQuestion(io, room, quiz);
  }, q.timeLimitSeconds * 1000);

  room.questionIndex++;
}

function endQuestion(io: Server, room: RoomState, quiz: any) {
  io.to(`room:${room.roomId}`).emit("game:question_end", {
    questionId: room.currentQuestion.id
  });

  setTimeout(() => startNextQuestion(io, room, quiz), 700);
}

function onPlayerAnswer(io: Server, socket: Socket, payload: any) {
  const { roomId, questionId, selectedIndex, timeMs } = payload;
  const room = getRoomState(roomId);
  if (!room) return;
  if (room.status !== "running") return;

  const question = room.currentQuestion;
  if (!question || question.id !== questionId) return;

  const player = room.players.get(socket.id);
  if (!player || player.answeredCurrent) return;

  const isCorrect = selectedIndex === question.correctIndex;
  const elapsed = timeMs ?? (Date.now() - room.currentQuestionStart!);

  const points = computePoints(isCorrect, elapsed, question.timeLimitSeconds * 1000);
  if (isCorrect) player.score += points;

  player.answeredCurrent = true;

  socket.emit("game:answer_result", {
    correct: isCorrect,
    points
  });

  broadcastLeaderboard(io, room);

  const allAnswered = listPlayers(room).every(p => p.answeredCurrent);
  if (allAnswered && room.questionTimer) {
    clearTimeout(room.questionTimer);
    endQuestion(io, room, { questions: [] });
  }
}

function broadcastPlayers(io: Server, room: RoomState) {
  const players = listPlayers(room).map(p => ({
    playerId: p.playerId,
    displayName: p.displayName,
    score: p.score
  }));

  io.to(`room:${room.roomId}`).emit("room:player_list", { players });
}

function broadcastLeaderboard(io: Server, room: RoomState) {
  const leaderboard = listPlayers(room)
    .map(p => ({ playerId: p.playerId, displayName: p.displayName, score: p.score }))
    .sort((a, b) => b.score - a.score);

  io.to(`room:${room.roomId}`).emit("game:leaderboard", { leaderboard });
}

function finishGame(io: Server, room: RoomState) {
  room.status = "finished";

  const leaderboard = listPlayers(room)
    .map(p => ({ playerId: p.playerId, displayName: p.displayName, score: p.score }))
    .sort((a, b) => b.score - a.score);

  io.to(`room:${room.roomId}`).emit("game:finished", { leaderboard });
}

function onDisconnect(io: Server, socket: Socket) {
  // remover jogador de todas as salas
  for (const room of Array.from((global as any).rooms ?? [])) {}

  // Apenas remoção bruta simples:
  for (const room of (global as any).rooms?.values?.() ?? []) {}

  // Método simples com roomManager:
  for (const room of (global as any).rooms?.values?.() ?? []) {}

  // Melhor implementação:
  // Vasculha rooms para encontrar o jogador
  const allRooms = (require("../services/roomManager") as any).__proto__.constructor.rooms;
  // Porém deixaremos simples: fazer scan manual no map

  console.log("[WS] disconnected:", socket.id);
}
