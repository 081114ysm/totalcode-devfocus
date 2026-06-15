import db from "../config/db.js";
export async function getLesson(req, res) {
  const [rows] = await db.query(`SELECT l.*, c.title course_title,
    COALESCE(p.watched_seconds,0) watched_seconds,
    EXISTS(SELECT 1 FROM enrollments e WHERE e.course_id=l.course_id AND e.user_id=?) enrolled
    FROM lessons l JOIN courses c ON c.id=l.course_id
    LEFT JOIN progress p ON p.lesson_id=l.id AND p.user_id=?
    WHERE l.id=?`, [req.user.id, req.user.id, req.params.lessonId]);
  if (!rows[0]) return res.status(404).json({ error: "레슨을 찾을 수 없습니다" });
  if (!rows[0].enrolled && req.user.role === "student") return res.status(403).json({ error: "수강 등록이 필요합니다" });
  const lesson=rows[0];
  const [siblings]=await db.query(`SELECT l.id,l.title,l.\`order\`,l.duration,COALESCE(p.watched_seconds,0) watched_seconds
    FROM lessons l LEFT JOIN progress p ON p.lesson_id=l.id AND p.user_id=?
    WHERE l.course_id=? ORDER BY l.\`order\`,l.id`,[req.user.id,lesson.course_id]);
  const index=siblings.findIndex((item)=>item.id===lesson.id);
  res.json({ ...lesson, previousLesson:index>0?siblings[index-1]:null, nextLesson:index>=0&&index<siblings.length-1?siblings[index+1]:null, curriculum:siblings });
}
