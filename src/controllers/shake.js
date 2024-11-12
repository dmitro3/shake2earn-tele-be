import { User } from "../models/user.js";
import shakeService from "../services/shake.js";
import { SHAKE_TIME, SHAKE_THRESHOLD, SHAKE_MAX } from "../constants/shake.js";

export const getShakeConfig = async (req, res) => {
  res.status(200).json({
    shakeTime: SHAKE_TIME,
    shakeThreshold: SHAKE_THRESHOLD,
    shakeMax: SHAKE_MAX,
  });
};

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

    const user = await shakeService.updateShakeCount(telegramId, count);

    res.status(200).json({ message: "Update shake count successfully", user });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const startShake = async (req, res) => {
  try {
    const { telegramId } = req;

    const session = await shakeService.startShake(telegramId);

    res.status(200).json({ message: "Shake successfully", data: session });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const endShake = async (req, res) => {
  try {
    const { sessionId, shakeIndex } = req;

    const session = await shakeService.endShake(sessionId, shakeIndex);

    res.status(200).json({ message: "End shake successfully", data: session });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
