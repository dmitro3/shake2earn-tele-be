import express from "express";
import {
  getShakeCount,
  updateShakeCount,
  startShake,
  endShake,
  getShakeConfig,
} from "../controllers/shake.js";
import { basicMiddleware, sessionMiddleware } from "../middleware/index.js";

export const shakeRouter = express.Router();

shakeRouter.get("/config", getShakeConfig);

// usersRouter.patch("/:telegramId/claim-refer", claimRefer);
shakeRouter.use(basicMiddleware);
shakeRouter.get("/", getShakeCount);
shakeRouter.post("/", updateShakeCount);

shakeRouter.post("/start", startShake);
shakeRouter.post("/end", sessionMiddleware, endShake);
