import { User } from "../models/user.js";

const getPoint = async (telegramId) => {
  try {
    const user = await User.findOne({ telegramId: telegramId });
    if (!user) {
      throw new Error("User not found");
    }

    const point = user.point;

    return point;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updatePoint = async (telegramId, point) => {
  try {
    const user = await User.findOne({ telegramId: telegramId });
    if (!user) {
      throw new Error("User not found");
    }

    user.point += point;
    await user.save();
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default { getPoint, updatePoint };
