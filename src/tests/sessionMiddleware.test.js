import dotenv from "dotenv";
import express from "express";
import forge from "node-forge";
import request from "supertest";
import { sessionMiddleware } from "../middleware/index.js";
import { Session } from "../models/session.js"; // Adjust the import path as needed

dotenv.config(); // Load environment variables from .env file

// jest.mock("../models/user.js"); // Adjust the import path as needed

// Load the public key from the .env file
const publicKeyPem = process.env.PUBLIC_KEY;

if (!publicKeyPem) {
  throw new Error("PUBLIC_KEY is not defined in the environment variables");
}

console.log("Loaded PUBLIC_KEY:", publicKeyPem);

const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
console.log("Parsed Public Key:", publicKey);

// const encryptSessionId = (sessionId, shakeIndex) => {
//   const encrypted = publicKey.encrypt(
//     forge.util.encodeUtf8({ sessionId, shakeIndex }),
//     "RSA-OAEP",
//     {
//       md: forge.md.sha256.create(),
//     }
//   );
//   return forge.util.encode64(encrypted);
// };

// Example usage
// const sessionId = "6729e9edca6f4e41852125fc"; // Replace with your actual session ID
// const shakeIndex = 10; // Replace with your actual shake index
// const encryptedSessionId = encryptSessionId(sessionId, shakeIndex);

// console.log("Encrypted Session ID:", encryptedSessionId);

export const encryptSessionData = (data, publicKey) => {
  const jsonData = JSON.stringify(data); // Convert the object to a JSON string
  const encrypted = publicKey.encrypt(
    forge.util.encodeUtf8(jsonData),
    "RSA-OAEP",
    {
      md: forge.md.sha256.create(),
    }
  );
  return forge.util.encode64(encrypted); // Return Base64-encoded encrypted data
};

// Example usage for encrypting JSON data
const exampleSessionData = {
  sessionId: "6729ede733c9efbd878a84c2",
  shakeIndex: 42,
};
const encryptedData = encryptSessionData(exampleSessionData, publicKey);
console.log("Encrypted Data:", encryptedData);

// describe("sessionMiddleware", () => {
//   let app;

//   beforeEach(() => {
//     app = express();
//     app.use(express.json());
//     app.use(sessionMiddleware);
//     app.get("/test", (req, res) => {
//       res
//         .status(200)
//         .send({ sessionId: req.sessionId, shakeIndex: req.shakeIndex });
//     });
//   });

//   it("should decrypt telegramId and attach it to the request object", async () => {
//     const mockSessionId = "6729e9edca6f4e41852125fc";
//     const mockShakeIndex = 10;
//     const mockEncryptedSessionId = encryptSessionId(
//       mockSessionId,
//       mockShakeIndex
//     );
//     // const mockUser = { telegramId: mockTelegramId, name: "Test User" };

//     // Mock the User.findOne method
//     User.findOne.mockResolvedValue(mockUser);

//     const response = await request(app)
//       .get("/test")
//       .set("x-shake-auth", mockEncryptedSessionId);

//     expect(response.status).toBe(200);
//     expect(response.body.telegramId).toBe(mockTelegramId);
//     // expect(response.body.user).toEqual(mockUser);
//   });

//   it("should return 400 if x-shake-auth header is missing", async () => {
//     const response = await request(app).get("/test");

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe("Missing x-shake-auth header");
//   });

//   it("should return 400 if x-shake-auth header is invalid", async () => {
//     const mockEncryptedTelegramId = "invalidEncryptedTelegramId";
//     const response = await request(app)
//       .get("/test")
//       .set("x-shake-auth", mockEncryptedTelegramId);

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe("Invalid x-shake-auth header");
//   });
// });
