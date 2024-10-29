import dotenv from 'dotenv';
import express from 'express';
import forge from 'node-forge';

dotenv.config(); // Load environment variables from .env file

const debugRouter = express.Router();

// Load the public key from the .env file
const publicKeyPem = process.env.PUBLIC_KEY;

if (!publicKeyPem) {
  throw new Error('PUBLIC_KEY is not defined in the environment variables');
}

const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

const encryptTelegramId = (telegramId) => {
  const encrypted = publicKey.encrypt(forge.util.encodeUtf8(telegramId), 'RSA-OAEP', {
    md: forge.md.sha256.create(),
  });
  return forge.util.encode64(encrypted);
};

debugRouter.get('/auth-header/:telegramId', (req, res) => {
  const { telegramId } = req.params;
  const encryptedTelegramId = encryptTelegramId(telegramId);
  res.send({ encryptedTelegramId });
});

export default debugRouter;