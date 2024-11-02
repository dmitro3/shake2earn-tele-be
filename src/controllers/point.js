import { User } from "../models/user.js";
import pointService from "../services/point.js";

export const getPoint = async (req, res) => {
  try {
    const { telegramId } = req;
    let user = await User.findOne({ telegramId: telegramId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const point = await pointService.getPoint(telegramId);

    res.status(200).json({ message: "Get point successfully", user, point });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updatePoint = async (req, res) => {
  try {
    const { telegramId } = req;

    const { point } = req.body;

    const user = await pointService.updatePoint(telegramId, point);

    res.status(200).json({ message: "Update point successfully", user });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
