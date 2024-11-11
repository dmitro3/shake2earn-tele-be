import axios from 'axios';
import "dotenv/config";
import https from 'https';
import { ROOT_CHANNEL, ROOT_CHANNEL_LINK } from '../constants/channels.js';
import { DAILY_CLAIM_TURNS, INVITE_FRIEND_TURNS, JOIN_CHANNEL_TURNS } from '../constants/points.js';
import { DAILY_RESET_HOUR } from '../constants/times.js';
import { User } from '../models/user.js';
axios.defaults.timeout = 300000;
axios.defaults.httpsAgent = new https.Agent({ keepAlive: true });

// Helper function to get today's reset time
const getTodayResetTime = () => {
  const now = new Date();
  const todayReset = new Date(now);
  todayReset.setUTCHours(DAILY_RESET_HOUR, 0, 0, 0);
  return todayReset;
};

// Helper function to get the next reset time
const getNextResetTime = () => {
  const now = new Date();
  const nextReset = new Date(now);
  nextReset.setUTCHours(DAILY_RESET_HOUR, 0, 0, 0);
  if (now >= nextReset) {
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
  }
  return nextReset;
};

// Get an overview of the quests
export const getOverview = async (telegramId) => {
  const user = await User.findOne({ telegramId });
  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  const todayReset = getTodayResetTime();
  const nextReset = getNextResetTime();
  const dailyClaimed = user.lastAwardedAt >= todayReset;
  const timeToNextClaim = dailyClaimed ? nextReset - now : 0;

  const invitedFriendsCount = await User.countDocuments({ referBy: user.telegramId });

  return {
    point: user.point,
    shakeCount: user.shakeCount,
    lastAwardedAt: user.lastAwardedAt,
    dailyClaim: {
      claimed: dailyClaimed,
      timeToNextClaim,
      nextClaimAt: nextReset,
      turnsPerClaim: DAILY_CLAIM_TURNS,
      note: `You will receive ${DAILY_CLAIM_TURNS} shake turns every day.`,
    },
    inviteFriend: {
      invitedFriendsCount,
      turnsPerInvite: INVITE_FRIEND_TURNS,
      note: `You will receive ${INVITE_FRIEND_TURNS} shake turns for each friend you invite.`,
    },
    joinChannelQuest: {
      claimed: user.hasClaimedJoinChannelQuest,
      channel: ROOT_CHANNEL,
      channelTelegramLink: ROOT_CHANNEL_LINK,
      turnsPerClaim: JOIN_CHANNEL_TURNS,
      note: `You will receive ${JOIN_CHANNEL_TURNS} shake turns for joining our channel.`,
    },
  };
};

// Claim the daily quest
export const claimDaily = async (telegramId) => {
  const user = await User.findOne({ telegramId });
  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  const todayReset = getTodayResetTime();
  const nextReset = getNextResetTime();

  if (user.lastAwardedAt >= todayReset) {
    throw new Error('Daily quest already claimed');
  }

  user.point += DAILY_CLAIM_TURNS; // Award points for daily quest
  user.lastAwardedAt = now;
  await user.save();

  return user.point;
};

// Claim the channel quest
export const claimChannelQuest = async (telegramId, channelUsername) => {
  const user = await User.findOne({ telegramId });
  if (!user) {
    throw new Error('User not found');
  }

  if (user.hasClaimedJoinChannelQuest) {
    throw new Error('You have already claimed this quest');
  }

  const isMember = await isUserInChannel(telegramId, channelUsername);
  if (!isMember) {
    throw new Error(`You are not a member of the channel, please join our channel at ${ROOT_CHANNEL_LINK}`)
  }

  user.point += JOIN_CHANNEL_TURNS;
  user.hasClaimedJoinChannelQuest = true;
  await user.save();

  return user.point;
};

// Function to check if user is a member of the channel
export const isUserInChannel = async (userId, channelUsername) => {
  try {
    const token = process.env.BOT_TOKEN;

    // Make the request using axios
    const response = await axios.post(
      `https://api.telegram.org/bot${token}/getChatMember`,
      null,
      {
        params: {
          chat_id: `@${channelUsername}`,
          user_id: userId,
        },
      }
    );

    // Extract the status from the response
    const status = response.data.result?.status;
    console.log('Channel membership status:', status);
    return (
      status === 'member' ||
      status === 'administrator' ||
      status === 'creator'
    );
  } catch (error) {
    console.log('Channel membership status:', error);
    console.log('Error checking channel membership:', error.message);
    return false;
  }
}