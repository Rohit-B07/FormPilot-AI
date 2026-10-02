import { supabaseAdmin } from '../config/supabase.js';

/**
 * Audit logger — writes immutable records of important user/system actions.
 * Safe to call fire-and-forget (.catch is handled internally).
 */
export async function logAudit(userId, formId, action, metadata = {}) {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId || null,
      form_id: formId || null,
      action,
      metadata,
    });
  } catch (err) {
    // Audit logging must never crash the request pipeline
    console.error('[AUDIT LOG ERROR]', err.message);
  }
}
