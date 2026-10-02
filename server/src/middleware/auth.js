import { supabaseAdmin } from '../config/supabase.js';
import { createUserClient } from '../config/supabase.js';
import { sendError } from '../utils/response.js';

/**
 * Express middleware: verifies the Supabase JWT from the Authorization header.
 * Attaches `req.user` (Supabase user object) and `req.supabase` (user-scoped client).
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'UNAUTHORIZED', 'Missing or invalid authorization header.', 401);
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return sendError(res, 'UNAUTHORIZED', 'Invalid or expired authentication token.', 401);
    }

    req.user = user;
    req.accessToken = token;
    req.supabase = createUserClient(token);
    next();
  } catch (err) {
    console.error('[AUTH MIDDLEWARE]', err.message);
    return sendError(res, 'AUTH_ERROR', 'Authentication failed.', 401);
  }
}
