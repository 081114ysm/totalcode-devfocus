import db from "../config/db.js";

export async function saveProgress(req, res) {
  const { lessonId, watchedSeconds } = req.body;
  const [lessons] = await db.query(`SELECT l.duration,l.course_id,
    EXISTS(SELECT 1 FROM enrollments e WHERE e.course_id=l.course_id AND e.user_id=?) enrolled
    FROM lessons l WHERE l.id=?`, [req.user.id,lessonId]);
  if (!lessons[0]) return res.status(404).json({ error: "레슨을 찾을 수 없습니다" });
  if (!lessons[0].enrolled && req.user.role === "student") return res.status(403).json({ error: "수강 등록이 필요합니다" });
  const seconds = Math.min(Number(watchedSeconds), lessons[0].duration || Number(watchedSeconds));
  await db.query(
    `INSERT INTO progress (user_id, lesson_id, watched_seconds) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE watched_seconds = GREATEST(watched_seconds, VALUES(watched_seconds))`,
    [req.user.id, lessonId, seconds]
  );
  res.json({ lessonId: Number(lessonId), watchedSeconds: seconds });
}

export async function getCourseProgress(req, res) {
  const [rows] = await db.query(
    `SELECT l.id lessonId, l.title, l.duration, COALESCE(p.watched_seconds, 0) watchedSeconds
     FROM lessons l LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ?
     WHERE l.course_id = ? ORDER BY l.\`order\``,
    [req.user.id, req.params.courseId]
  );
  const completed = rows.filter((row) => row.duration > 0 && row.watchedSeconds >= row.duration * 0.9).length;
  const nextLesson=rows.find((row)=>row.duration<=0||row.watchedSeconds<row.duration*0.9)||null;
  res.json({ lessons: rows, completedLessons:completed, totalLessons:rows.length, nextLessonId:nextLesson?.lessonId||null, completionRate: rows.length ? Math.round((completed / rows.length) * 100) : 0 });
}
