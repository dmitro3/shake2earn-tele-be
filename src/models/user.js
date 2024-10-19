import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  telegramId: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
  referBy: String,
  point: {
    type: Number,
    default: 0,
  },
  lastAwardedAt: {
    type: Date,
    default: new Date(),
  }
});

export const User = mongoose.model('User', userSchema);