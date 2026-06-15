import logger from "../config/logger.js";
import { observeRequest } from "../services/metrics.js";

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    observeRequest(req.method, req.route?.path || req.path, res.statusCode, durationMs);
    logger.info("HTTP", {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${durationMs}ms`,
    });
  });
  next();
};
