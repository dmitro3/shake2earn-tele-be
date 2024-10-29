import dotenv from 'dotenv';
import express from 'express';
import forge from 'node-forge';
import request from 'supertest';
import { basicMiddleware } from '../middleware/index.js';
import { User } from '../models/user.js'; // Adjust the import path as needed

dotenv.config(); // Load environment variables from .env file

jest.mock('../models/user.js'); // Adjust the import path as needed

// Load the public key from the .env file
const publicKeyPem = process.env.PUBLIC_KEY;

if (!publicKeyPem) {
  throw new Error('PUBLIC_KEY is not defined in the environment variables');
}

console.log('Loaded PUBLIC_KEY:', publicKeyPem);

const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
console.log('Parsed Public Key:', publicKey);

const encryptTelegramId = (telegramId) => {
  const encrypted = publicKey.encrypt(forge.util.encodeUtf8(telegramId), 'RSA-OAEP', {
    md: forge.md.sha256.create(),
  });
  return forge.util.encode64(encrypted);
};

describe('basicMiddleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(basicMiddleware);
    app.get('/test', (req, res) => {
      res.status(200).send({ telegramId: req.telegramId, user: req.user });
    });
  });

  it('should decrypt telegramId and attach it to the request object', async () => {
    const mockTelegramId = '123456789';
    const mockEncryptedTelegramId = encryptTelegramId(mockTelegramId);
    const mockUser = { telegramId: mockTelegramId, name: 'Test User' };

    // Mock the User.findOne method
    User.findOne.mockResolvedValue(mockUser);

    const response = await request(app)
      .get('/test')
      .set('x-shake-auth', mockEncryptedTelegramId);

    expect(response.status).toBe(200);
    expect(response.body.telegramId).toBe(mockTelegramId);
    expect(response.body.user).toEqual(mockUser);
  });

  it('should return 400 if x-shake-auth header is missing', async () => {
    const response = await request(app).get('/test');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Missing x-shake-auth header');
  });

  it('should return 400 if x-shake-auth header is invalid', async () => {
    const mockEncryptedTelegramId = 'invalidEncryptedTelegramId'
    const response = await request(app)
      .get('/test')
      .set('x-shake-auth', mockEncryptedTelegramId);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid x-shake-auth header');
  });
});