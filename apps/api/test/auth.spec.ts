import request from 'supertest';
import { registerAndLogin, cleanupTestData } from './utils';

describe('Auth', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const email = `test-${Date.now()}@example.com`;
      const res = await request('http://localhost:3002')
        .post('/api/auth/register')
        .send({ email, password: 'Test1234', name: 'Test User' })
        .expect(201);

      expect(res.body.message).toBe('Registered successfully');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const email = `dup-${Date.now()}@example.com`;
      await request('http://localhost:3002')
        .post('/api/auth/register')
        .send({ email, password: 'Test1234' })
        .expect(201);

      await request('http://localhost:3002')
        .post('/api/auth/register')
        .send({ email, password: 'Test1234' })
        .expect(409);
    });

    it('should reject weak password', async () => {
      await request('http://localhost:3002')
        .post('/api/auth/register')
        .send({ email: 'weak@example.com', password: '123' })
        .expect(400);
    });

    it('should reject invalid email', async () => {
      await request('http://localhost:3002')
        .post('/api/auth/register')
        .send({ email: 'not-email', password: 'Test1234' })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const email = `login-${Date.now()}@example.com`;
      await request('http://localhost:3002')
        .post('/api/auth/register')
        .send({ email, password: 'Test1234' })
        .expect(201);

      const res = await request('http://localhost:3002')
        .post('/api/auth/login')
        .send({ email, password: 'Test1234' })
        .expect(200);

      expect(res.body.message).toBe('Logged in successfully');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const email = `wrong-${Date.now()}@example.com`;
      await request('http://localhost:3002')
        .post('/api/auth/register')
        .send({ email, password: 'Test1234' })
        .expect(201);

      await request('http://localhost:3002')
        .post('/api/auth/login')
        .send({ email, password: 'WrongPass' })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request('http://localhost:3002')
        .post('/api/auth/login')
        .send({ email: 'nonexist@example.com', password: 'Test1234' })
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const { accessToken } = await registerAndLogin(`me-${Date.now()}@example.com`);

      const res = await request('http://localhost:3002')
        .get('/api/auth/me')
        .set('Cookie', `jwt=${accessToken}`)
        .expect(200);

      expect(res.body.id).toBeDefined();
      expect(res.body.email).toBeDefined();
      expect(res.body.passwordHash).toBeUndefined();
    });

    it('should reject without token', async () => {
      await request('http://localhost:3002')
        .get('/api/auth/me')
        .expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear cookie', async () => {
      const { accessToken } = await registerAndLogin(`logout-${Date.now()}@example.com`);

      const res = await request('http://localhost:3002')
        .post('/api/auth/logout')
        .set('Cookie', `jwt=${accessToken}`)
        .expect(200);

      expect(res.body.message).toBe('Logged out successfully');
      const cookie = res.headers['set-cookie'][0];
      expect(cookie).toContain('jwt=');
      expect(cookie).toContain('Expires=');
    });
  });
});