import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import { JWT_SECRET } from "../middleware/auth.js";
import { sendWelcomeEmail } from "../services/email.js";

export const register = async (req, res) => {
  const { email, password, nickname, role } = req.body;
  const userRole = ["student", "instructor"].includes(role) ? role : "student";

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (email, password, nickname, role) VALUES (?, ?, ?, ?)",
      [email, hashed, nickname, userRole]
    );
    const userId = result.insertId;
    sendWelcomeEmail(email, nickname).catch(() => {});

    const token = jwt.sign({ id: userId, role: userRole }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: { id: userId, email, nickname, role: userRole },
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "이미 존재하는 이메일입니다" });
    }
    res.status(500).json({ error: "서버 에러" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
};
