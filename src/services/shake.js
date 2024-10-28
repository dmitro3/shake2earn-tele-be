import { User } from "../models/user.js";

const getShakeCount = async (telegramId) => {
  try {
    const user = await User.findOne({ telegramId: telegramId });
    if (!user) {
      throw new Error("User not found");
    }

    const shakeCount = user.shakeCount;

    return shakeCount;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateShakeCount = async (telegramId, count) => {
  try {
    const user = await User.findOne({ telegramId: telegramId });
    if (!user) {
      throw new Error("User not found");
    }

    user.shakeCount += count;
    await user.save();
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default { getShakeCount, updateShakeCount };
