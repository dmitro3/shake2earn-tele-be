import express from "express";
import { getUser, createUser } from "../controllers/users.js";

export const usersRouter = express.Router();

// usersRouter.patch("/:telegramId/claim-refer", claimRefer);
usersRouter.get("/:telegramId", getUser);
usersRouter.post("/", createUser);