const express = require('express');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient;

async function initRedis() {
  try {
    redisClient = redis.createClient({ url: REDIS_URL });
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Redis connection error:', error);
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Docker Compose with caching!' });
});

app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    redis: 'disconnected'
  };

  if (redisClient && redisClient.isOpen) {
    health.redis = 'connected';
  }

  res.json(health);
});

app.get('/counter', async (req, res) => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      throw new Error('Redis not connected');
    }

    const count = await redisClient.incr('visit_counter');
    res.json({ visits: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

initRedis().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
