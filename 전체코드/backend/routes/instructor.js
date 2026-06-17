import express from "express";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import {
  getMyCourses,
  createCourse,
  updateMyCourse,
  deleteMyCourse,
  addLesson,
  updateLesson,
  deleteLesson,
  getInstructorAnalytics,
  getMyComments,
} from "../controllers/instructor.js";
import { replyToComment } from "../controllers/courses.js";

const router = express.Router();

router.use(authMiddleware, requireRole("instructor", "admin"));

router.get("/courses", getMyCourses);
router.get("/analytics", getInstructorAnalytics);
router.get("/comments", getMyComments);
router.post("/comments/:commentId/reply", replyToComment);
router.post("/courses", createCourse);
router.patch("/courses/:courseId", updateMyCourse);
router.delete("/courses/:courseId", deleteMyCourse);
router.post("/courses/:courseId/lessons", addLesson);
router.patch("/courses/:courseId/lessons/:lessonId", updateLesson);
router.delete("/courses/:courseId/lessons/:lessonId", deleteLesson);

export default router;
