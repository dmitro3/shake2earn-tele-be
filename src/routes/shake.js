import express from "express";
import { getShakeCount, updateShakeCount } from "../controllers/shake.js";
import { basicMiddleware } from "../middleware/index.js";

export const shakeRouter = express.Router();

// usersRouter.patch("/:telegramId/claim-refer", claimRefer);
shakeRouter.use(basicMiddleware)
shakeRouter.get("/", getShakeCount);
shakeRouter.post("/", updateShakeCount);
