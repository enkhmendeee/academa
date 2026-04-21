import request from 'supertest';
import app from '../app';
import { disconnect, resetDb } from './helpers';

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await disconnect();
  });

  it('creates a user and returns a token with valid payload', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'alice@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
      username: 'alice',
    });

    expect(res.status).toBe(201);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user).toMatchObject({
      email: 'alice@example.com',
      username: 'alice',
    });
  });

  it('rejects when confirmPassword does not match password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'alice@example.com',
      password: 'secret123',
      confirmPassword: 'different',
      username: 'alice',
    });

    expect(res.status).toBe(400);
  });

  it('rejects a duplicate email', async () => {
    const payload = {
      email: 'alice@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
      username: 'alice',
    };
    const first = await request(app).post('/api/auth/register').send(payload);
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/auth/register')
      .send({ ...payload, username: 'alice2' });
    expect(second.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  const credentials = {
    email: 'alice@example.com',
    password: 'secret123',
  };

  beforeEach(async () => {
    await resetDb();
    await request(app)
      .post('/api/auth/register')
      .send({ ...credentials, confirmPassword: credentials.password, username: 'alice' });
  });

  afterAll(async () => {
    await disconnect();
  });

  it('returns a token for valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send(credentials);

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.email).toBe(credentials.email);
  });

  it('returns 401 for a wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: credentials.email,
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
  });
});
