import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  explainField,
  mapAnswer,
  aiValidate,
  chat,
} from '../controllers/aiController.js';

const router = Router();

// AI routes (all authenticated)
router.post('/explain-field', authenticate, explainField);
router.post('/map-answer', authenticate, mapAnswer);
router.post('/map-answer/:formId', authenticate, mapAnswer);
router.post('/validate', authenticate, aiValidate);
router.post('/chat', authenticate, chat);

export default router;
