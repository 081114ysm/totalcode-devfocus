import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "development-only-change-me";

export const authMiddleware = (req, res, next) => {
  const [scheme, token] = req.headers.authorization?.split(" ") || [];
  if (scheme !== "Bearer") return res.status(401).json({ error: "Bearer 토큰이 필요합니다" });
  if (!token) return res.status(401).json({ error: "토큰 없음" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "토큰 오류" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "인증 필요" });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "권한 없음" });
  }
  next();
};

export { JWT_SECRET };
