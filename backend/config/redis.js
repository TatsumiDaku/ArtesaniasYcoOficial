const Redis = require('ioredis');

// Si REDIS_URL está definida (Docker, producción), úsala. Si no, usa localhost para desarrollo local.
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log('Conectado a Redis');
});
redis.on('error', (err) => {
  console.error('Error en la conexión de Redis:', err);
});

module.exports = redis; 