import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

import { requestLogger } from "./middleware/requestLogger.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter.js";
import { authMiddleware, requireRole } from "./middleware/auth.js";
import logger from "./config/logger.js";
import { sendErrorAlert } from "./services/discord.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import courseRoutes from "./routes/courses.js";
import progressRoutes from "./routes/progress.js";
import focusRoutes from "./routes/focus.js";
import qnaRoutes from "./routes/qna.js";
import lessonRoutes from "./routes/lessons.js";
import snippetRoutes from "./routes/snippets.js";
import adminRoutes from "./routes/admin.js";
import instructorRoutes from "./routes/instructor.js";
import paymentRoutes from "./routes/payments.js";
import settlementRoutes from "./routes/settlements.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import webhookRoutes from "./routes/webhooks.js";
import crypto from "node:crypto";
import db from "./config/db.js";
import { getMetrics } from "./services/metrics.js";

// 스케줄러 등록
import "./config/scheduler.js";

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required in production");
}

app.disable("x-powered-by");
app.use((req, res, next) => { req.id = req.headers["x-request-id"] || crypto.randomUUID(); res.setHeader("x-request-id", req.id); next(); });

// 보안
app.use(helmet());

// CORS
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// 바디 크기 제한
app.use(express.json({ limit: "1mb" }));

// HTTP 요청 로그
app.use(requestLogger);

// Rate Limiting
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// Health Check
app.get("/health", async (req, res) => {
  try { await db.query("SELECT 1"); res.json({ status: "ok", database: "up", uptime: process.uptime(), timestamp: new Date().toISOString() }); }
  catch (error) {
    logger.error("health check failed", { message: error.message, code: error.code });
    res.status(503).json({ status: "degraded", database: "down", timestamp: new Date().toISOString() });
  }
});
app.get("/metrics", authMiddleware, requireRole("admin"), (req,res)=>res.json(getMetrics()));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/qna", qnaRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/settlements", settlementRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/webhooks", webhookRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  logger.error("Unhandled error", { message: err.message, stack: err.stack });
  sendErrorAlert(err.message, `${req.method} ${req.originalUrl}`);
  const status = err.status && err.status < 500 ? err.status : 500;
  res.status(status).json({ error: status < 500 ? err.message : "서버 에러", code: status < 500 ? err.code : undefined });
});

export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => logger.info("server started", { port: PORT }));
}
