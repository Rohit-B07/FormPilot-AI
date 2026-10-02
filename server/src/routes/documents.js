import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  uploadDocument,
  uploadMiddleware,
  listDocuments,
  deleteDocument,
} from '../controllers/documentController.js';

const router = Router();

// Document upload and deletion
router.post('/upload', authenticate, uploadMiddleware, uploadDocument);
router.get('/form/:id', authenticate, listDocuments);
router.delete('/:id', authenticate, deleteDocument);

export default router;
