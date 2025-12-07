export function makeRoomLinks(room: any, wsUrl: string) {
  return {
    self: { 
      href: `/api/rooms/${room.id}`, 
      method: "GET" 
    },
    byCode: { 
      href: `/api/rooms/code/${room.code}`, 
      method: "GET",
      description: "Get room by join code"
    },
    websocket: {
      url: wsUrl,
      events: {
        join: {
          event: "room:join",
          payload: { code: room.code, displayName: "string" },
          description: "Connect to WebSocket and join room"
        },
        start: {
          event: "host:start",
          payload: { roomId: room.id },
          description: "Start the game (host only)"
        }
      }
    },
    quiz: {
      href: `/api/quizzes/${room.quizId}`,
      method: "GET",
      description: "Get quiz details"
    }
  };
}

export function makeQuizLinks(quiz: any) {
  return {
    self: { 
      href: `/api/quizzes/${quiz.id}`, 
      method: "GET" 
    },
    createRoom: {
      href: `/api/rooms`,
      method: "POST",
      payload: { quizId: quiz.id, title: "optional" },
      description: "Create a room for this quiz"
    }
  };
}

export function makeUserLinks(user: any) {
  return {
    self: { 
      href: `/api/users/${user.id}`, 
      method: "GET" 
    },
    quizzes: {
      href: `/api/quizzes?authorId=${user.id}`,
      method: "GET",
      description: "List quizzes by this author"
    }
  };
}
