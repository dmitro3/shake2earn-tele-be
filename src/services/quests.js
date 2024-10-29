import { DAILY_CLAIM_POINTS, INVITE_FRIEND_POINTS } from '../constants/points.js';
import { DAILY_RESET_HOUR } from '../constants/times.js';
import { User } from '../models/user.js';

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