import { nanoid } from "nanoid";
import { RabbitMQService } from "../messaging/rabbitmq";
import { GameWebSocketServer } from "../websocket/server";
import {
  MessageType,
  JoinRoomPayload,
  StartGamePayload,
  AnswerQuestionPayload,
  createMessage,
  createErrorMessage,
} from "../websocket/protocol";

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

export function registerGameEvents(wsServer: GameWebSocketServer, mq: RabbitMQService) {
  // Registrar handler de mensagens
  wsServer.setMessageHandler(async (clientId, message) => {
    console.log(`[GameController] Message from ${clientId}: ${message.type}`);

    switch (message.type) {
      case MessageType.JOIN_ROOM:
        await onJoinRoom(wsServer, mq, clientId, message.data as JoinRoomPayload);
        break;

      case MessageType.START_GAME:
        await onHostStart(wsServer, mq, clientId, message.data as StartGamePayload);
        break;

      case MessageType.ANSWER_QUESTION:
        await onPlayerAnswer(wsServer, mq, clientId, message.data as AnswerQuestionPayload);
        break;

      default:
        console.warn(`[GameController] Unknown message type: ${message.type}`);
        wsServer.sendToClient(clientId, createErrorMessage('Unknown message type'));
    }
  });

  // Registrar handler de desconexão
  wsServer.setDisconnectHandler(async (clientId) => {
    await onDisconnect(wsServer, mq, clientId);
  });

  console.log('[GameController] Game events registered');
}

async function onJoinRoom(
  wsServer: GameWebSocketServer, 
  mq: RabbitMQService, 
  clientId: string, 
  payload: JoinRoomPayload
) {
  const idOrCode = payload.roomId ?? payload.code;
  const displayName = payload.displayName;
  
  if (!idOrCode) {
    return wsServer.sendToClient(clientId, createErrorMessage("roomId or code required"));
  }
  
  if (!displayName) {
    return wsServer.sendToClient(clientId, createErrorMessage("displayName required"));
  }

  let roomState = getRoomState(idOrCode);

  if (!roomState) {
    const room = await getRoom(idOrCode);
    if (!room) {
      return wsServer.sendToClient(clientId, createErrorMessage("Room not found"));
    }

    roomState = createRoomState(room.id, room.quizId, room.code);
  }

  // Subscrever aos eventos RabbitMQ desta sala (apenas uma vez por sala)
  if (!roomState.rabbitMQQueue) {
    try {
      const queue = await mq.subscribeToRoom(roomState.roomId, (event, data) => {
        // Reemitir evento para todos os clientes conectados NESTE servidor
        const message = createMessage(event, data);
        wsServer.broadcastToRoom(roomState.roomId, message);
      });
      roomState.rabbitMQQueue = queue;
      console.log(`[GameController] Subscribed to RabbitMQ for room ${roomState.roomId}`);
    } catch (error) {
      console.error(`[GameController] Failed to subscribe to RabbitMQ:`, error);
    }
  }

  const isFirstPlayer = roomState.players.size === 0;
  if (isFirstPlayer) {
    setHost(roomState, clientId);
  }

  const player: Player = {
    clientId,
    socketId: clientId, // Para compatibilidade
    playerId: nanoid(8),
    score: 0,
    displayName
  };

  addPlayer(roomState, player);
  
  // Adicionar cliente à sala no RoomManager
  wsServer.getRoomManager().joinRoom(clientId, roomState.roomId);

  // Atualizar informações do cliente no ConnectionManager
  wsServer.getConnectionManager().updateClient(clientId, {
    roomId: roomState.roomId,
    playerId: player.playerId,
    displayName: displayName,
  });

  // Enviar confirmação de entrada
  wsServer.sendToClient(clientId, createMessage(MessageType.ROOM_JOINED, {
    roomId: roomState.roomId,
    code: roomState.code,
    playerId: player.playerId,
    isHost: isHost(roomState, clientId)
  }));

  await broadcastPlayers(wsServer, mq, roomState);
}

async function onHostStart(
  wsServer: GameWebSocketServer, 
  mq: RabbitMQService, 
  clientId: string, 
  data: StartGamePayload
) {
  const roomState = getRoomState(data.roomId);
  if (!roomState) {
    return wsServer.sendToClient(clientId, createErrorMessage("room not found"));
  }

  if (!isHost(roomState, clientId)) {
    return wsServer.sendToClient(clientId, createErrorMessage("only host can start game"));
  }

  const quiz = await getQuiz(roomState.quizId);
  if (!quiz) {
    return wsServer.sendToClient(clientId, createErrorMessage("quiz not found"));
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    return wsServer.sendToClient(clientId, createErrorMessage("quiz has no questions"));
  }

  roomState.status = "running";
  roomState.questionIndex = 0;
  roomState.quiz = quiz;

  // Publicar evento no RabbitMQ
  await mq.publishRoomEvent(roomState.roomId, 'game:starting', {
    message: "Game is starting..."
  });

  setTimeout(() => {
    startNextQuestion(wsServer, mq, roomState);
  }, 1000);
}

