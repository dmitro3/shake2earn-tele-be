import { ROOT_CHANNEL } from '../constants/channels.js';
import { claimChannelQuest as claimChannelQuestService, claimDaily as claimDailyService, getOverview as getOverviewService } from '../services/quests.js';

// Get an overview of the quests
export const getOverview = async (req, res) => {
  try {
    const overview = await getOverviewService(req.telegramId);
    res.send(overview);
  } catch (error) {
    res.status(500).send({ message: 'Error getting overview', error: error.message });
  }
};

// Claim the daily quest
export const claimDaily = async (req, res) => {
  try {
    const point = await claimDailyService(req.telegramId);
    res.send({ message: 'Daily quest claimed', point });
  } catch (error) {
    res.status(500).send({ message: 'Error claiming daily quest', error: error.message });
  }
};

// Claim the channel quest
export const claimJoinChannel = async (req, res) => {
  try {
    const { channelUsername } = req.body;
    const point = await claimChannelQuestService(req.telegramId, channelUsername ?? ROOT_CHANNEL);
    res.send({ message: 'Claimed join channel quest', point });
  } catch (error) {
    res.status(500).send({ message: 'Error claiming channel quest', error: error.message });
  }
};