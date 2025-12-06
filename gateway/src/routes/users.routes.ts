import { Router } from "express";
import GatewayController from "../controllers/gatewayController";

const router = Router();

router.post("/", GatewayController.createUser);
router.get("/", GatewayController.listUsers);
router.get("/:id", GatewayController.getUser);

export default router;
