import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError, asyncHandler } from '../utils/response.js';
import { profileUpdateSchema } from '../schemas/index.js';
import { logAudit } from '../utils/audit.js';

/**
 * GET /api/auth/me — return current user's profile.
 */
export const getMe = asyncHandler(async (req, res) => {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error || !profile) {
    return sendError(res, 'PROFILE_NOT_FOUND', 'User profile not found.', 404);
  }

  sendSuccess(res, { profile });
});

/**
 * POST /api/auth/profile — update current user's profile.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 'VALIDATION_ERROR', parsed.error.issues[0].message);
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .update(parsed.data)
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) {
    return sendError(res, 'PROFILE_UPDATE_FAILED', error.message);
  }

  logAudit(req.user.id, null, 'PROFILE_UPDATED', { fields: Object.keys(parsed.data) });
  sendSuccess(res, { profile });
});
