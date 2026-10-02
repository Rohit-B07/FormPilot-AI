import config from '../config/index.js';

/**
 * Global Express error handling middleware.
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('Unhandled Error:', {
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // Handle Multer file size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: `File size exceeds the allowed limit (${config.upload.maxFileSizeMB}MB).`,
      },
    });
  }

  // Handle SyntaxError / Invalid JSON payload
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON payload in request body.',
      },
    });
  }

  // Generic 500
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    },
  });
}

/**
 * 404 Not Found handler for undefined routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} does not exist.`,
    },
  });
}
