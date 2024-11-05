import "dotenv/config";
import forge from "node-forge";
import { User } from "../models/user.js";

// Load private key from environment variable
const privateKeyPem = process.env.PRIVATE_KEY;

if (!privateKeyPem) {
  throw new Error("PRIVATE_KEY is not defined in the environment variables");
}

const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

export const basicMiddleware = async (req, res, next) => {
  const encryptedTelegramId = req.headers["x-shake-auth"];

  if (!encryptedTelegramId) {
    return res.status(400).send({
      message: "Missing x-shake-auth header",
    });
  }

  try {
    const buffer = forge.util.decode64(encryptedTelegramId);
    const decryptedTelegramId = privateKey.decrypt(buffer, "RSA-OAEP", {
      md: forge.md.sha256.create(),
    });
    req.telegramId = decryptedTelegramId;
    req.user = await User.findOne({ telegramId: decryptedTelegramId });
    next();
  } catch (error) {
    return res.status(400).send({
      message: "Invalid x-shake-auth header",
      error: error.message,
    });
  }
};

// Middleware to decrypt session data
export const sessionMiddleware = async (req, res, next) => {
  const { encryptedSessionData } = req.body;

  if (!encryptedSessionData) {
    return res.status(400).send({
      message: "Missing encryptedSessionData in request body",
    });
  }

  console.log("Encrypted Session Data:", encryptedSessionData);

  try {
    // Decode the Base64 encoded encrypted session data
    const buffer = forge.util.decode64(encryptedSessionData);

    // Decrypt the session data using the private key
    const decryptedSessionDataString = privateKey.decrypt(buffer, "RSA-OAEP", {
      md: forge.md.sha256.create(),
    });

    // Convert decrypted string back to an object if necessary
    const decryptedSessionData = JSON.parse(decryptedSessionDataString);

    console.log(
      "Decrypted Session Data (Object):",
      JSON.stringify(decryptedSessionData, null, 2)
    );

    // Extract values from the decrypted session data
    req.sessionId = decryptedSessionData.sessionId;
    req.shakeIndex = decryptedSessionData.shakeIndex;

    // Uncomment if you want to fetch user data based on telegramId
    // req.user = await User.findOne({ telegramId: decryptedSessionData.telegramId });

    return next();
  } catch (error) {
    console.error("Decryption error:", error);
    return res.status(400).send({
      message: "Invalid encryptedSessionData",
      error: error.message,
    });
  }
};
