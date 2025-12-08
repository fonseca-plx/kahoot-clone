export { apiClient, extractData, extractDataOnly } from "./clients";
import { usersApi } from "./users";
import { quizzesApi } from "./quizzes";
import { roomsApi } from "./rooms";

export const api = {
  users: usersApi,
  quizzes: quizzesApi,
  rooms: roomsApi
};