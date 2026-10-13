const amqp = require('amqplib');

const ALERT_QUEUE = 'alert_emails';
let channel;

async function getChannel() {
  if (!channel) {
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertQueue(ALERT_QUEUE, { durable: true });
  }
  return channel;
}

async function publishAlert(message) {
  const ch = await getChannel();
  ch.sendToQueue(ALERT_QUEUE, Buffer.from(JSON.stringify(message)), { persistent: true });
}

module.exports = { ALERT_QUEUE, getChannel, publishAlert };
