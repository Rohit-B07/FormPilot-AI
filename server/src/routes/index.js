import { Router } from 'express';
import authRoutes from './auth.js';
import formRoutes from './forms.js';
import aiRoutes from './ai.js';
import documentRoutes from './documents.js';

const router = Router();

// Base API index
router.get('/', (req, res) => {
  res.status(200).json({
    service: 'FormPilot AI API',
    status: 'online',
    version: '1.0.0',
    documentation: 'https://github.com/formpilot-ai',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      forms: '/api/forms',
      ai: '/api/ai',
      documents: '/api/documents',
    },
  });
});

// Mount sub-routers
router.use('/auth', authRoutes);
router.use('/forms', formRoutes);
router.use('/ai', aiRoutes);
router.use('/documents', documentRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'FormPilot AI Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
