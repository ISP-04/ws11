jest.mock('../src/config/prisma', () => ({ user: { findUnique: jest.fn(), create: jest.fn() } }));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../src/config/prisma');
const { login } = require('../src/services/authService');

process.env.JWT_SECRET = 'test_secret';

describe('login (mocked DB)', () => {
  test('success: returns a valid JWT', async () => {
    const passwordHash = await bcrypt.hash('mysecretpassword', 4);
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', username: 'admin1', passwordHash, role: 'admin' });

    const token = await login('admin1', 'mysecretpassword');

    const payload = jwt.verify(token, 'test_secret');
    expect(payload).toMatchObject({ userId: 'u1', role: 'admin' });
  });

  test('failure: user not found -> Invalid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(login('ghost', 'x')).rejects.toThrow('Invalid credentials');
  });
});
