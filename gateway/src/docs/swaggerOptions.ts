import { Options } from "swagger-jsdoc";

export const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "API Gateway - Quiz Realtime Game",
      version: "1.0.0",
      description: "Gateway responsável por integrar REST e WebSocket"
    },
    servers: [
      { url: "http://localhost:3000/api" }
    ]
  },
  apis: ["./src/routes/*.ts"]
};
