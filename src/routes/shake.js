import express from "express";
import {
  getShakeCount,
  updateShakeCount,
  startShake,
  endShake,
} from "../controllers/shake.js";
import { basicMiddleware, sessionMiddleware } from "../middleware/index.js";

export const shakeRouter = express.Router();

// usersRouter.patch("/:telegramId/claim-refer", claimRefer);
shakeRouter.use(basicMiddleware);
shakeRouter.get("/", basicMiddleware, getShakeCount);
shakeRouter.post("/", basicMiddleware, updateShakeCount);

shakeRouter.post("/start", startShake);
shakeRouter.post("/end", sessionMiddleware, endShake);
