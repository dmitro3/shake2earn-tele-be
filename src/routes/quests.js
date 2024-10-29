import express from 'express';
import { claimDaily, getOverview } from '../controllers/quests.js';
import { basicMiddleware } from '../middleware/index.js';

export const questsRouter = express.Router();

questsRouter.use(basicMiddleware);
questsRouter.get('/overview', getOverview);
questsRouter.post('/claim-daily', claimDaily);