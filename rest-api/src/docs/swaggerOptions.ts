export const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: { title: "Kahoot-clone - REST API", version: "1.0.0" },
    servers: [{ url: "http://localhost:3001/api", description: "local" }]
  },
  apis: ["./src/controllers/*.ts"]
};
