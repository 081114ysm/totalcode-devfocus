import db from "../config/db.js";
import logger from "../config/logger.js";
import { sendEnrollmentEmail } from "../services/email.js";

export const getCourses = async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = `SELECT c.id, c.title, c.description, c.thumbnail, c.category, c.price, c.level, c.created_at,
      c.instructor_id,
      u.nickname as instructor_nickname,
      (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lessonCount,
      (SELECT COUNT(*) FROM course_likes WHERE course_id = c.id) as likeCount,
      (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollmentCount
      FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.published = TRUE`;
    const params = [];

    if (category && category !== "전체") {
      sql += " AND c.category = ?";
      params.push(category);
    }
    if (search) {
      sql += " AND (c.title LIKE ? OR c.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await db.query(sql, params);
    const courses = rows.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      thumbnail: c.thumbnail,
      category: c.category,
      price: c.price,
      level: c.level,
      instructor: c.instructor_id ? { id: c.instructor_id, nickname: c.instructor_nickname } : null,
      lessonCount: c.lessonCount,
      likeCount: c.likeCount,
      enrollmentCount: c.enrollmentCount,
      created_at: c.created_at,
    }));
    res.json({ courses });
  } catch (err) {
    logger.error("getCourses error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT DISTINCT category FROM courses WHERE category IS NOT NULL");
    const categories = ["전체", ...rows.map(r => r.category)];
    res.json(categories);
  } catch (err) {
    logger.error("getCategories error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getCourseDetail = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user?.id;

  try {
    const [courseRows] = await db.query(
      `SELECT c.id, c.title, c.description, c.thumbnail, c.category, c.price, c.level, c.created_at,
        c.instructor_id, u.nickname as instructor_nickname
       FROM courses c LEFT JOIN users u ON c.instructor_id = u.id
       WHERE c.id = ?`,
      [courseId]
    );
    if (!courseRows[0]) return res.status(404).json({ error: "강의를 찾을 수 없습니다" });
    const c = courseRows[0];

    const [lessons] = await db.query(
      "SELECT * FROM lessons WHERE course_id = ? ORDER BY `order` ASC",
      [courseId]
    );

    const [[{ likeCount }]] = await db.query(
      "SELECT COUNT(*) as likeCount FROM course_likes WHERE course_id = ?",
      [courseId]
    );

    const [[{ enrollmentCount }]] = await db.query(
      "SELECT COUNT(*) as enrollmentCount FROM enrollments WHERE course_id = ?",
      [courseId]
    );

    let liked = false;
    let enrolled = false;
    if (userId) {
      const [userLike] = await db.query(
        "SELECT id FROM course_likes WHERE user_id = ? AND course_id = ?",
        [userId, courseId]
      );
      liked = userLike.length > 0;

      const [userEnroll] = await db.query(
        "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?",
        [userId, courseId]
      );
      enrolled = userEnroll.length > 0;
    }

    const [commentRows] = await db.query(
      `SELECT cm.id, cm.content, cm.created_at, cm.lesson_id, cm.reply_content, cm.reply_at,
              u.id as user_id, u.nickname,
              l.id as lesson_ref_id, l.title as lesson_title, l.\`order\` as lesson_order
       FROM course_comments cm
       JOIN users u ON cm.user_id = u.id
       LEFT JOIN lessons l ON l.id = cm.lesson_id
       WHERE cm.course_id = ? ORDER BY cm.created_at DESC`,
      [courseId]
    );
    const [reviewRows] = await db.query(`SELECT r.id,r.rating,r.content,r.created_at,u.id user_id,u.nickname FROM course_reviews r JOIN users u ON u.id=r.user_id WHERE r.course_id=? ORDER BY r.created_at DESC`, [courseId]);
    const [[reviewSummary]] = await db.query("SELECT ROUND(COALESCE(AVG(rating),0),1) ratingAverage,COUNT(*) reviewCount FROM course_reviews WHERE course_id=?", [courseId]);

    res.json({
      id: c.id,
      title: c.title,
      description: c.description,
      thumbnail: c.thumbnail,
      category: c.category,
      price: c.price,
      level: c.level,
      instructor: c.instructor_id ? { id: c.instructor_id, nickname: c.instructor_nickname } : null,
      lessons,
      likeCount,
      enrollmentCount,
      liked,
      enrolled,
      comments: commentRows.map(cm => ({
        id: cm.id,
        content: cm.content,
        user: { id: cm.user_id, nickname: cm.nickname },
        lesson: cm.lesson_ref_id ? { id: cm.lesson_ref_id, title: cm.lesson_title, order: cm.lesson_order } : null,
        reply: cm.reply_content ? { content: cm.reply_content, reply_at: cm.reply_at } : null,
        created_at: cm.created_at,
      })),
      reviews: reviewRows.map((review) => ({ id:review.id,rating:review.rating,content:review.content,created_at:review.created_at,user:{id:review.user_id,nickname:review.nickname} })),
      ratingAverage: reviewSummary.ratingAverage,
      reviewCount: reviewSummary.reviewCount,
      created_at: c.created_at,
    });
  } catch (err) {
    logger.error("getCourseDetail error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const upsertReview = async (req,res) => {
  const rating=Number(req.body.rating); const content=String(req.body.content||"").trim();
  if(!Number.isInteger(rating)||rating<1||rating>5)return res.status(400).json({error:"평점은 1~5점이어야 합니다"});
  const [enrolled]=await db.query("SELECT id FROM enrollments WHERE user_id=? AND course_id=?",[req.user.id,req.params.courseId]);
  if(!enrolled[0])return res.status(403).json({error:"수강생만 리뷰를 작성할 수 있습니다"});
  await db.query(`INSERT INTO course_reviews (user_id,course_id,rating,content) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE rating=VALUES(rating),content=VALUES(content)`,[req.user.id,req.params.courseId,rating,content.slice(0,1000)]);
  res.status(201).json({message:"리뷰가 저장되었습니다"});
};

export const toggleLike = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  try {
    const [existing] = await db.query(
      "SELECT id FROM course_likes WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );

    if (existing.length > 0) {
      await db.query("DELETE FROM course_likes WHERE user_id = ? AND course_id = ?", [userId, courseId]);
    } else {
      await db.query("INSERT INTO course_likes (user_id, course_id) VALUES (?, ?)", [userId, courseId]);
    }

    const [[{ likeCount }]] = await db.query(
      "SELECT COUNT(*) as likeCount FROM course_likes WHERE course_id = ?",
      [courseId]
    );

    res.json({ liked: existing.length === 0, likeCount });
  } catch (err) {
    logger.error("toggleLike error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const addComment = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;
  const { content, lessonId } = req.body;

  if (!content || content.trim().length < 1) {
    return res.status(400).json({ error: "댓글 내용을 입력하세요" });
  }

  try {
    let resolvedLessonId = null;
    if (lessonId !== undefined && lessonId !== null && lessonId !== "") {
      const [lessonRows] = await db.query(
        "SELECT id FROM lessons WHERE id = ? AND course_id = ?",
        [lessonId, courseId]
      );
      if (!lessonRows[0]) {
        return res.status(404).json({ error: "레슨을 찾을 수 없습니다" });
      }
      resolvedLessonId = lessonRows[0].id;
    }

    const [result] = await db.query(
      "INSERT INTO course_comments (user_id, course_id, lesson_id, content) VALUES (?, ?, ?, ?)",
      [userId, courseId, resolvedLessonId, content.trim()]
    );

    const [rows] = await db.query(
      `SELECT cm.id, cm.content, cm.created_at, cm.lesson_id, cm.reply_content, cm.reply_at,
              u.id as user_id, u.nickname,
              l.id as lesson_ref_id, l.title as lesson_title, l.\`order\` as lesson_order
       FROM course_comments cm JOIN users u ON cm.user_id = u.id
       LEFT JOIN lessons l ON l.id = cm.lesson_id
       WHERE cm.id = ?`,
      [result.insertId]
    );
    const cm = rows[0];

    res.status(201).json({
      comment: {
        id: cm.id,
        content: cm.content,
        user: { id: cm.user_id, nickname: cm.nickname },
        lesson: cm.lesson_ref_id ? { id: cm.lesson_ref_id, title: cm.lesson_title, order: cm.lesson_order } : null,
        reply: cm.reply_content ? { content: cm.reply_content, reply_at: cm.reply_at } : null,
        created_at: cm.created_at,
      },
    });
  } catch (err) {
    logger.error("addComment error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const replyToComment = async (req, res) => {
  const { commentId } = req.params;
  const content = String(req.body.content || "").trim();
  if (!content) return res.status(400).json({ error: "답변 내용을 입력하세요" });

  try {
    const [rows] = await db.query(
      `SELECT cm.id, c.instructor_id
         FROM course_comments cm
         JOIN courses c ON c.id = cm.course_id
        WHERE cm.id = ?`,
      [commentId]
    );
    if (!rows[0]) return res.status(404).json({ error: "댓글을 찾을 수 없습니다" });
    if (req.user.role !== "admin" && rows[0].instructor_id !== req.user.id) {
      return res.status(403).json({ error: "권한 없음" });
    }

    await db.query(
      "UPDATE course_comments SET reply_content = ?, reply_user_id = ?, reply_at = NOW() WHERE id = ?",
      [content, req.user.id, commentId]
    );

    res.json({ message: "댓글 답변이 저장되었습니다" });
  } catch (err) {
    logger.error("replyToComment error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const enrollCourse = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  try {
    const [courseRows] = await db.query("SELECT title, price FROM courses WHERE id = ?", [courseId]);
    if (!courseRows[0]) return res.status(404).json({ error: "강의를 찾을 수 없습니다" });
    if (courseRows[0].price > 0) return res.status(402).json({ error: "유료 강의는 결제 후 수강할 수 있습니다" });
    const [existing] = await db.query(
      "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "이미 수강 신청된 강의입니다" });
    }

    await db.query(
      "INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)",
      [userId, courseId]
    );

    const [userRows] = await db.query("SELECT email, nickname FROM users WHERE id = ?", [userId]);
    if (userRows[0] && courseRows[0]) {
      sendEnrollmentEmail(userRows[0].email, userRows[0].nickname, courseRows[0].title);
    }

    res.status(201).json({ message: "수강 신청이 완료되었습니다." });
  } catch (err) {
    logger.error("enrollCourse error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getMyEnrollments = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT c.*, e.enrolled_at,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons,
        (SELECT COUNT(*) FROM progress p JOIN lessons l ON p.lesson_id = l.id
         WHERE p.user_id = ? AND l.course_id = c.id AND l.duration > 0 AND p.watched_seconds >= l.duration * 0.9) as completed_lessons,
        (SELECT l.id FROM lessons l LEFT JOIN progress p ON p.lesson_id=l.id AND p.user_id=?
         WHERE l.course_id=c.id AND (p.id IS NULL OR p.watched_seconds < l.duration * 0.9)
         ORDER BY l.\`order\`,l.id LIMIT 1) as next_lesson_id
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = ? ORDER BY e.enrolled_at DESC`,
      [userId, userId, userId]
    );
    res.json(rows.map((row) => {
      const completedLessons = Number(row.completed_lessons || 0);
      const totalLessons = Number(row.total_lessons || 0);
      const completionRate = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
      return {
        ...row,
        completed_lessons: completedLessons,
        watched_lessons: completedLessons,
        total_lessons: totalLessons,
        completion_rate: completionRate,
      };
    }));
  } catch (err) {
    logger.error("getMyEnrollments error", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};
