import { ROOT_CHANNEL } from "../constants/channels.js";
import {
  claimChannelQuest as claimChannelQuestService,
  claimDaily as claimDailyService,
  getOverview as getOverviewService,
  claimConnectWallet as claimConnectWalletService,
} from "../services/quests.js";

// Get an overview of the quests
export const getOverview = async (req, res) => {
  try {
    const overview = await getOverviewService(req.telegramId);
    res.send(overview);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting overview", error: error.message });
  }
};

// Claim the daily quest
export const claimDaily = async (req, res) => {
  try {
    const turns = await claimDailyService(req.telegramId);
    res.send({ message: "Daily quest claimed", turns });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error claiming daily quest", error: error.message });
  }
};

// Claim the channel quest
export const claimJoinChannel = async (req, res) => {
  try {
    const { channelUsername } = req.body;
    const point = await claimChannelQuestService(
      req.telegramId,
      channelUsername ?? ROOT_CHANNEL
    );
    res.send({ message: "Claimed join channel quest", point });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error claiming channel quest", error: error.message });
  }
};

// Claim the connected TON wallet quest
export const claimConnectWallet = async (req, res) => {
  try {
    const tonProof = req.body;

    const point = await claimConnectWalletService(req.telegramId, tonProof);
    res.send({ message: "Claimed connect wallet quest", point });
  } catch (error) {
    res.status(500).send({
      message: "Error claiming connect wallet quest",
      error: error.message,
    });
  }
};
