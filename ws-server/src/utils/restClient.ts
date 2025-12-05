import axios from "axios";

const REST_BASE = process.env.REST_API_URL || "http://localhost:3001/api";

export async function getRoom(idOrCode: string) {
  try {
    return (await axios.get(`${REST_BASE}/rooms/${idOrCode}`)).data.room;
  } catch {
    return null;
  }
}

export async function getQuiz(quizId: string) {
  try {
    return (await axios.get(`${REST_BASE}/quizzes/${quizId}`)).data.quiz;
  } catch {
    return null;
  }
}
