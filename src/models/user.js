import mongoose from "mongoose";

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
      default: new Date(),
    },
    shakeCount: {
      type: Number,
      default: 0,
    },
    hasClaimedJoinChannelQuest: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Enable timestamps for this schema
  }
);

export const User = mongoose.model("User", userSchema);
