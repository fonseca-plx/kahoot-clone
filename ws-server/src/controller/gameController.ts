import { Server, Socket } from "socket.io";
import { nanoid } from "nanoid";

import { getRoom, getQuiz } from "../utils/restClient";
import {
  addPlayer,
  getRoomState,
  createRoomState,
  listPlayers,
  resetAnswers,
  removePlayer,
  setHost,
  isHost
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
  
  if (!idOrCode) {
    return socket.emit("error", { message: "roomId or code required" });
  }
  
  if (!displayName) {
    return socket.emit("error", { message: "displayName required" });
  }

  // Recupera ou cria estado da sala
  let roomState = getRoomState(idOrCode);

  if (!roomState) {
    const room = await getRoom(idOrCode);
    if (!room) {
      return socket.emit("error", { message: "Room not found" });
    }

    roomState = createRoomState(room.id, room.quizId, room.code);
  }

  // Definir primeiro jogador como host
  const isFirstPlayer = roomState.players.size === 0;
  if (isFirstPlayer) {
    setHost(roomState, socket.id);
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
    playerId: player.playerId,
    isHost: isHost(roomState, socket.id)
  });

  broadcastPlayers(io, roomState);
}

async function onHostStart(io: Server, socket: Socket, roomId: string) {
  const roomState = getRoomState(roomId);
  if (!roomState) {
    return socket.emit("error", { message: "room not found" });
  }

  // Verificar se é o host
  if (!isHost(roomState, socket.id)) {
    return socket.emit("error", { message: "only host can start game" });
  }

  const quiz = await getQuiz(roomState.quizId);
  if (!quiz) {
    return socket.emit("error", { message: "quiz not found" });
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    return socket.emit("error", { message: "quiz has no questions" });
  }

  roomState.status = "running";
  roomState.questionIndex = 0;
  roomState.quiz = quiz;

  // Notificar todos que o jogo está iniciando
  io.to(`room:${roomState.roomId}`).emit("game:starting", {
    message: "Game is starting..."
  });

  // Pequeno delay para dar tempo de redirecionar
  setTimeout(() => {
    startNextQuestion(io, roomState);
  }, 1000);
}

function startNextQuestion(io: Server, room: RoomState) {
  const quiz = room.quiz;
  
  if (!quiz || room.questionIndex >= quiz.questions.length) {
    finishGame(io, room);
    return;
  }

  const q = quiz.questions[room.questionIndex];
  if (!q) {
    finishGame(io, room);
    return;
  }

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
    endQuestion(io, room);
  }, q.timeLimitSeconds * 1000);

  room.questionIndex++;
}

function endQuestion(io: Server, room: RoomState) {
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }

  io.to(`room:${room.roomId}`).emit("game:question_end", {
    questionId: room.currentQuestion?.id,
    correctIndex: room.currentQuestion?.correctIndex
  });

  // Pequeno delay antes da próxima pergunta para mostrar resultado
  setTimeout(() => startNextQuestion(io, room), 5000);
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
    points,
    correctIndex: question.correctIndex
  });

  broadcastLeaderboard(io, room);

  // Se todos responderam, encerra a questão antecipadamente
  const allAnswered = listPlayers(room).every(p => p.answeredCurrent);
  if (allAnswered && room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
    
    // Pequeno delay para todos verem seus resultados, depois chamar endQuestion
    setTimeout(() => {
      endQuestion(io, room);
    }, 1000);
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

function broadcastHostChange(io: Server, room: RoomState, newHostSocketId: string) {
  const newHost = room.players.get(newHostSocketId);
  if (!newHost) return;
  
  console.log(`[WS] Host transferred to ${newHost.displayName} in room ${room.roomId}`);
  
  for (const [socketId] of room.players) {
    io.to(socketId).emit("room:host_changed", {
      newHostPlayerId: newHost.playerId,
      newHostDisplayName: newHost.displayName,
      isHost: socketId === newHostSocketId
    });
  }
}

function broadcastLeaderboard(io: Server, room: RoomState) {
  const leaderboard = listPlayers(room)
    .map(p => ({ playerId: p.playerId, displayName: p.displayName, score: p.score }))
    .sort((a, b) => b.score - a.score);

  io.to(`room:${room.roomId}`).emit("game:leaderboard", { leaderboard });
}

function finishGame(io: Server, room: RoomState) {
  room.status = "finished";
  
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }

  const leaderboard = listPlayers(room)
    .map(p => ({ playerId: p.playerId, displayName: p.displayName, score: p.score }))
    .sort((a, b) => b.score - a.score);

  io.to(`room:${room.roomId}`).emit("game:finished", { leaderboard });
}

function onDisconnect(io: Server, socket: Socket) {
  console.log("[WS] disconnected:", socket.id);
  
  const roomManager = require("../services/roomManager");
  
  for (const room of roomManager.getAllRooms()) {
    if (room.players.has(socket.id)) {
      const newHostSocketId = removePlayer(room, socket.id);
      console.log(`[WS] Player removed from room ${room.roomId}`);
      
      if (newHostSocketId) {
        broadcastHostChange(io, room, newHostSocketId);
      }
      
      broadcastPlayers(io, room);
      
      if (room.players.size === 0) {
        roomManager.deleteRoom(room.roomId);
        console.log(`[WS] Empty room ${room.roomId} deleted`);
      }
    }
  }
}