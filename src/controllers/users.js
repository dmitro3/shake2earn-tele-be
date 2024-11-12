import { User } from "../models/user.js";
import { claimAnniversary, claimRefer } from "../services/users.js";
import { SHAKE_TIME, SHAKE_THRESHOLD, SHAKE_MAX } from "../constants/shake.js";

export const getUser = async (req, res) => {
  try {
    const { telegramId } = req;
    let user = await User.findOne({ telegramId: telegramId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user = await claimAnniversary(user);

    // get config
    const config = {
      shakeTime: SHAKE_TIME,
      shakeThreshold: SHAKE_THRESHOLD,
      shakeMax: SHAKE_MAX,
    };

    res.status(200).json({ user, config });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  const { telegramId } = req.body;
  console.log(req.body);
  const existingUser = await User.findOne({ telegramId: telegramId });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  try {
    let newUser = await User.create({
      telegramId: telegramId,
    });
    const { referBy } = req.body;
    if (referBy && telegramId != referBy) {
      try {
        newUser = await claimRefer(telegramId, referBy);
      } catch (error) {
        // DO NOTHING
      }
    }
    res.status(201).json(newUser);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
