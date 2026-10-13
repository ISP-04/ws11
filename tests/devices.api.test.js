jest.mock('../src/config/prisma', () => ({}));
jest.mock('../src/config/redis', () => ({ getRedis: jest.fn() }));
jest.mock('../src/config/rabbitmq', () => ({ publishAlert: jest.fn() }));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

process.env.JWT_SECRET = 'test_secret';

describe('POST /api/devices/:id/commands', () => {
  test('no token -> 401', async () => {
    const res = await request(app).post('/api/devices/pico_01/commands').send({ command: 'reset' });
    expect(res.status).toBe(401);
  });

  test('invalid token -> 401/403', async () => {
    const fake = jwt.sign({ userId: 'x', role: 'admin' }, 'wrong_secret');
    const res = await request(app)
      .post('/api/devices/pico_01/commands')
      .set('Authorization', `Bearer ${fake}`)
      .send({ command: 'reset' });
    expect([401, 403]).toContain(res.status);
  });

  test('viewer -> 403, admin -> 202', async () => {
    const viewer = jwt.sign({ userId: 'v', role: 'viewer' }, 'test_secret');
    const admin = jwt.sign({ userId: 'a', role: 'admin' }, 'test_secret');
    const url = '/api/devices/pico_01/commands';
    const r1 = await request(app).post(url).set('Authorization', `Bearer ${viewer}`).send({ command: 'reset' });
    const r2 = await request(app).post(url).set('Authorization', `Bearer ${admin}`).send({ command: 'reset' });
    expect(r1.status).toBe(403);
    expect(r2.status).toBe(202);
  });
});
