import GeminiService from '../services/gemini/GeminiService.js';
import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError, asyncHandler } from '../utils/response.js';
import { explainFieldSchema, mapAnswerSchema, chatSchema } from '../schemas/index.js';
import { logAudit } from '../utils/audit.js';
import config from '../config/index.js';

/**
 * POST /api/ai/explain-field — explain a form field to the user.
 */
export const explainField = asyncHandler(async (req, res) => {
  const parsed = explainFieldSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  }

  const { field_label, field_description, form_context } = parsed.data;

  const explanation = await GeminiService.explainField(field_label, field_description, form_context);

  // Log the AI session
  await supabaseAdmin.from('ai_sessions').insert({
    user_id: req.user.id,
    form_id: req.body.form_id || null,
    session_type: 'explain',
    input: { field_label, field_description },
    output: explanation,
    model: config.gemini.model,
    confidence: 1.0,
  });

  sendSuccess(res, { explanation });
});

/**
 * POST /api/ai/map-answer — map a natural-language answer to form fields.
 * Core endpoint for the "Speak / Type" step.
 */
export const mapAnswer = asyncHandler(async (req, res) => {
  const parsed = mapAnswerSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  }

  const formId = req.params.formId || req.body.form_id;
  if (!formId) {
    return sendError(res, 'MISSING_FORM_ID', 'form_id is required.');
  }

  // Verify ownership
  const { data: form } = await supabaseAdmin
    .from('forms')
    .select('id, user_id')
    .eq('id', formId)
    .eq('user_id', req.user.id)
    .single();

  if (!form) {
    return sendError(res, 'FORM_NOT_FOUND', 'Form not found.', 404);
  }

  // Get current fields
  const { data: fields } = await supabaseAdmin
    .from('form_fields')
    .select('*')
    .eq('form_id', formId)
    .order('position', { ascending: true });

  if (!fields || fields.length === 0) {
    return sendError(res, 'NO_FIELDS', 'Form has no extracted fields yet.');
  }

  // Get existing answers for context
  const { data: existingAnswers } = await supabaseAdmin
    .from('form_fields')
    .select('field_key, mapped_value')
    .eq('form_id', formId)
    .not('mapped_value', 'is', null);

  const answersMap = {};
  (existingAnswers || []).forEach(a => { answersMap[a.field_key] = a.mapped_value; });

  // Call Gemini for mapping
  const result = await GeminiService.mapAnswerToField(parsed.data.text, fields, answersMap);

  // Auto-apply high-confidence mappings to form_fields
  if (result.mappings && result.mappings.length > 0) {
    for (const mapping of result.mappings) {
      if (mapping.confidence >= config.ai.confidenceThreshold && !mapping.requires_confirmation) {
        await supabaseAdmin
          .from('form_fields')
          .update({
            mapped_value: mapping.normalized_value,
            validation_status: 'VALID',
          })
          .eq('form_id', formId)
          .eq('field_key', mapping.field_key);
      }

      // Save answer record
      const targetField = fields.find(f => f.field_key === mapping.field_key);
      await supabaseAdmin.from('answers').insert({
        user_id: req.user.id,
        form_id: formId,
        field_id: targetField?.id || null,
        raw_answer: parsed.data.text,
        normalized_answer: mapping.normalized_value,
        source: parsed.data.source,
        confidence: mapping.confidence,
      });
    }
  }

  // Log AI session
  await supabaseAdmin.from('ai_sessions').insert({
    user_id: req.user.id,
    form_id: formId,
    session_type: 'map',
    input: { text: parsed.data.text, source: parsed.data.source },
    output: result,
    model: config.gemini.model,
    confidence: result.mappings?.[0]?.confidence || 0,
  });

  logAudit(req.user.id, formId, 'ANSWER_MAPPED', {
    text: parsed.data.text.substring(0, 100),
    mappingsCount: result.mappings?.length || 0,
  });

  sendSuccess(res, { result });
});

/**
 * POST /api/ai/validate — run AI-assisted semantic validation.
 */
export const aiValidate = asyncHandler(async (req, res) => {
  const formId = req.body.form_id;
  if (!formId) {
    return sendError(res, 'MISSING_FORM_ID', 'form_id is required.');
  }

  // Verify ownership
  const { data: form } = await supabaseAdmin
    .from('forms')
    .select('id')
    .eq('id', formId)
    .eq('user_id', req.user.id)
    .single();

  if (!form) return sendError(res, 'FORM_NOT_FOUND', 'Form not found.', 404);

  const { data: fields } = await supabaseAdmin
    .from('form_fields')
    .select('*')
    .eq('form_id', formId);

  const { data: answers } = await supabaseAdmin
    .from('answers')
    .select('*')
    .eq('form_id', formId);

  const result = await GeminiService.validateForm(fields || [], answers || []);

  // Store validation results
  if (result.issues && result.issues.length > 0) {
    // Clear old AI validation results
    await supabaseAdmin
      .from('validation_results')
      .delete()
      .eq('form_id', formId);

    const rows = result.issues.map(issue => ({
      form_id: formId,
      field_id: fields?.find(f => f.field_key === issue.field_key)?.id || null,
      severity: issue.severity,
      issue_type: issue.issue_type,
      message: issue.message,
      resolved: false,
    }));

    await supabaseAdmin.from('validation_results').insert(rows);
  }

  sendSuccess(res, { validation: result });
});

/**
 * POST /api/ai/chat — conversational AI assistant.
 */
export const chat = asyncHandler(async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  }

  let formContext = {};
  if (parsed.data.form_id) {
    const { data: form } = await supabaseAdmin
      .from('forms')
      .select('title, form_type, extracted_schema')
      .eq('id', parsed.data.form_id)
      .eq('user_id', req.user.id)
      .single();

    if (form) formContext = form;
  }

  const result = await GeminiService.chat(parsed.data.message, formContext, parsed.data.history);

  // If a field mapping was detected in the chat, apply it
  if (result.detected_answer?.field_key && result.detected_answer?.value && parsed.data.form_id) {
    if ((result.detected_answer.confidence || 0) >= config.ai.confidenceThreshold) {
      await supabaseAdmin
        .from('form_fields')
        .update({ mapped_value: result.detected_answer.value, validation_status: 'VALID' })
        .eq('form_id', parsed.data.form_id)
        .eq('field_key', result.detected_answer.field_key);
    }
  }

  // Log session
  await supabaseAdmin.from('ai_sessions').insert({
    user_id: req.user.id,
    form_id: parsed.data.form_id || null,
    session_type: 'chat',
    input: { message: parsed.data.message },
    output: result,
    model: config.gemini.model,
    confidence: result.detected_answer?.confidence || 0,
  });

  sendSuccess(res, { response: result.response, detected_answer: result.detected_answer || null });
});
