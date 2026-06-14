import express from "express"; import { authMiddleware } from "../middleware/auth.js"; import { startFocus,endFocus,getFocusHistory } from "../controllers/focus.js";
const router=express.Router(); router.use(authMiddleware); router.post("/start",startFocus); router.post("/end",endFocus); router.get("/history",getFocusHistory); export default router;
