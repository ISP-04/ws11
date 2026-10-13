require('dotenv').config();
const amqp = require('amqplib');

const QUEUE = 'alert_emails';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function start() {
  // รอ RabbitMQ พร้อม (retry) กันกรณีบูตพร้อมกันใน Docker Compose
  let conn;
  for (let i = 1; !conn; i += 1) {
    try {
      conn = await amqp.connect(process.env.RABBITMQ_URL);
    } catch {
      console.log(`[worker] waiting for RabbitMQ (${i})...`);
      await sleep(3000);
    }
  }
  const ch = await conn.createChannel();
  await ch.assertQueue(QUEUE, { durable: true });
  ch.prefetch(1); // รับทีละงาน -> กระจายงานแบบ round-robin
  console.log('[worker] waiting for messages...');

  ch.consume(QUEUE, async (msg) => {
    const alert = JSON.parse(msg.content.toString());
    console.log(`[x] Received Alert from ${alert.deviceId} (${alert.voltage}V). Sending email to admin...`);
    await sleep(3000); // จำลอง SMTP
    console.log('[v] Email sent successfully!');
    ch.ack(msg);
  });
}

start();
