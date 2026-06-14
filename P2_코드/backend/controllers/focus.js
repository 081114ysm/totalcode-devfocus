import db from "../config/db.js";

export async function startFocus(req, res) {
  const [active] = await db.query("SELECT id FROM focus_sessions WHERE user_id = ? AND end_time IS NULL LIMIT 1", [req.user.id]);
  if (active[0]) return res.status(409).json({ error: "이미 진행 중인 집중 세션이 있습니다" });
  const [result] = await db.query("INSERT INTO focus_sessions (user_id, start_time) VALUES (?, NOW())", [req.user.id]);
  res.status(201).json({ sessionId: result.insertId, startTime: new Date().toISOString() });
}

export async function endFocus(req, res) {
  const [rows] = await db.query("SELECT id, start_time FROM focus_sessions WHERE id = ? AND user_id = ? AND end_time IS NULL", [req.body.sessionId, req.user.id]);
  if (!rows[0]) return res.status(404).json({ error: "진행 중인 세션을 찾을 수 없습니다" });
  const duration = Math.max(0, Math.floor((Date.now() - new Date(rows[0].start_time).getTime()) / 1000));
  await db.query("UPDATE focus_sessions SET end_time = NOW(), duration = ? WHERE id = ?", [duration, rows[0].id]);
  res.json({ sessionId: rows[0].id, duration });
}

export async function getFocusHistory(req, res) {
  const [sessions] = await db.query("SELECT id, start_time, end_time, duration FROM focus_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 100", [req.user.id]);
  const [[summary]] = await db.query("SELECT COALESCE(SUM(duration),0) totalSeconds, COUNT(*) sessionCount FROM focus_sessions WHERE user_id = ? AND end_time IS NOT NULL", [req.user.id]);
  res.json({ sessions, summary });
}
