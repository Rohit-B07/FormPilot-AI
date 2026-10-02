import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  uploadForm, uploadMiddleware,
  listForms, getForm, deleteForm,
  getFormStatus, reprocessForm,
  getFields, updateField,
} from '../controllers/formController.js';
import { createAnswer, updateAnswer } from '../controllers/answerController.js';
import { listDocuments } from '../controllers/documentController.js';
import {
  validateForm,
  getReadiness,
  approveForm,
  exportForm,
} from '../controllers/validationController.js';
import { mapAnswer } from '../controllers/aiController.js';

const router = Router();

// Form CRUD
router.post('/upload', authenticate, uploadMiddleware, uploadForm);
router.get('/', authenticate, listForms);
router.get('/:id', authenticate, getForm);
router.delete('/:id', authenticate, deleteForm);

// Processing
router.post('/:id/process', authenticate, reprocessForm);
router.get('/:id/status', authenticate, getFormStatus);

// Fields
router.get('/:id/fields', authenticate, getFields);
router.patch('/:id/fields/:fieldId', authenticate, updateField);

// Answers
router.post('/:id/answers', authenticate, createAnswer);
router.patch('/:id/answers/:answerId', authenticate, updateAnswer);

// AI Mapping per form
router.post('/:id/map-answer', authenticate, mapAnswer);

// Documents for form
router.get('/:id/documents', authenticate, listDocuments);

// Validation & Readiness
router.get('/:id/validation', authenticate, validateForm);
router.post('/:id/validate', authenticate, validateForm);
router.get('/:id/readiness', authenticate, getReadiness);

// Finalization & Export
router.post('/:id/approve', authenticate, approveForm);
router.post('/:id/export', authenticate, exportForm);

export default router;
