const express = require('express');
const prisma = require('../config/prisma');
const { getRedis } = require('../config/redis');
const { authenticate, requireRole } = require('../middlewares/auth');

const router = express.Router();

// Lab 5 (Cache-Aside) + Lab 6 (ต้อง login)
router.get('/:id/status', authenticate, async (req, res) => {
  const key = `device:${req.params.id}:latest_status`;
  let redis = null;
  try {
    redis = await getRedis();
    const cached = await redis.get(key);
    if (cached) return res.json({ source: 'cache', data: JSON.parse(cached) });
  } catch (err) {
    console.error('[cache] fallback to DB:', err.message);
    redis = null;
  }
  try {
    const latest = await prisma.telemetry.findFirst({
      where: { deviceId: req.params.id },
      orderBy: { timestamp: 'desc' },
    });
    if (!latest) return res.status(404).json({ error: 'Device not found' });
    if (redis) await redis.set(key, JSON.stringify(latest)).catch(() => {});
    return res.json({ source: 'database', data: latest });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Lab 6: ต้องเป็น admin เท่านั้น
router.post('/:id/commands', authenticate, requireRole('admin'), (req, res) => {
  const { command } = req.body || {};
  if (command !== 'reset') return res.status(400).json({ error: 'Unsupported command' });
  return res.status(202).json({ deviceId: req.params.id, command, status: 'accepted' });
});

module.exports = router;
