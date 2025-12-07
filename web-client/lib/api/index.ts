export { apiClient, extractData } from "./clients";
export { usersApi } from "./users";
export { quizzesApi } from "./quizzes";
export { roomsApi } from "./rooms";

// Export consolidado
export const api = {
  users: usersApi,
  quizzes: quizzesApi,
  rooms: roomsApi
};