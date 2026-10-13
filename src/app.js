const express = require('express');
const authRoutes = require('./routes/auth');
const telemetryRoutes = require('./routes/telemetry');
const deviceRoutes = require('./routes/devices');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/devices', deviceRoutes);

// JSON ผิดรูปแบบ -> 400
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON' });
  return next(err);
});

module.exports = app;
