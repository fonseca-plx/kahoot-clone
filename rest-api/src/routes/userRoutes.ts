import { Router } from "express";
import * as userCtrl from "../controllers/userController";

const router = Router();
router.post("/", userCtrl.createUser);
router.get("/", userCtrl.listUsers);
router.get("/:id", userCtrl.getUser);

export default router;
