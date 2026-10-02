import { supabaseAdmin } from '../../config/supabase.js';
import StorageService from '../storage/StorageService.js';
import DocumentProcessor from '../document/DocumentProcessor.js';
import { logAudit } from '../../utils/audit.js';

/**
 * FormService — orchestrates the complete form processing pipeline.
 *
 * Pipeline:
 *   1. Upload file to Storage
 *   2. Create form record (UPLOADING)
 *   3. Update status to PROCESSING
 *   4. Send to DocumentProcessor
 *   5. Update to EXTRACTING
 *   6. Gemini understands the form → structured schema
 *   7. Update to UNDERSTANDING
 *   8. Save extracted fields to form_fields
 *   9. Update to READY
 */
class FormService {
  /**
   * Upload and begin processing a new form.
   */
  async uploadAndProcess(userId, file) {
    // 1. Upload file to storage
    const { filePath } = await StorageService.upload(
      'forms', userId, file.buffer, file.originalname, file.mimetype
    );

    // 2. Create form record
    const { data: form, error: insertError } = await supabaseAdmin
      .from('forms')
      .insert({
        user_id: userId,
        title: file.originalname,
        original_file_url: filePath,
        file_type: file.mimetype,
        status: 'UPLOADING',
      })
      .select()
      .single();

    if (insertError) throw new Error(`Failed to create form: ${insertError.message}`);

    logAudit(userId, form.id, 'FORM_UPLOADED', { fileName: file.originalname });

    // 3. Start async processing (non-blocking)
    this._processFormAsync(form.id, userId, filePath, file.mimetype, file.originalname);

    return form;
  }

  /**
   * Internal async processing pipeline.
   * Runs in the background so the upload response returns immediately.
   */
  async _processFormAsync(formId, userId, filePath, mimeType, fileName) {
    try {
      // Update to PROCESSING
      await this._updateStatus(formId, 'PROCESSING');

      // Download file from storage for AI processing
      const fileBuffer = await StorageService.download('forms', filePath);

      // Update to EXTRACTING
      await this._updateStatus(formId, 'EXTRACTING');

      // Process document with DocumentProcessor (Gemini Vision)
      const schema = await DocumentProcessor.processForm(fileBuffer, mimeType, fileName);

      // Update to UNDERSTANDING
      await this._updateStatus(formId, 'UNDERSTANDING');

      // Save schema to form record
      await supabaseAdmin
        .from('forms')
        .update({
          extracted_schema: schema,
          form_type: schema.formType || 'other',
          title: schema.formTitle || fileName,
        })
        .eq('id', formId);

      // Save extracted fields
      if (schema.fields && schema.fields.length > 0) {
        const fieldRows = schema.fields.map((field, idx) => ({
          form_id: formId,
          field_key: field.field_key,
          label: field.label,
          description: field.description || null,
          field_type: field.field_type || 'text',
          required: field.required || false,
          options: field.options || null,
          section: field.section || null,
          position: idx,
          confidence: field.confidence || 0.5,
          validation_status: 'NEEDS_INPUT',
        }));

        await supabaseAdmin.from('form_fields').insert(fieldRows);
      }

      // Update to READY
      await this._updateStatus(formId, 'READY');

      logAudit(userId, formId, 'FORM_PROCESSED', {
        fieldCount: schema.fields?.length || 0,
        formType: schema.formType,
      });

    } catch (error) {
      console.error(`[FormService] Processing failed for form ${formId}:`, error.message);
      await this._updateStatus(formId, 'ERROR');
      logAudit(userId, formId, 'FORM_PROCESSING_ERROR', { error: error.message });
    }
  }

  async _updateStatus(formId, status) {
    await supabaseAdmin
      .from('forms')
      .update({ status })
      .eq('id', formId);
  }

  /**
   * Get a single form with its fields.
   */
  async getFormWithFields(formId) {
    const { data: form, error } = await supabaseAdmin
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error || !form) return null;

    const { data: fields } = await supabaseAdmin
      .from('form_fields')
      .select('*')
      .eq('form_id', formId)
      .order('position', { ascending: true });

    return { ...form, fields: fields || [] };
  }

  /**
   * Get all forms for a user.
   */
  async getUserForms(userId) {
    const { data, error } = await supabaseAdmin
      .from('forms')
      .select('id, title, status, form_type, file_type, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Delete a form and all associated data.
   */
  async deleteForm(formId, userId) {
    const { data: form } = await supabaseAdmin
      .from('forms')
      .select('original_file_url')
      .eq('id', formId)
      .eq('user_id', userId)
      .single();

    if (!form) throw new Error('Form not found.');

    // Delete storage file
    if (form.original_file_url) {
      try { await StorageService.delete('forms', form.original_file_url); } catch {}
    }

    // Cascade delete handled by FK constraints
    await supabaseAdmin.from('forms').delete().eq('id', formId);

    logAudit(userId, formId, 'FORM_DELETED');
  }
}

export default new FormService();
