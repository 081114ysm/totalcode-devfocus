import db from "../config/db.js";

export async function listQuestions(req, res) {
  const [questions] = await db.query(`SELECT q.id, q.title, q.content, q.created_at, u.id user_id, u.nickname,
    (SELECT COUNT(*) FROM answers WHERE question_id=q.id) answerCount
    FROM questions q JOIN users u ON u.id=q.user_id ORDER BY q.created_at DESC LIMIT 100`);
  res.json({ questions: questions.map((q) => ({ ...q, author: { id: q.user_id, nickname: q.nickname } })) });
}
export async function createQuestion(req, res) {
  const [result] = await db.query("INSERT INTO questions (user_id,title,content) VALUES (?,?,?)", [req.user.id, req.body.title.trim(), req.body.content.trim()]);
  res.status(201).json({ id: result.insertId });
}
export async function getQuestion(req, res) {
  const [questions] = await db.query("SELECT q.*,u.nickname FROM questions q JOIN users u ON u.id=q.user_id WHERE q.id=?", [req.params.id]);
  if (!questions[0]) return res.status(404).json({ error: "질문을 찾을 수 없습니다" });
  const [answers] = await db.query("SELECT a.*,u.nickname FROM answers a JOIN users u ON u.id=a.user_id WHERE a.question_id=? ORDER BY a.created_at", [req.params.id]);
  res.json({ ...questions[0], author: { id: questions[0].user_id, nickname: questions[0].nickname }, answers: answers.map((a) => ({ ...a, author: { id: a.user_id, nickname: a.nickname } })) });
}
export async function createAnswer(req, res) {
  const [result] = await db.query("INSERT INTO answers (question_id,user_id,content) VALUES (?,?,?)", [req.body.questionId, req.user.id, req.body.content.trim()]);
  res.status(201).json({ id: result.insertId });
}
