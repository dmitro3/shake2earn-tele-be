import express from "express";
import { generatePayload, checkProof } from "../controllers/ton.js";

export const tonRouter = express.Router();

tonRouter.post("/gen-payload", generatePayload);
tonRouter.post("/check-proof", checkProof);
