import { User } from "../models/user.js";
import { Session } from "../models/session.js";
import { SHAKE_MAX, SHAKE_TIME } from "../constants/shake.js";
import { startSession } from "mongoose"; // Import the necessary mongoose methods

const getShakeCount = async (telegramId) => {
  try {
    const user = await User.findOne({ telegramId: telegramId });
    if (!user) {
      throw new Error("User not found");
    }

    const shakeCount = user.shakeCount;

    return shakeCount;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateShakeCount = async (telegramId, count) => {
  try {
    const user = await User.findOne({ telegramId: telegramId });
    if (!user) {
      throw new Error("User not found");
    }

    user.shakeCount += count;
    await user.save();
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const startShake = async (telegramId) => {
  const session = await startSession(); // Start a session
  session.startTransaction(); // Begin the transaction

  try {
    // Checking and minus shake turn
    const user = await User.findOne({ telegramId: telegramId }).session(
      session
    ); // Use the transaction session
    if (!user) {
      throw new Error("User not found");
    }

    if (user.shakeCount <= 0) {
      throw new Error("No shake turn left");
    }

    // Check session is shaking
    let existingSession = await Session.findOne({
      telegramId: telegramId,
    }).session(session);
    if (existingSession) {
      console.log(existingSession.createdAt.getTime() + SHAKE_TIME * 1000 * 2);
      if (
        existingSession.createdAt.getTime() + SHAKE_TIME * 1000 * 2 <
        Date.now()
      ) {
        // Delete session
        await existingSession.deleteOne({ session }); // Ensure to use the session here
      } else {
        throw new Error("Session is shaking");
      }
    }

    // Minus shake turn
    user.shakeCount -= 1;
    await user.save({ session }); // Save the user with the transaction session

    // Handling logic shaking
    const shakePoint = randomShakePoint();
    const shakeTurn = randomShakeTurn();
    const shakeResult = randomShakeResult();

    // Create new session for shake
    const newSession = await Session.create(
      [
        {
          telegramId: telegramId,
          expectedPoint: shakePoint,
          expectedTurn: shakeTurn,
          expectedResult: shakeResult,
        },
      ],
      { session }
    ); // Create the session within the transaction

    await session.commitTransaction(); // Commit the transaction
    session.endSession(); // End the session

    return newSession;
  } catch (error) {
    await session.abortTransaction(); // Abort the transaction in case of an error
    session.endSession(); // End the session
    console.log(error);
    throw error;
  }
};

const endShake = async (sessionId, shakeIndex) => {
  const session = await startSession(); // Start a new session
  session.startTransaction(); // Begin the transaction

  try {
    const shakeSession = await Session.findOne({ _id: sessionId }).session(
      session
    );
    if (!shakeSession) {
      throw new Error("Session not found");
    }

    // Check created session is timeout with x2 time for shake
    if (shakeSession.createdAt.getTime() + SHAKE_TIME * 1000 * 2 < Date.now()) {
      // Delete session
      await shakeSession.deleteOne({ session }); // Use the session here
      throw new Error("Session timeout");
    }

    // Slice from 0 to shakeIndex in point, turn, result
    const results = shakeSession.expectedResult.slice(0, shakeIndex);
    const points = shakeSession.expectedPoint.slice(0, shakeIndex);
    const turns = shakeSession.expectedTurn.slice(0, shakeIndex);

    // Calculate total point
    const totalPoint = points.reduce((acc, point, index) => {
      if (results[index] === 0) {
        return acc + point;
      }
      return acc;
    }, 0);

    // Calculate total turn if index is 1
    const totalTurn = turns.reduce((acc, turn, index) => {
      if (results[index] === 1) {
        return acc + turn;
      }
      return acc;
    }, 0);

    // Update new point and turn for user
    const user = await User.findOne({
      telegramId: shakeSession.telegramId,
    }).session(session); // Use the session here

    user.point += totalPoint;
    user.shakeCount += totalTurn;

    await user.save({ session }); // Save user with the transaction session

    // Delete session
    await shakeSession.deleteOne({ session }); // Ensure to use the session here

    await session.commitTransaction(); // Commit the transaction
    session.endSession(); // End the session

    return { totalPoint, totalTurn, user };
  } catch (error) {
    await session.abortTransaction(); // Abort the transaction in case of an error
    session.endSession(); // End the session
    console.log(error);
    throw error;
  }
};

// Generate an array with a specified length, each a random integer between 1 and 5
const randomShakePoint = (length = SHAKE_MAX) => {
  return Array.from({ length }, () => Math.floor(Math.random() * 5) + 1);
};

// Generate an array with a specified length, each element being 1
const randomShakeTurn = (length = SHAKE_MAX) => {
  return new Array(length).fill(1);
};

// Generate an array of specified length with 80% chance for 0 and 20% chance for 1
const randomShakeResult = (length = SHAKE_MAX) => {
  const countOfOnes = Math.floor(length * 0.2); // 20% of total length
  const countOfZeros = length - countOfOnes; // Remaining for 0s

  // Create an array with the required counts of `0`s and `1`s
  const result = new Array(countOfZeros)
    .fill(0)
    .concat(new Array(countOfOnes).fill(1));

  // Shuffle the array using Fisher-Yates algorithm
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

export default { getShakeCount, updateShakeCount, startShake, endShake };
