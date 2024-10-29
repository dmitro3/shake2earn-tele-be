import express from "express";
import { createUser, getUser } from "../controllers/users.js";
import { basicMiddleware } from "../middleware/index.js";

export const usersRouter = express.Router();

// usersRouter.patch("/:telegramId/claim-refer", claimRefer);
usersRouter.get("/", basicMiddleware, getUser);
usersRouter.post("/", createUser);
