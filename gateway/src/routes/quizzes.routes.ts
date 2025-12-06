import { Router } from "express";
import GatewayController from "../controllers/gatewayController";

const router = Router();

router.post("/", GatewayController.createQuiz);
router.get("/", GatewayController.listQuizzes);
router.get("/:id", GatewayController.getQuiz);

export default router;
