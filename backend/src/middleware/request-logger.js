const { logger } = require('../utils/logger');

function generateRequestId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  ).toUpperCase();
}

function sanitize(obj) {
  const redactedKeys = new Set([
    'password',
    'authorization',
    'token',
    'apiKey',
    'secret',
    'privateKey'
  ]);
  try {
    const clone = JSON.parse(JSON.stringify(obj || {}));
    Object.keys(clone).forEach((k) => {
      if (redactedKeys.has(k.toLowerCase())) clone[k] = '[REDACTED]';
    });
    const str = JSON.stringify(clone);
    return str.length > 2048 ? '[OMITTED BODY >2KB]' : clone;
  } catch {
    return {};
  }
}

function requestLogger() {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
    req.id = req.headers['x-request-id'] || generateRequestId();
    res.setHeader('x-request-id', req.id);

    const inboundMeta = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer'] || req.headers['referrer'] || '',
      query: req.query || {},
      body: sanitize(req.body)
    };
    logger.info('HTTP request received', inboundMeta);

    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1e6;
      const outboundMeta = {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl || req.url,
        status: res.statusCode,
        durationMs: Math.round(durationMs),
        contentLength: res.getHeader('content-length') || 0
      };
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
      logger[level]('HTTP response sent', outboundMeta);
    });

    next();
  };
}

module.exports = { requestLogger };

