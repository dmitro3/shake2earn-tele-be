import express from "express";
import { getPoint, updatePoint } from "../controllers/point.js";
import { basicMiddleware } from "../middleware/index.js";

export const pointRouter = express.Router();

// usersRouter.patch("/:telegramId/claim-refer", claimRefer);
pointRouter.use(basicMiddleware);
pointRouter.get("/", getPoint);
pointRouter.post("/", updatePoint);
