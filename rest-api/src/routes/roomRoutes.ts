import { Router } from "express";
import * as roomCtrl from "../controllers/roomController";

const router = Router();
router.post("/", roomCtrl.createRoom);
router.get("/", roomCtrl.listRooms);
router.get("/:id", roomCtrl.getRoom);

export default router;