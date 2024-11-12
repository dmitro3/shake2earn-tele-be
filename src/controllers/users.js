import { User } from "../models/user.js";
import { claimAnniversary, claimRefer } from "../services/users.js";

export const getUser = async (req, res) => {
  try {
    const { telegramId } = req;
    let user = await User.findOne({ telegramId: telegramId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Process user anniversary if needed
    user = await claimAnniversary(user);

    // Send response with user data and config
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
