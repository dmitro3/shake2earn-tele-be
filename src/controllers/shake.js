import { User } from "../models/user.js";
import shakeService from "../services/shake.js";

export const getShakeCount = async (req, res) => {
  try {
    const { telegramId } = req;
    let user = await User.findOne({ telegramId: telegramId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const shakeCount = await shakeService.getShakeCount(telegramId);

    res
      .status(200)
      .json({ message: "Get shake count successfully", user, shakeCount });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateShakeCount = async (req, res) => {
  try {
    const { telegramId } = req;
    const { count } = req.body;
    const user = await shakeService.updateShakeCount({
      message: "Update shake count successfully",
      telegramId,
      count,
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
