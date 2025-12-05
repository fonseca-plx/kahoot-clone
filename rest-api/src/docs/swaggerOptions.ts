import { tags } from "./tags";
import { schemas } from "./schemas";

export const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Kahoot Clone - REST API",
      version: "1.0.0",
      description: "REST API for a Kahoot-like quiz game system. Manage users, create quizzes with multiple-choice questions, and host game rooms where players can join and compete.",
      contact: {
        name: "API Support"
      }
    },
    servers: [
      {
        url: "http://localhost:3001/api",
        description: "Local development server"
      }
    ],
    tags,
    components: {
      schemas
    }
  },
  apis: ["./src/routes/*.ts"]
};
