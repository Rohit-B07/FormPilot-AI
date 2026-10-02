import multer from 'multer';
import FormService from '../services/form/FormService.js';
import StorageService from '../services/storage/StorageService.js';
import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError, asyncHandler } from '../utils/response.js';
import { fieldUpdateSchema } from '../schemas/index.js';
import { logAudit } from '../utils/audit.js';

// Multer configuration — store in memory for Supabase upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

export const uploadMiddleware = upload.single('file');

/**
 * POST /api/forms/upload — upload and begin processing a form.
 */
export const uploadForm = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 'NO_FILE', 'No file was uploaded.');
  }

  // Server-side file validation
  const errors = StorageService.validate(req.file);
  if (errors.length > 0) {
    return sendError(res, 'INVALID_FILE', errors.join(' '));
  }

  const form = await FormService.uploadAndProcess(req.user.id, req.file);

  sendSuccess(res, { form }, 201);
});

/**
 * GET /api/forms — list all forms for the current user.
 */
export const listForms = asyncHandler(async (req, res) => {
  const forms = await FormService.getUserForms(req.user.id);
  sendSuccess(res, { forms });
});

/**
 * GET /api/forms/:id — get a single form with its fields.
 */
export const getForm = asyncHandler(async (req, res) => {
  const form = await FormService.getFormWithFields(req.params.id);

  if (!form) {
    return sendError(res, 'FORM_NOT_FOUND', 'Form not found.', 404);
  }

  // Authorization: ensure the form belongs to the current user
  if (form.user_id !== req.user.id) {
    return sendError(res, 'FORBIDDEN', 'You do not have access to this form.', 403);
  }

  // Generate signed URL for the original file
  let signedUrl = null;
  if (form.original_file_url) {
    try {
      signedUrl = await StorageService.getSignedUrl('forms', form.original_file_url);
    } catch {}
  }

  sendSuccess(res, { form: { ...form, signed_file_url: signedUrl } });
});

/**
 * DELETE /api/forms/:id — delete a form and all its data.
 */
export const deleteForm = asyncHandler(async (req, res) => {
  await FormService.deleteForm(req.params.id, req.user.id);
  sendSuccess(res, { message: 'Form deleted successfully.' });
});

/**
 * GET /api/forms/:id/status — polling endpoint for processing progress.
 */
export const getFormStatus = asyncHandler(async (req, res) => {
  const { data: form, error } = await supabaseAdmin
    .from('forms')
    .select('id, status, updated_at')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (error || !form) {
    return sendError(res, 'FORM_NOT_FOUND', 'Form not found.', 404);
  }

  sendSuccess(res, { status: form.status, updated_at: form.updated_at });
});

/**
 * POST /api/forms/:id/process — manually re-trigger processing.
 */
export const reprocessForm = asyncHandler(async (req, res) => {
  const { data: form, error } = await supabaseAdmin
    .from('forms')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (error || !form) {
    return sendError(res, 'FORM_NOT_FOUND', 'Form not found.', 404);
  }

  if (!form.original_file_url) {
    return sendError(res, 'NO_FILE', 'Form has no associated file.');
  }

  // Clear old fields
  await supabaseAdmin.from('form_fields').delete().eq('form_id', form.id);
  await supabaseAdmin.from('validation_results').delete().eq('form_id', form.id);

  // Re-trigger processing
  FormService._processFormAsync(form.id, req.user.id, form.original_file_url, form.file_type, form.title);

  logAudit(req.user.id, form.id, 'FORM_REPROCESSED');
  sendSuccess(res, { message: 'Reprocessing started.', status: 'PROCESSING' });
});

/**
 * GET /api/forms/:id/fields — get all extracted fields for a form.
 */
export const getFields = asyncHandler(async (req, res) => {
  // Verify ownership
  const { data: form } = await supabaseAdmin
    .from('forms')
    .select('id')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (!form) {
    return sendError(res, 'FORM_NOT_FOUND', 'Form not found.', 404);
  }

  const { data: fields } = await supabaseAdmin
    .from('form_fields')
    .select('*')
    .eq('form_id', req.params.id)
    .order('position', { ascending: true });

  sendSuccess(res, { fields: fields || [] });
});

/**
 * PATCH /api/forms/:id/fields/:fieldId — manually update a field value.
 */
export const updateField = asyncHandler(async (req, res) => {
  const parsed = fieldUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  }

  // Verify ownership through forms table
  const { data: form } = await supabaseAdmin
    .from('forms')
    .select('id')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (!form) {
    return sendError(res, 'FORM_NOT_FOUND', 'Form not found.', 404);
  }

  const { data: field, error } = await supabaseAdmin
    .from('form_fields')
    .update(parsed.data)
    .eq('id', req.params.fieldId)
    .eq('form_id', req.params.id)
    .select()
    .single();

  if (error || !field) {
    return sendError(res, 'FIELD_NOT_FOUND', 'Field not found.', 404);
  }

  logAudit(req.user.id, req.params.id, 'FIELD_UPDATED', { field_key: field.field_key });
  sendSuccess(res, { field });
});
