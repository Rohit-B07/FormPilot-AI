import multer from 'multer';
import { supabaseAdmin } from '../config/supabase.js';
import StorageService from '../services/storage/StorageService.js';
import DocumentProcessor from '../services/document/DocumentProcessor.js';
import { sendSuccess, sendError, asyncHandler } from '../utils/response.js';
import { logAudit } from '../utils/audit.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

export const uploadMiddleware = upload.single('file');

/**
 * POST /api/documents/upload — upload a supporting document.
 */
export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 'NO_FILE', 'No file was uploaded.');
  }

  const errors = StorageService.validate(req.file);
  if (errors.length > 0) {
    return sendError(res, 'INVALID_FILE', errors.join(' '));
  }

  const formId = req.body.form_id || null;
  const documentType = req.body.document_type || null;

  // Verify form ownership if form_id provided
  if (formId) {
    const { data: form } = await supabaseAdmin
      .from('forms')
      .select('id')
      .eq('id', formId)
      .eq('user_id', req.user.id)
      .single();

    if (!form) return sendError(res, 'FORM_NOT_FOUND', 'Form not found.', 404);
  }

  // Upload to storage
  const { filePath } = await StorageService.upload(
    'documents', req.user.id, req.file.buffer, req.file.originalname, req.file.mimetype
  );

  // Classify document with AI if type not provided
  let classifiedType = documentType;
  if (!classifiedType) {
    try {
      const classification = await DocumentProcessor.classifyDocument(
        req.file.buffer, req.file.mimetype, req.file.originalname
      );
      classifiedType = classification.document_type;
    } catch {
      classifiedType = 'unknown';
    }
  }

  // Save document record
  const { data: doc, error } = await supabaseAdmin
    .from('documents')
    .insert({
      user_id: req.user.id,
      form_id: formId,
      file_name: req.file.originalname,
      file_url: filePath,
      document_type: classifiedType,
      status: 'UPLOADED',
    })
    .select()
    .single();

  if (error) return sendError(res, 'DOC_CREATE_FAILED', error.message);

  logAudit(req.user.id, formId, 'DOCUMENT_UPLOADED', {
    fileName: req.file.originalname,
    type: classifiedType,
  });

  sendSuccess(res, { document: doc }, 201);
});

/**
 * GET /api/forms/:id/documents — list all documents for a form.
 */
export const listDocuments = asyncHandler(async (req, res) => {
  // Verify form ownership
  const { data: form } = await supabaseAdmin
    .from('forms')
    .select('id')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (!form) return sendError(res, 'FORM_NOT_FOUND', 'Form not found.', 404);

  const { data: docs } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('form_id', req.params.id)
    .order('created_at', { ascending: false });

  // Generate signed URLs for each document
  const docsWithUrls = await Promise.all(
    (docs || []).map(async (doc) => {
      let signedUrl = null;
      try {
        signedUrl = await StorageService.getSignedUrl('documents', doc.file_url);
      } catch {}
      return { ...doc, signed_url: signedUrl };
    })
  );

  sendSuccess(res, { documents: docsWithUrls });
});

/**
 * DELETE /api/documents/:id — delete a document.
 */
export const deleteDocument = asyncHandler(async (req, res) => {
  const { data: doc } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (!doc) return sendError(res, 'DOC_NOT_FOUND', 'Document not found.', 404);

  // Delete from storage
  try { await StorageService.delete('documents', doc.file_url); } catch {}

  // Delete record
  await supabaseAdmin.from('documents').delete().eq('id', doc.id);

  logAudit(req.user.id, doc.form_id, 'DOCUMENT_DELETED', { fileName: doc.file_name });
  sendSuccess(res, { message: 'Document deleted.' });
});
