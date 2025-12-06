import { Router } from "express";
import GatewayController from "../controllers/gatewayController";

const router = Router();

router.post("/", GatewayController.createRoom);
router.get("/", GatewayController.listRooms);
router.get("/code/:code", GatewayController.getRoomByCode);
router.get("/:id", GatewayController.getRoom);

export default router;
