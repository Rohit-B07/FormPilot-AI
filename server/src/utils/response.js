/**
 * Standardized API response helpers.
 * Every endpoint returns { success, data?, error? }.
 */
export function sendSuccess(res, data = {}, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function sendError(res, code, message, status = 400) {
  return res.status(status).json({
    success: false,
    error: { code, message },
  });
}

/**
 * Wrap an async Express handler so thrown errors become 500 responses
 * instead of crashing the process.
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
      sendError(res, 'INTERNAL_ERROR', 'An unexpected error occurred.', 500);
    });
  };
}
