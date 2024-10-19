import { User } from "../models/user.js";

export const claimRefer = async (telegramId, referBy) => {
  try {
    const user = await User.findOneAndUpdate(
      { telegramId: telegramId },
      { $inc: { point: 1 }, referBy: referBy },
      { new: true }
    );
    await User.findOneAndUpdate(
      { telegramId: referBy },
      { $inc: { point: 1 } },
      { new: true }
    );
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const claimAnniversary = async (user) => {
  try {
    const creationDate = user.createdAt;
    const lastAwarded  = user.lastAwardedAt;
    const today = new Date();

    if (today.getDate() === creationDate.getDate() && today.getMonth() === creationDate.getMonth()) {
      // Ensure points haven't been awarded this year
      if (lastAwarded.getFullYear() < today.getFullYear()) {
        user = await User.findOneAndUpdate(
          { telegramId: user.telegramId },
          { $inc: { point: 1 }, lastAwardedAt: today },
          { new: true }
        );
      }
    }

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}