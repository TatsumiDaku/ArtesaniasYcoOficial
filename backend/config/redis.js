const Redis = require('ioredis');

// IMPORTANTE: Nunca expongas Redis a Internet. Usa firewalls y configura Redis para aceptar solo conexiones locales o de la red interna de Docker.
// La variable REDIS_URL debe ser secreta y nunca subirse a git.
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

redis.on('connect', () => {
  console.log('Conectado a Redis');
});
redis.on('error', (err) => {
  console.error('Error en la conexión de Redis:', err);
  console.error('Verifica que Redis NO esté expuesto a Internet y que REDIS_URL sea segura.');
});

module.exports = redis; 