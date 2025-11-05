// backend/src/tests/auth.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';
import { errorHandler } from '../middleware/errorHandler';
import User from '../models/User';

// Mock the sendEmail utility
jest.mock('../utils/sendEmail', () => ({
  __esModule: true,
  // fix: Explicitly type the resolved value as void to prevent type inference issues with 'never'.
  default: jest.fn().mockResolvedValue(undefined as void),
}));


const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

// Set a dummy JWT_SECRET for testing
process.env.JWT_SECRET = 'testsecret';

describe('Auth Routes', () => {

  const userData = {
    fullName: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123',
  };

  beforeEach(async () => {
      // Clear all users before each test
      await User.deleteMany({});
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.email).toBe(userData.email);

      const userInDb = await User.findOne({ email: userData.email });
      expect(userInDb).not.toBeNull();
    });

    it('should return 400 if user already exists', async () => {
      await User.create(userData); // pre-populate user

      const res = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User already exists');
    });

     it('should return 400 for invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ ...userData, password: 'weak' });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user to login with
      await request(app).post('/api/auth/signup').send(userData);
    });

    it('should login an existing user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: userData.email,
          password: userData.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should return 401 for incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: userData.email,
          password: 'WrongPassword123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });

     it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'nouser@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});