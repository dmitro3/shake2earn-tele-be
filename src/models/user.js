import mongoose from "mongoose";
import { INIT_SHAKE_FOR_NEW_USER } from "../constants/shake.js";

export const userSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      unique: true, // Ensure telegramId is unique
      required: true,
    },
    userInfo: { type: Object }, // Save user info from telegram
    referBy: String,
    point: {
      type: Number,
      default: 0,
    },
    lastAwardedAt: {
      type: Date,
      default: new Date(0),
    },
    shakeCount: {
      type: Number,
      default: INIT_SHAKE_FOR_NEW_USER,
    },
    hasClaimedJoinChannelQuest: {
      type: Boolean,
      default: false,
    },
    isConnectedWallet: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Enable timestamps for this schema
  }
);

export const User = mongoose.model("User", userSchema);
