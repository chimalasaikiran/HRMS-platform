require('dotenv').config();
const os = require('os');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDb } = require('./config/db');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

function lanIPv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return null;
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api', routes);

// 404 handler for unmatched routes
app.use((req, res, next) => {
  const { AppError } = require('./middleware/errorHandler');
  next(new AppError('NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

async function start() {
  await connectDb();
  const server = app.listen(PORT, HOST, () => {
    const ip = lanIPv4();
    console.log(`Dayflow API listening on ${HOST}:${PORT}`);
    console.log(`  Local:   http://localhost:${PORT}/api`);
    if (ip) console.log(`  Network: http://${ip}:${PORT}/api`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Kill the other process and retry.`);
      process.exit(1);
    }
    throw err;
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

module.exports = app;
