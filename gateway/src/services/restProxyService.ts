import axios from "axios";

const REST_BASE = process.env.REST_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: REST_BASE,
  timeout: 5000
});

export default {
  // Users
  async createUser(body: any) {
    return api.post("/users", body).then(r => r.data);
  },
  async listUsers() {
    return api.get("/users").then(r => r.data);
  },
  async getUser(id: string) {
    return api.get(`/users/${id}`).then(r => r.data);
  },

  // Quizzes
  async createQuiz(body: any) {
    return api.post("/quizzes", body).then(r => r.data);
  },
  async listQuizzes() {
    return api.get("/quizzes").then(r => r.data);
  },
  async getQuiz(id: string) {
    return api.get(`/quizzes/${id}`).then(r => r.data);
  },

  // Rooms
  async createRoom(body: any) {
    return api.post("/rooms", body).then(r => r.data);
  },
  async listRooms() {
    return api.get("/rooms").then(r => r.data);
  },
  async getRoomById(id: string) {
    return api.get(`/rooms/${id}`).then(r => r.data);
  },
  async getRoomByCode(code: string) {
    return api.get(`/rooms/code/${code}`).then(r => r.data);
  }
};
