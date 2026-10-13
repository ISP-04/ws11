const express = require('express');
const prisma = require('../config/prisma');
const { getRedis } = require('../config/redis');
const { publishAlert } = require('../config/rabbitmq');

const router = express.Router();

router.post('/', async (req, res) => {
  const { deviceId, voltage, current } = req.body || {};
  if (typeof deviceId !== 'string' || typeof voltage !== 'number' || typeof current !== 'number') {
    return res.status(400).json({ error: 'deviceId (string), voltage and current (number) are required' });
  }
  try {
    // Lab 5: บันทึกลง PostgreSQL
    const record = await prisma.telemetry.create({ data: { deviceId, voltage, current } });

    // Lab 5: อัปเดต cache ล่าสุด (ถ้า Redis ล่ม ไม่ให้ API ล่มตาม)
    try {
      const redis = await getRedis();
      await redis.set(`device:${deviceId}:latest_status`, JSON.stringify(record));
    } catch (err) {
      console.error('[cache] skip:', err.message);
    }

    // Lab 7: โยนงานแจ้งเตือนเข้าคิว ไม่รอผลการส่งอีเมล
    if (voltage > 250) {
      publishAlert({ deviceId, voltage, time: record.timestamp }).catch((err) =>
        console.error('[mq] publish failed:', err.message),
      );
    }
    return res.status(200).json(record);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