async function startNextQuestion(
  wsServer: GameWebSocketServer, 
  mq: RabbitMQService, 
  room: RoomState
) {
  const quiz = room.quiz;
  
  if (!quiz || room.questionIndex >= quiz.questions.length) {
    await finishGame(wsServer, mq, room);
    return;
  }

  const q = quiz.questions[room.questionIndex];
  if (!q) {
    await finishGame(wsServer, mq, room);
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
    endQuestion(wsServer, mq, room);
  }, q.timeLimitSeconds * 1000);

  room.questionIndex++;
}

async function endQuestion(
  wsServer: GameWebSocketServer, 
  mq: RabbitMQService, 
  room: RoomState
) {
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }

  // Publicar no RabbitMQ
  await mq.publishRoomEvent(room.roomId, 'game:question_end', {
    questionId: room.currentQuestion?.id,
    correctIndex: room.currentQuestion?.correctIndex
  });

  setTimeout(() => startNextQuestion(wsServer, mq, room), 5000);
}

async function onPlayerAnswer(
  wsServer: GameWebSocketServer, 
  mq: RabbitMQService, 
  clientId: string, 
  payload: AnswerQuestionPayload
) {
  const { roomId, questionId, selectedIndex, timeMs } = payload;
  const room = getRoomState(roomId);
  
  if (!room) return;
  if (room.status !== "running") return;

  const question = room.currentQuestion;
  if (!question || question.id !== questionId) return;

  const player = room.players.get(clientId);
  if (!player || player.answeredCurrent) return;

  const isCorrect = selectedIndex === question.correctIndex;
  const elapsed = timeMs ?? (Date.now() - room.currentQuestionStart!);

  const points = computePoints(isCorrect, elapsed, question.timeLimitSeconds * 1000);
  if (isCorrect) player.score += points;

  player.answeredCurrent = true;

  wsServer.sendToClient(clientId, createMessage(MessageType.ANSWER_RESULT, {
    correct: isCorrect,
    points,
    correctIndex: question.correctIndex
  }));

  await broadcastLeaderboard(wsServer, mq, room);

  const allAnswered = listPlayers(room).every(p => p.answeredCurrent);
  if (allAnswered && room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
    
    setTimeout(() => {
      endQuestion(wsServer, mq, room);
    }, 1000);
  }
}

async function broadcastPlayers(
  wsServer: GameWebSocketServer, 
  mq: RabbitMQService, 
  room: RoomState
) {
  const players = listPlayers(room).map(p => ({
    playerId: p.playerId,
    displayName: p.displayName,
    score: p.score
  }));

  // Publicar no RabbitMQ para outros servidores
  await mq.publishRoomEvent(room.roomId, 'room:player_list', { players });
}

async function broadcastLeaderboard(
  wsServer: GameWebSocketServer, 
  mq: RabbitMQService, 
  room: RoomState
) {
  const leaderboard = listPlayers(room)
    .map(p => ({ playerId: p.playerId, displayName: p.displayName, score: p.score }))
    .sort((a, b) => b.score - a.score);

  // Publicar no RabbitMQ
  await mq.publishRoomEvent(room.roomId, 'game:leaderboard', { leaderboard });
}

async function broadcastHostChange(
  wsServer: GameWebSocketServer, 
  mq: RabbitMQService, 
  room: RoomState, 
  newHostClientId: string
) {
  const newHost = room.players.get(newHostClientId);
  if (!newHost) return;
  
  console.log(`[GameController] Host transferred to ${newHost.displayName} in room ${room.roomId}`);
  
  // Publicar no RabbitMQ
  await mq.publishRoomEvent(room.roomId, 'room:host_changed', {
    newHostPlayerId: newHost.playerId,
    newHostDisplayName: newHost.displayName
  });
  
  // Emitir localmente com informação de isHost para cada jogador
  for (const [clientId, player] of room.players) {
    wsServer.sendToClient(clientId, createMessage(MessageType.HOST_CHANGED, {
      newHostPlayerId: newHost.playerId,
      newHostDisplayName: newHost.displayName,
      isHost: clientId === newHostClientId
    }));
  }
}

async function finishGame(
  wsServer: GameWebSocketServer, 
  mq: RabbitMQService, 
  room: RoomState
) {
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

async function onDisconnect(
  wsServer: GameWebSocketServer, 
  mq: RabbitMQService, 
  clientId: string
) {
  console.log("[GameController] Client disconnected:", clientId);
  
  const roomManager = require("../services/roomManager");
  
  for (const room of roomManager.getAllRooms()) {
    if (room.players.has(clientId)) {
      const newHostClientId = removePlayer(room, clientId);
      console.log(`[GameController] Player removed from room ${room.roomId}`);
      
      if (newHostClientId) {
        await broadcastHostChange(wsServer, mq, room, newHostClientId);
      }
      
      await broadcastPlayers(wsServer, mq, room);
      
      if (room.players.size === 0) {
        // Unsubscribe do RabbitMQ
        if (room.rabbitMQQueue) {
          mq.unsubscribe(room.rabbitMQQueue).catch(err => 
            console.error('[GameController] Failed to unsubscribe:', err)
          );
        }
        
        roomManager.deleteRoom(room.roomId);
        console.log(`[GameController] Empty room ${room.roomId} deleted`);
      }
    }
  }
}