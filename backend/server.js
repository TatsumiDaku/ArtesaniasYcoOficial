const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
require('dotenv').config();
const pool = require('./config/database');
const cluster = require('cluster');
const os = require('os');

// Rutas (se crearán posteriormente)
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart');
const categoryRoutes = require('./routes/categories');
const statsRoutes = require('./routes/stats');
const favoritesRoutes = require('./routes/favorites');
const shopsRoutes = require('./routes/shops');
const blogsRoutes = require('./routes/blogs');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

if (cluster.isMaster) {
  const numCPUs = process.env.CLUSTER_CPUS ? parseInt(process.env.CLUSTER_CPUS, 10) : os.cpus().length;
  console.log(`🧑‍💻 Proceso master PID ${process.pid} - Iniciando cluster con ${numCPUs} CPUs`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️ Worker ${worker.process.pid} terminó. Reiniciando...`);
    cluster.fork();
  });
} else {
  // Middleware de seguridad
  app.use(helmet());
  app.use(compression());
  app.use(morgan('combined'));

  // Rate limiting - más permisivo en desarrollo
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 2400 : 4000, // duplicado: 2400 en prod, 4000 en dev
    message: {
      error: 'Demasiadas peticiones, por favor intenta de nuevo más tarde.',
      retryAfter: '15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Middleware
  app.use(cors({
    origin: [
      'https://artesaniasyco.com',
      'https://www.artesaniasyco.com',
      'http://localhost:3000'
    ],
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Middleware CORS específico para archivos estáticos en /uploads
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });
  app.use('/uploads', express.static('uploads'));

  // Rutas (se activarán cuando existan los archivos)
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api/shops', shopsRoutes);
  app.use('/api/blogs', blogsRoutes);

  // Ruta de salud
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      rateLimit: process.env.NODE_ENV === 'production' ? '2400 requests/15min' : '4000 requests/15min'
    });
  });

  // Manejo de errores
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'production' ? {} : err.stack
    });
  });

  // Ruta 404
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
  });

  // Al iniciar el servidor, probar la conexión a la base de datos y mostrar el estado
  app.listen(PORT, async () => {
    console.log(`🚀 Worker PID ${process.pid} corriendo en puerto ${PORT}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🚀 Rate Limit: ${process.env.NODE_ENV === 'production' ? '2400 requests/15min' : '4000 requests/15min'}`);
    try {
      await pool.query('SELECT 1');
      console.log('✅ Conexión a la base de datos PostgreSQL exitosa');
    } catch (err) {
      console.error('❌ Error al conectar con la base de datos PostgreSQL:', err.message);
    }
    // Aquí puedes agregar más comprobaciones de otros servicios si los tienes
  });
}

module.exports = app; 