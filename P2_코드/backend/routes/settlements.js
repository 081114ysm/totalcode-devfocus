import express from "express"; import { authMiddleware,requireRole } from "../middleware/auth.js"; import { getMySettlements,getMySummary } from "../controllers/settlements.js";
const router=express.Router(); router.use(authMiddleware,requireRole("instructor","admin")); router.get("/my",getMySettlements); router.get("/my/summary",getMySummary); export default router;
