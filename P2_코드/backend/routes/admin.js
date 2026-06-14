import express from "express";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import {
  getStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllCourses,
  adminDeleteCourse,
  getOperations,
} from "../controllers/admin.js";
import {
  getAllSettlements,
  triggerCalculation,
  markAsPaid,
} from "../controllers/settlements.js";
import { cancelPayment, getAllPayments } from "../controllers/payments.js";

const router = express.Router();

router.use(authMiddleware, requireRole("admin"));

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.patch("/users/:userId/role", updateUserRole);
router.delete("/users/:userId", deleteUser);
router.get("/courses", getAllCourses);
router.delete("/courses/:courseId", adminDeleteCourse);
router.get("/payments", getAllPayments);
router.post("/payments/:paymentId/cancel", cancelPayment);
router.get("/operations", getOperations);

// 정산 관리
router.get("/settlements", getAllSettlements);
router.post("/settlements/calculate", triggerCalculation);
router.patch("/settlements/:settlementId/pay", markAsPaid);

export default router;
