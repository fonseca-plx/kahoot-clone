import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { router } from "./routes";
import { swaggerOptions } from "./docs/swaggerOptions";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api", router);

// Swagger
const specs = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("API Gateway rodando na porta " + PORT);
  console.log(`Documentação: http://localhost:${PORT}/docs`);
});
