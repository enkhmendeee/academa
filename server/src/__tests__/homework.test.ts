import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import { disconnect, resetDb } from './helpers';

async function registerUser(email: string, username: string) {
  const res = await request(app).post('/api/auth/register').send({
    email,
    password: 'password123',
    confirmPassword: 'password123',
    username,
  });
  expect(res.status).toBe(201);
  return {
    token: res.body.token as string,
    userId: res.body.user.id as number,
  };
}

describe('GET /api/homeworks', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await disconnect();
  });

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/homeworks');
    expect(res.status).toBe(401);
  });

  it("does not expose one user's homework to another user", async () => {
    const alice = await registerUser('alice@example.com', 'alice');
    const bob = await registerUser('bob@example.com', 'bob');

    const aliceCourse = await prisma.course.create({
      data: { name: 'CS101', userId: alice.userId },
    });

    const created = await request(app)
      .post('/api/homeworks')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({
        title: 'Problem Set 1',
        dueDate: '2026-05-01T00:00:00.000Z',
        courseId: aliceCourse.id,
      });
    expect(created.status).toBe(201);

    const bobView = await request(app)
      .get('/api/homeworks')
      .set('Authorization', `Bearer ${bob.token}`);
    expect(bobView.status).toBe(200);
    expect(bobView.body).toEqual([]);

    const aliceView = await request(app)
      .get('/api/homeworks')
      .set('Authorization', `Bearer ${alice.token}`);
    expect(aliceView.status).toBe(200);
    expect(aliceView.body).toHaveLength(1);
    expect(aliceView.body[0].title).toBe('Problem Set 1');
  });
});
