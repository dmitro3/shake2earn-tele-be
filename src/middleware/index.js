import 'dotenv/config';
import forge from 'node-forge';
import { User } from '../models/user.js';

// Load private key from environment variable
const privateKeyPem = process.env.PRIVATE_KEY;

if (!privateKeyPem) {
  throw new Error('PRIVATE_KEY is not defined in the environment variables');
}

const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

export const basicMiddleware = async (req, res, next) => {
  const encryptedTelegramId = req.headers['x-shake-auth'];

  if (!encryptedTelegramId) {
    return res.status(400).send({
      message: 'Missing x-shake-auth header',
    });
  }

  try {
    const buffer = forge.util.decode64(encryptedTelegramId);
    const decryptedTelegramId = privateKey.decrypt(buffer, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
    });
    req.telegramId = decryptedTelegramId;
    req.user = await User.findOne({ telegramId: decryptedTelegramId });
    next();
  } catch (error) {
    return res.status(400).send({
      message: 'Invalid x-shake-auth header',
      error: error.message,
    });
  }
};