import { Server, Socket } from "socket.io";
import { nanoid } from "nanoid";
import { RabbitMQService } from "../messaging/rabbitmq";

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

export function registerGameEvents(io: Server, mq: RabbitMQService) {
  io.on("connection", (socket: Socket) => {
    console.log("[WS] connected:", socket.id);

    socket.on("room:join", async ({ code, roomId, displayName }) =>
      onJoinRoom(io, socket, mq, { code, roomId, displayName })
    );

    socket.on("host:start", async ({ roomId }) =>
      onHostStart(io, socket, mq, roomId)
    );

    socket.on("game:answer", payload =>
      onPlayerAnswer(io, socket, mq, payload)
    );

    socket.on("disconnect", () => {
      onDisconnect(io, socket, mq);
    });
  });
}

async function onJoinRoom(io: Server, socket: Socket, mq: RabbitMQService, payload: any) {
  const idOrCode = payload.roomId ?? payload.code;
  const displayName = payload.displayName;
  
  if (!idOrCode) {
    return socket.emit("error", { message: "roomId or code required" });
  }
  
  if (!displayName) {
    return socket.emit("error", { message: "displayName required" });
  }

  let roomState = getRoomState(idOrCode);

  if (!roomState) {
    const room = await getRoom(idOrCode);
    if (!room) {
      return socket.emit("error", { message: "Room not found" });
    }

    roomState = createRoomState(room.id, room.quizId, room.code);
  }

  // Subscrever aos eventos RabbitMQ desta sala (apenas uma vez por sala)
  if (!roomState.rabbitMQQueue) {
    try {
      const queue = await mq.subscribeToRoom(roomState.roomId, (event, data) => {
        // Reemitir evento para todos os clientes conectados NESTE servidor
        io.to(`room:${roomState.roomId}`).emit(event, data);
      });
      roomState.rabbitMQQueue = queue;
      console.log(`[WS] Subscribed to RabbitMQ for room ${roomState.roomId}`);
    } catch (error) {
      console.error(`[WS] Failed to subscribe to RabbitMQ:`, error);
    }
  }

  const isFirstPlayer = roomState.players.size === 0;
  if (isFirstPlayer) {
    setHost(roomState, socket.id);
  }

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

  await broadcastPlayers(io, mq, roomState);
}

async function onHostStart(io: Server, socket: Socket, mq: RabbitMQService, roomId: string) {
  const roomState = getRoomState(roomId);
  if (!roomState) {
    return socket.emit("error", { message: "room not found" });
  }

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

  // Publicar evento no RabbitMQ
  await mq.publishRoomEvent(roomState.roomId, 'game:starting', {
    message: "Game is starting..."
  });

  setTimeout(() => {
    startNextQuestion(io, mq, roomState);
  }, 1000);
}

async function startNextQuestion(io: Server, mq: RabbitMQService, room: RoomState) {
  const quiz = room.quiz;
  
  if (!quiz || room.questionIndex >= quiz.questions.length) {
    await finishGame(io, mq, room);
    return;
  }

  const q = quiz.questions[room.questionIndex];
  if (!q) {
    await finishGame(io, mq, room);
    return;
  }

  room.currentQuestion = q;
  room.currentQuestionStart = Date.now();
  resetAnswers(room);

  // Publicar no RabbitMQ
  await mq.publishRoomEvent(room.roomId, 'game:question', {
    questionId: q.id,
    text: q.text,
    choices: q.choices,
    timeLimitSeconds: q.timeLimitSeconds
  });

  room.questionTimer = setTimeout(() => {
    endQuestion(io, mq, room);
  }, q.timeLimitSeconds * 1000);

  room.questionIndex++;
}

async function endQuestion(io: Server, mq: RabbitMQService, room: RoomState) {
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }

  // Publicar no RabbitMQ
  await mq.publishRoomEvent(room.roomId, 'game:question_end', {
    questionId: room.currentQuestion?.id,
    correctIndex: room.currentQuestion?.correctIndex
  });

  setTimeout(() => startNextQuestion(io, mq, room), 5000);
}

async function onPlayerAnswer(io: Server, socket: Socket, mq: RabbitMQService, payload: any) {
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

  await broadcastLeaderboard(io, mq, room);

  const allAnswered = listPlayers(room).every(p => p.answeredCurrent);
  if (allAnswered && room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
    
    setTimeout(() => {
      endQuestion(io, mq, room);
    }, 1000);
  }
}

async function broadcastPlayers(io: Server, mq: RabbitMQService, room: RoomState) {
  const players = listPlayers(room).map(p => ({
    playerId: p.playerId,
    displayName: p.displayName,
    score: p.score
  }));

  // Publicar no RabbitMQ para outros servidores
  await mq.publishRoomEvent(room.roomId, 'room:player_list', { players });
}

async function broadcastLeaderboard(io: Server, mq: RabbitMQService, room: RoomState) {
  const leaderboard = listPlayers(room)
    .map(p => ({ playerId: p.playerId, displayName: p.displayName, score: p.score }))
    .sort((a, b) => b.score - a.score);

  // Publicar no RabbitMQ
  await mq.publishRoomEvent(room.roomId, 'game:leaderboard', { leaderboard });
}

async function broadcastHostChange(io: Server, mq: RabbitMQService, room: RoomState, newHostSocketId: string) {
  const newHost = room.players.get(newHostSocketId);
  if (!newHost) return;
  
  console.log(`[WS] Host transferred to ${newHost.displayName} in room ${room.roomId}`);
  
  // Publicar no RabbitMQ
  await mq.publishRoomEvent(room.roomId, 'room:host_changed', {
    newHostPlayerId: newHost.playerId,
    newHostDisplayName: newHost.displayName
  });
  
  // Emitir localmente com informação de isHost para cada jogador
  for (const [socketId, player] of room.players) {
    io.to(socketId).emit("room:host_changed", {
      newHostPlayerId: newHost.playerId,
      newHostDisplayName: newHost.displayName,
      isHost: socketId === newHostSocketId
    });
  }
}

async function finishGame(io: Server, mq: RabbitMQService, room: RoomState) {
  room.status = "finished";
  
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }

  const leaderboard = listPlayers(room)
    .map(p => ({ playerId: p.playerId, displayName: p.displayName, score: p.score }))
    .sort((a, b) => b.score - a.score);

  // Publicar no RabbitMQ
  await mq.publishRoomEvent(room.roomId, 'game:finished', { leaderboard });
}

function onDisconnect(io: Server, socket: Socket, mq: RabbitMQService) {
  console.log("[WS] disconnected:", socket.id);
  
  const roomManager = require("../services/roomManager");
  
  for (const room of roomManager.getAllRooms()) {
    if (room.players.has(socket.id)) {
      const newHostSocketId = removePlayer(room, socket.id);
      console.log(`[WS] Player removed from room ${room.roomId}`);
      
      if (newHostSocketId) {
        broadcastHostChange(io, mq, room, newHostSocketId);
      }
      
      broadcastPlayers(io, mq, room);
      
      if (room.players.size === 0) {
        // Unsubscribe do RabbitMQ
        if (room.rabbitMQQueue) {
          mq.unsubscribe(room.rabbitMQQueue).catch(err => 
            console.error('[WS] Failed to unsubscribe:', err)
          );
        }
        
        roomManager.deleteRoom(room.roomId);
        console.log(`[WS] Empty room ${room.roomId} deleted`);
      }
    }
  }
}