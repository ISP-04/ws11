const { createClient } = require('redis');

let client;

// เชื่อมต่อแบบ lazy: ต่อครั้งแรกเมื่อถูกเรียกใช้
async function getRedis() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => console.error('[redis]', err.message));
    await client.connect();
  }
  return client;
}

module.exports = { getRedis };
