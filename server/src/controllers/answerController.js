import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError, asyncHandler } from '../utils/response.js';
import { answerCreateSchema, answerUpdateSchema } from '../schemas/index.js';
import GeminiService from '../services/gemini/GeminiService.js';
import { logAudit } from '../utils/audit.js';

/**
 * POST /api/forms/:id/answers — add a new answer to a form field.
 */
export const createAnswer = asyncHandler(async (req, res) => {
  const parsed = answerCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  }

  const formId = req.params.id;

  // Verify form ownership
  const { data: form } = await supabaseAdmin
    .from('forms')
    .select('id')
    .eq('id', formId)
    .eq('user_id', req.user.id)
    .single();

  if (!form) return sendError(res, 'FORM_NOT_FOUND', 'Form not found.', 404);

  // Get the target field
  const { data: field } = await supabaseAdmin
    .from('form_fields')
    .select('*')
    .eq('id', parsed.data.field_id)
    .eq('form_id', formId)
    .single();

  if (!field) return sendError(res, 'FIELD_NOT_FOUND', 'Field not found.', 404);

  // Normalize the answer with Gemini
  let normalized = null;
  try {
    normalized = await GeminiService.normalizeAnswer(
      parsed.data.raw_answer,
      field.label,
      field.field_type
    );
  } catch {
    // If normalization fails, use raw answer
    normalized = {
      normalized_value: parsed.data.raw_answer,
      formatted_value: parsed.data.raw_answer,
      confidence: 0.5,
      requires_confirmation: true,
    };
  }

  // Save answer
  const { data: answer, error } = await supabaseAdmin
    .from('answers')
    .insert({
      user_id: req.user.id,
      form_id: formId,
      field_id: parsed.data.field_id,
      raw_answer: parsed.data.raw_answer,
      normalized_answer: normalized.normalized_value,
      source: parsed.data.source,
      confidence: normalized.confidence,
    })
    .select()
    .single();

  if (error) return sendError(res, 'ANSWER_CREATE_FAILED', error.message);

  // Update the field's mapped value
  await supabaseAdmin
    .from('form_fields')
    .update({
      mapped_value: normalized.normalized_value,
      validation_status: normalized.requires_confirmation ? 'WARNING' : 'VALID',
    })
    .eq('id', parsed.data.field_id);

  logAudit(req.user.id, formId, 'ANSWER_CREATED', { field_key: field.field_key });

  sendSuccess(res, {
    answer,
    normalized,
    field_key: field.field_key,
    field_label: field.label,
  }, 201);
});

/**
 * PATCH /api/forms/:id/answers/:answerId — update an existing answer.
 */
export const updateAnswer = asyncHandler(async (req, res) => {
  const parsed = answerUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  }

  const { data: answer, error } = await supabaseAdmin
    .from('answers')
    .update(parsed.data)
    .eq('id', req.params.answerId)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error || !answer) {
    return sendError(res, 'ANSWER_NOT_FOUND', 'Answer not found.', 404);
  }

  // If raw answer changed, update the field too
  if (parsed.data.raw_answer && answer.field_id) {
    await supabaseAdmin
      .from('form_fields')
      .update({ mapped_value: parsed.data.normalized_answer || parsed.data.raw_answer })
      .eq('id', answer.field_id);
  }

  sendSuccess(res, { answer });
});
