import express from "express";
import {
  claimDaily,
  claimJoinChannel,
  getOverview,
  claimConnectWallet,
} from "../controllers/quests.js";
import { basicMiddleware } from "../middleware/index.js";

export const questsRouter = express.Router();

questsRouter.use(basicMiddleware);
questsRouter.get("/overview", getOverview);
questsRouter.post("/claim-daily", claimDaily);
questsRouter.post("/claim-join-channel", claimJoinChannel);
questsRouter.post("/claim-connect-wallet", claimConnectWallet);
