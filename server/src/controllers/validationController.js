import { supabaseAdmin } from '../config/supabase.js';
import ValidationEngine from '../services/validation/ValidationEngine.js';
import GeminiService from '../services/gemini/GeminiService.js';
import StorageService from '../services/storage/StorageService.js';
import { sendSuccess, sendError, asyncHandler } from '../utils/response.js';
import { logAudit } from '../utils/audit.js';

/**
 * GET /api/forms/:id/validation — run full validation (deterministic + AI).
 */
export const validateForm = asyncHandler(async (req, res) => {
  const formId = req.params.id;

  // Verify ownership
  const { data: form } = await supabaseAdmin
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('user_id', req.user.id)
    .single();

  if (!form) return sendError(res, 'FORM_NOT_FOUND', 'Form not found.', 404);

  // Get fields
  const { data: fields } = await supabaseAdmin
    .from('form_fields')
    .select('*')
    .eq('form_id', formId)
    .order('position');

  // Get documents
  const { data: documents } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('form_id', formId);

  // 1. Deterministic validation FIRST (no AI calls)
  const requiredDocs = form.extracted_schema?.requiredDocuments || [];
  const deterministicIssues = ValidationEngine.validate(fields || [], documents || [], requiredDocs);

  // 2. AI semantic validation (only if deterministic passes basic checks)
  let aiIssues = [];
  const errorCount = deterministicIssues.filter(i => i.severity === 'error').length;
  if (errorCount < 5) {
    try {
      const { data: answers } = await supabaseAdmin
        .from('answers')
        .select('*')
        .eq('form_id', formId);

      const aiResult = await GeminiService.validateForm(fields || [], answers || []);
      aiIssues = aiResult.issues || [];
    } catch {
      // AI validation is optional; if it fails, we still have deterministic results
    }
  }

  // Merge and deduplicate
  const allIssues = [...deterministicIssues, ...aiIssues];
  const seen = new Set();
  const uniqueIssues = allIssues.filter(issue => {
    const key = `${issue.field_key}-${issue.issue_type}-${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Store validation results
  await supabaseAdmin.from('validation_results').delete().eq('form_id', formId);
  if (uniqueIssues.length > 0) {
    const rows = uniqueIssues.map(issue => ({
      form_id: formId,
      field_id: issue.field_id || (fields || []).find(f => f.field_key === issue.field_key)?.id || null,
      severity: issue.severity,
      issue_type: issue.issue_type,
      message: issue.message,
      resolved: false,
    }));
    await supabaseAdmin.from('validation_results').insert(rows);
  }

  // Update field validation statuses
  for (const issue of uniqueIssues) {
    if (issue.field_id && issue.severity === 'error') {
      await supabaseAdmin
        .from('form_fields')
        .update({ validation_status: 'INVALID' })
        .eq('id', issue.field_id);
    } else if (issue.field_id && issue.severity === 'warning') {
      await supabaseAdmin
        .from('form_fields')
        .update({ validation_status: 'WARNING' })
        .eq('id', issue.field_id);
    }
  }

  logAudit(req.user.id, formId, 'VALIDATION_RUN', { issueCount: uniqueIssues.length });

  sendSuccess(res, { issues: uniqueIssues, total: uniqueIssues.length });
});

/**
 * GET /api/forms/:id/readiness — calculate form readiness score.
 */
export const getReadiness = asyncHandler(async (req, res) => {
  const formId = req.params.id;

  // Verify ownership
  const { data: form } = await supabaseAdmin
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('user_id', req.user.id)
    .single();

  if (!form) return sendError(res, 'FORM_NOT_FOUND', 'Form not found.', 404);

  // Get fields
  const { data: fields } = await supabaseAdmin
    .from('form_fields')
    .select('*')
    .eq('form_id', formId);

  // Get latest validation results
  const { data: validationResults } = await supabaseAdmin
    .from('validation_results')
    .select('*')
    .eq('form_id', formId)
    .eq('resolved', false);

  // Get documents
  const { data: documents } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('form_id', formId);

  // Calculate readiness
  const { score, status, errorCount, warningCount } = ValidationEngine.calculateReadiness(
    fields || [],
    validationResults || []
  );

  // Missing fields
  const missingFields = (fields || [])
    .filter(f => f.required && !f.mapped_value && !f.extracted_value)
    .map(f => f.label);

  // Missing documents
  const requiredDocs = form.extracted_schema?.requiredDocuments || [];
  const uploadedTypes = (documents || []).map(d => (d.document_type || '').toLowerCase());
  const missingDocuments = requiredDocs.filter(
    rd => !uploadedTypes.some(ut => ut.includes(rd.toLowerCase()))
  );

  // Warnings
  const warnings = (validationResults || [])
    .filter(v => v.severity === 'warning')
    .map(v => v.message);

  const readiness = {
    readiness_score: score,
    status,
    missing_fields: missingFields,
    missing_documents: missingDocuments,
    warnings,
    error_count: errorCount,
    warning_count: warningCount,
    ready_for_submission: status === 'READY',
    total_fields: (fields || []).length,
    filled_fields: (fields || []).filter(f => f.mapped_value || f.extracted_value).length,
  };

  sendSuccess(res, { readiness });
});

/**
 * POST /api/forms/:id/approve — user approves form for export.
 */
export const approveForm = asyncHandler(async (req, res) => {
  const formId = req.params.id;

  // Verify ownership
  const { data: form } = await supabaseAdmin
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('user_id', req.user.id)
    .single();

  if (!form) return sendError(res, 'FORM_NOT_FOUND', 'Form not found.', 404);

  // Get fields and validation
  const { data: fields } = await supabaseAdmin
    .from('form_fields').select('*').eq('form_id', formId);

  const { data: validationResults } = await supabaseAdmin
    .from('validation_results').select('*').eq('form_id', formId).eq('resolved', false);

  const { data: documents } = await supabaseAdmin
    .from('documents').select('*').eq('form_id', formId);

  const { score, status } = ValidationEngine.calculateReadiness(fields || [], validationResults || []);

  const requiredDocs = form.extracted_schema?.requiredDocuments || [];
  const uploadedTypes = (documents || []).map(d => (d.document_type || '').toLowerCase());
  const missingDocuments = requiredDocs.filter(
    rd => !uploadedTypes.some(ut => ut.includes(rd.toLowerCase()))
  );

  const missingFields = (fields || [])
    .filter(f => f.required && !f.mapped_value && !f.extracted_value)
    .map(f => f.label);

  const warnings = (validationResults || [])
    .filter(v => v.severity === 'warning')
    .map(v => v.message);

  // Create submission review
  const { data: review, error } = await supabaseAdmin
    .from('submission_reviews')
    .insert({
      user_id: req.user.id,
      form_id: formId,
      readiness_score: score,
      missing_fields: missingFields,
      missing_documents: missingDocuments,
      warnings,
      user_approved: true,
    })
    .select()
    .single();

  if (error) return sendError(res, 'REVIEW_FAILED', error.message);

  logAudit(req.user.id, formId, 'FORM_APPROVED', { readiness_score: score });

  sendSuccess(res, { review, readiness_score: score, status });
});

/**
 * POST /api/forms/:id/export — generate submission-ready document.
 */
export const exportForm = asyncHandler(async (req, res) => {
  const formId = req.params.id;

  // Verify ownership
  const { data: form } = await supabaseAdmin
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('user_id', req.user.id)
    .single();

  if (!form) return sendError(res, 'FORM_NOT_FOUND', 'Form not found.', 404);

  // Get filled fields
  const { data: fields } = await supabaseAdmin
    .from('form_fields')
    .select('*')
    .eq('form_id', formId)
    .order('position');

  // Generate summary with Gemini
  let summary = null;
  try {
    summary = await GeminiService.generateSubmissionSummary(
      form.title,
      fields || [],
      []
    );
  } catch {}

  // Build the export payload (JSON representation of the filled form)
  const exportData = {
    form_title: form.title,
    form_type: form.form_type,
    export_timestamp: new Date().toISOString(),
    fields: (fields || []).map(f => ({
      label: f.label,
      field_key: f.field_key,
      field_type: f.field_type,
      value: f.mapped_value || f.extracted_value || '',
      required: f.required,
      validation_status: f.validation_status,
    })),
    summary,
  };

  // Store export JSON in the generated bucket
  const exportBuffer = Buffer.from(JSON.stringify(exportData, null, 2));
  const exportFileName = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_filled_${Date.now()}.json`;

  const { filePath } = await StorageService.upload(
    'generated', req.user.id, exportBuffer, exportFileName, 'application/json'
  );

  const signedUrl = await StorageService.getSignedUrl('generated', filePath, 7200);

  logAudit(req.user.id, formId, 'FORM_EXPORTED', { exportFile: exportFileName });

  sendSuccess(res, {
    export: exportData,
    download_url: signedUrl,
    file_name: exportFileName,
  });
});
