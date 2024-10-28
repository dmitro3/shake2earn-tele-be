import express from "express";
import { getShakeCount, updateShakeCount } from "../controllers/shake.js";

export const shakeRouter = express.Router();

// usersRouter.patch("/:telegramId/claim-refer", claimRefer);
shakeRouter.get("/:telegramId", getShakeCount);
shakeRouter.post("/:telegramId", updateShakeCount);
