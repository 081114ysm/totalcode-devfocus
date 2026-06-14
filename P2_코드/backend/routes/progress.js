import express from "express"; import { authMiddleware } from "../middleware/auth.js"; import { validateProgress } from "../middleware/validate.js"; import { saveProgress,getCourseProgress } from "../controllers/progress.js";
const router=express.Router(); router.use(authMiddleware); router.post("/",validateProgress,saveProgress); router.get("/:courseId",getCourseProgress); export default router;
