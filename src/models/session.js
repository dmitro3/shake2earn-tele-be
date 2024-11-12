import mongoose from "mongoose";
import { SHAKE_MAX } from "../constants/shake.js";

const sessionSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      unique: true, // Ensure telegramId is unique
      required: true,
    },
    expectedResult: {
      type: [Number], // 0: point, 1: turn
      validate: {
        validator: (arr) => arr.length == SHAKE_MAX,
        message: "Expected results array cannot exceed 72 items.",
      },
    },
    expectedPoint: {
      type: [Number],
      validate: {
        validator: (arr) => arr.length == SHAKE_MAX,
        message: "Expected points array cannot exceed 72 items.",
      },
    },
    expectedTurn: {
      type: [Number],
      validate: {
        validator: (arr) => arr.length == SHAKE_MAX,
        message: "Expected shakes array cannot exceed 72 items.",
      },
    },
  },
  {
    timestamps: true, // Enables createdAt and updatedAt fields
  }
);

export const Session = mongoose.model("Session", sessionSchema);
