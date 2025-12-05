import { Router } from "express";
import * as quizCtrl from "../controllers/quizController";

const router = Router();
router.post("/", quizCtrl.createQuiz);
router.get("/", quizCtrl.listQuizzes);
router.get("/:id", quizCtrl.getQuiz);

export default router;