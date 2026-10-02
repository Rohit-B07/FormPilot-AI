import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/index.js';
import routes from './routes/index.js';
import { standardLimiter, aiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or localhost
      if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin === config.frontendUrl) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local development / hackathon demo
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use('/api/', standardLimiter);
app.use('/api/ai/', aiLimiter);

// API Routes
app.use('/api', routes);

// 404 Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

// Start server if run directly
if (process.env.NODE_ENV !== 'test') {
  const PORT = config.port || 3001;
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 FormPilot AI Server is running                          ║
║   📍 Port: ${PORT}                                              ║
║   🌍 Environment: ${config.nodeEnv}                                ║
║   🔗 Base API: http://localhost:${PORT}/api                      ║
║   ❤️  Health:   http://localhost:${PORT}/api/health               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  });
}

export default app;
