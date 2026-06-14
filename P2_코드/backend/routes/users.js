import express from "express";
import { getMe, updateMe } from "../controllers/users.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateNickname } from "../middleware/validate.js";
const router=express.Router(); router.use(authMiddleware); router.get("/me",getMe); router.patch("/me",validateNickname,updateMe); export default router;
