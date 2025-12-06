import axios from "axios";

const REST_BASE = process.env.REST_API_URL || "http://localhost:3001/api";

console.log(`[REST Client] Base URL: ${REST_BASE}`);

export async function getRoom(idOrCode: string) {
  try {
    const isUUID = idOrCode.includes("-");
    const endpoint = isUUID 
      ? `${REST_BASE}/rooms/${idOrCode}` 
      : `${REST_BASE}/rooms/code/${idOrCode}`;
    
    const response = await axios.get(endpoint);
    console.log(`[REST] Room fetched: ${idOrCode}`);
    return response.data.room;
  } catch (error: any) {
    console.error(`[REST] Error fetching room ${idOrCode}:`, error.message);
    return null;
  }
}

export async function getQuiz(quizId: string) {
  try {
    const response = await axios.get(`${REST_BASE}/quizzes/${quizId}`);
    console.log(`[REST] Quiz fetched: ${quizId}`);
    return response.data.quiz;
  } catch (error: any) {
    console.error(`[REST] Error fetching quiz ${quizId}:`, error.message);
    return null;
  }
}
