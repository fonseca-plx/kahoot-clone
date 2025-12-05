import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import quizRoutes from "./routes/quizRoutes";
import roomRoutes from "./routes/roomRoutes";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { swaggerOptions } from "./docs/swaggerOptions";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/rooms", roomRoutes);

const specs = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`REST API rodando na porta ${PORT}`));
