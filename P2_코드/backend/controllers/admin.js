import db from "../config/db.js";
import logger from "../config/logger.js";

export const getStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query("SELECT COUNT(*) as totalUsers FROM users");
    const [[{ totalCourses }]] = await db.query("SELECT COUNT(*) as totalCourses FROM courses");
    const [[{ totalEnrollments }]] = await db.query("SELECT COUNT(*) as totalEnrollments FROM enrollments");
    const [[{ questionCount }]] = await db.query("SELECT COUNT(*) as questionCount FROM questions");
    const [[{ totalFocusSeconds }]] = await db.query(
      "SELECT COALESCE(SUM(duration), 0) as totalFocusSeconds FROM focus_sessions WHERE duration IS NOT NULL"
    );
    const [[{ paymentTotal }]] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as paymentTotal FROM payments WHERE status = 'completed'"
    );
    const [roleRows] = await db.query("SELECT role, COUNT(*) as count FROM users GROUP BY role");
    const usersByRole = { student: 0, instructor: 0, admin: 0 };
    for (const r of roleRows) usersByRole[r.role] = Number(r.count);

    res.json({ totalUsers, totalCourses, totalEnrollments, questionCount, totalFocusSeconds, paymentTotal, usersByRole });
  } catch (err) {
    logger.error("getStats error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, email, nickname, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json({ users });
  } catch (err) {
    logger.error("getAllUsers error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["student", "instructor", "admin"].includes(role)) {
    return res.status(400).json({ error: "유효하지 않은 역할입니다" });
  }

  try {
    const [existing] = await db.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (!existing[0]) return res.status(404).json({ error: "사용자를 찾을 수 없습니다" });

    await db.query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    res.json({ message: "역할이 변경되었습니다.", user: { id: parseInt(userId), role } });
  } catch (err) {
    logger.error("updateUserRole error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ error: "자기 자신은 삭제할 수 없습니다" });
  }
  try {
    const [existing] = await db.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (!existing[0]) return res.status(404).json({ error: "사용자를 찾을 수 없습니다" });

    await db.query("DELETE FROM users WHERE id = ?", [userId]);
    res.json({ message: "사용자가 삭제되었습니다." });
  } catch (err) {
    logger.error("deleteUser error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.title, c.description, c.thumbnail, c.category, c.created_at,
        c.instructor_id,
        u.nickname as instructor_nickname,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollmentCount,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lessonCount
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       ORDER BY c.created_at DESC`
    );
    const courses = rows.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      thumbnail: c.thumbnail,
      category: c.category,
      instructor: c.instructor_id ? { id: c.instructor_id, nickname: c.instructor_nickname } : null,
      enrollmentCount: c.enrollmentCount,
      lessonCount: c.lessonCount,
      created_at: c.created_at,
    }));
    res.json({ courses });
  } catch (err) {
    logger.error("getAllCourses error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const adminDeleteCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const [existing] = await db.query("SELECT id FROM courses WHERE id = ?", [courseId]);
    if (!existing[0]) return res.status(404).json({ error: "강의를 찾을 수 없습니다" });

    await db.query("DELETE FROM courses WHERE id = ?", [courseId]);
    res.json({ message: "강의가 삭제되었습니다." });
  } catch (err) {
    logger.error("adminDeleteCourse error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getOperations = async (req, res) => {
  try {
    const [jobs] = await db.query("SELECT id,job_name,status,message,created_at FROM job_logs ORDER BY created_at DESC LIMIT 50");
    const [webhooks] = await db.query("SELECT id,provider,event_id,event_type,status,error_message,created_at,processed_at FROM webhook_events ORDER BY created_at DESC LIMIT 50");
    const [[payments]] = await db.query("SELECT SUM(status='pending') pendingPayments,SUM(status='failed') failedPayments,SUM(status='cancelled') cancelledPayments FROM payments");
    res.json({ jobs, webhooks, payments });
  } catch (err) { logger.error("operations error", { error: err.message }); res.status(500).json({ error: "서버 에러" }); }
};
