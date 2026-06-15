import db from "../config/db.js";
import logger from "../config/logger.js";

export const getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, email, nickname, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!rows[0]) return res.status(404).json({ error: "유저 없음" });
    res.json(rows[0]);
  } catch (err) {
    logger.error("getMe error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const updateMe = async (req, res) => {
  const { nickname } = req.body;

  try {
    await db.query(
      "UPDATE users SET nickname = ? WHERE id = ?",
      [nickname, req.user.id]
    );
    res.json({ message: "닉네임이 수정되었습니다.", nickname });
  } catch (err) {
    logger.error("updateMe error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};
