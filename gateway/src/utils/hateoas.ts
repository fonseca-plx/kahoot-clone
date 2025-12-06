export function makeRoomLinks(room: any, basePath = "/api") {
  return {
    self: { href: `${basePath}/rooms/${room.id}` },
    join: { href: `${basePath}/rooms/${room.code}/join`, method: "POST" },
    start: { href: `${basePath}/rooms/${room.id}/start`, method: "POST" }
  };
}

export function makeQuizLinks(quiz: any, basePath = "/api") {
  return {
    self: { href: `${basePath}/quizzes/${quiz.id}` }
  };
}

export function makeUserLinks(user: any, basePath = "/api") {
  return {
    self: { href: `${basePath}/users/${user.id}` }
  };
}
