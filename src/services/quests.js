import { ROOT_CHANNEL, ROOT_CHANNEL_LINK } from '../constants/channels.js';
import { DAILY_CLAIM_POINTS, INVITE_FRIEND_POINTS, JOIN_CHANNEL_POINTS } from '../constants/points.js';
import { DAILY_RESET_HOUR } from '../constants/times.js';
import { User } from '../models/user.js';
import "dotenv/config";
import axios from 'axios';

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
      pointsPerClaim: DAILY_CLAIM_POINTS,
      note: `You will receive ${DAILY_CLAIM_POINTS} points every day.`,
    },
    inviteFriend: {
      invitedFriendsCount,
      pointsPerInvite: INVITE_FRIEND_POINTS,
      note: `You will receive ${INVITE_FRIEND_POINTS} points for each friend you invite.`,
    },
    joinChannelQuest: {
      claimed: user.hasClaimedJoinChannelQuest,
      channel: ROOT_CHANNEL,
      channelTelegramLink: ROOT_CHANNEL_LINK,
      pointsPerClaim: JOIN_CHANNEL_POINTS,
      note: `You will receive ${JOIN_CHANNEL_POINTS} points for joining our channel.`,
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

  user.point += DAILY_CLAIM_POINTS; // Award points for daily quest
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

  user.point += JOIN_CHANNEL_POINTS;
  user.hasClaimedJoinChannelQuest = false;
  await user.save();

  return user.point;
};

// Function to check if user is a member of the channel
export const isUserInChannel = async (userId, channelUsername) => {
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
  return (
    status === 'member' ||
    status === 'administrator' ||
    status === 'creator'
  );
}