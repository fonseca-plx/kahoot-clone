import { Router } from "express";
import usersRoutes from "./users.routes";
import quizzesRoutes from "./quizzes.routes";
import roomsRoutes from "./rooms.routes";

export const router = Router();

router.use("/users", usersRoutes);
router.use("/quizzes", quizzesRoutes);
router.use("/rooms", roomsRoutes);
