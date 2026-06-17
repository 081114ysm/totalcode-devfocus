import db from "../config/db.js";
import logger from "../config/logger.js";

export const getMyCourses = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.title, c.description, c.thumbnail, c.category, c.created_at,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollmentCount,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lessonCount
       FROM courses c
       WHERE c.instructor_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json({ courses: rows });
  } catch (err) {
    logger.error("getMyCourses error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getInstructorAnalytics = async (req, res) => {
  try {
    const [[summary]] = await db.query(`SELECT
      (SELECT COUNT(*) FROM courses WHERE instructor_id=?) courseCount,
      (SELECT COUNT(*) FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE c.instructor_id=?) enrollmentCount,
      (SELECT COALESCE(SUM(p.amount),0) FROM payments p JOIN courses c ON c.id=p.course_id WHERE c.instructor_id=? AND p.status='completed') grossRevenue,
      (SELECT COUNT(DISTINCT pr.user_id) FROM progress pr JOIN lessons l ON l.id=pr.lesson_id JOIN courses c ON c.id=l.course_id WHERE c.instructor_id=? AND l.duration>0 AND pr.watched_seconds>=l.duration*0.9) activeLearners`, [req.user.id,req.user.id,req.user.id,req.user.id]);
    const [courses] = await db.query(`SELECT c.id,c.title,
      (SELECT COUNT(*) FROM enrollments e WHERE e.course_id=c.id) enrollments,
      (SELECT COALESCE(SUM(p.amount),0) FROM payments p WHERE p.course_id=c.id AND p.status='completed') revenue,
      (SELECT ROUND(AVG(LEAST(pr.watched_seconds/l.duration,1)*100),1) FROM progress pr JOIN lessons l ON l.id=pr.lesson_id WHERE l.course_id=c.id AND l.duration>0) averageProgress
      FROM courses c WHERE c.instructor_id=? ORDER BY revenue DESC`, [req.user.id]);
    res.json({ summary, courses });
  } catch (err) { logger.error("instructor analytics error", { error: err.message }); res.status(500).json({ error: "서버 에러" }); }
};

export const getMyComments = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT cm.id, cm.content, cm.created_at,
              c.id AS course_id, c.title AS course_title,
              u.id AS user_id, u.nickname AS user_nickname
         FROM course_comments cm
         JOIN courses c ON c.id = cm.course_id
         JOIN users u ON u.id = cm.user_id
        WHERE c.instructor_id = ?
        ORDER BY cm.created_at DESC
        LIMIT 50`,
      [req.user.id]
    );
    res.json({
      comments: rows.map((row) => ({
        id: row.id,
        content: row.content,
        created_at: row.created_at,
        course: { id: row.course_id, title: row.course_title },
        user: { id: row.user_id, nickname: row.user_nickname },
      })),
    });
  } catch (err) {
    logger.error("getMyComments error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const createCourse = async (req, res) => {
  const { title, description, thumbnail, category, price = 0, level = "입문" } = req.body;
  if (!title) return res.status(400).json({ error: "제목을 입력하세요" });

  try {
    const [result] = await db.query(
      "INSERT INTO courses (title, description, thumbnail, category, price, level, instructor_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title.trim(), description || "", thumbnail || "", category || "기타", Math.max(0, Number(price)), level, req.user.id]
    );
    res.status(201).json({
      course: {
        id: result.insertId,
        title,
        instructor_id: req.user.id,
      },
    });
  } catch (err) {
    logger.error("createCourse error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const updateMyCourse = async (req, res) => {
  const { courseId } = req.params;
  const { title, description, thumbnail, category } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT id FROM courses WHERE id = ? AND instructor_id = ?",
      [courseId, req.user.id]
    );
    if (!rows[0]) return res.status(403).json({ error: "권한 없음" });

    await db.query(
      "UPDATE courses SET title=?, description=?, thumbnail=?, category=? WHERE id=?",
      [title, description, thumbnail, category, courseId]
    );
    res.json({ message: "강의가 수정되었습니다." });
  } catch (err) {
    logger.error("updateMyCourse error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const deleteMyCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT id FROM courses WHERE id = ? AND instructor_id = ?",
      [courseId, req.user.id]
    );
    if (!rows[0]) return res.status(403).json({ error: "권한 없음" });

    await db.query("DELETE FROM courses WHERE id = ?", [courseId]);
    res.json({ message: "강의가 삭제되었습니다." });
  } catch (err) {
    logger.error("deleteMyCourse error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const addLesson = async (req, res) => {
  const { courseId } = req.params;
  const { title, video_url, order, duration } = req.body;
  if (!title) return res.status(400).json({ error: "레슨 제목을 입력하세요" });

  try {
    const [owner] = await db.query(
      "SELECT id FROM courses WHERE id = ? AND instructor_id = ?",
      [courseId, req.user.id]
    );
    if (!owner[0]) return res.status(403).json({ error: "권한 없음" });

    const [result] = await db.query(
      "INSERT INTO lessons (course_id, title, video_url, `order`, duration) VALUES (?, ?, ?, ?, ?)",
      [courseId, title, video_url || "", order || 0, duration || 0]
    );
    res.status(201).json({
      lesson: {
        id: result.insertId,
        course_id: parseInt(courseId),
        title,
        order: order || 0,
        duration: duration || 0,
      },
    });
  } catch (err) {
    logger.error("addLesson error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const updateLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { title, video_url, order, duration } = req.body;

  try {
    const [owner] = await db.query(
      "SELECT id FROM courses WHERE id = ? AND instructor_id = ?",
      [courseId, req.user.id]
    );
    if (!owner[0]) return res.status(403).json({ error: "권한 없음" });

    await db.query(
      "UPDATE lessons SET title=?, video_url=?, `order`=?, duration=? WHERE id=? AND course_id=?",
      [title, video_url, order, duration, lessonId, courseId]
    );
    res.json({ message: "레슨이 수정되었습니다." });
  } catch (err) {
    logger.error("updateLesson error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const deleteLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;

  try {
    const [owner] = await db.query(
      "SELECT id FROM courses WHERE id = ? AND instructor_id = ?",
      [courseId, req.user.id]
    );
    if (!owner[0]) return res.status(403).json({ error: "권한 없음" });

    await db.query("DELETE FROM lessons WHERE id = ? AND course_id = ?", [lessonId, courseId]);
    res.json({ message: "레슨이 삭제되었습니다." });
  } catch (err) {
    logger.error("deleteLesson error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};
