import crypto from "node:crypto";
import db from "../config/db.js";
import { sendPaymentEmail } from "../services/email.js";
import { cancelTossPayment, confirmTossPayment } from "../services/tossPayments.js";

export async function initiatePayment(req, res) {
  const [courses] = await db.query("SELECT id,title,price FROM courses WHERE id=? AND published=TRUE", [req.body.courseId]);
  if (!courses[0]) return res.status(404).json({ error: "강의를 찾을 수 없습니다" });
  if (courses[0].price <= 0) return res.status(400).json({ error: "무료 강의는 결제가 필요하지 않습니다" });
  const [enrolled] = await db.query("SELECT id FROM enrollments WHERE user_id=? AND course_id=?", [req.user.id, req.body.courseId]);
  if (enrolled[0]) return res.status(409).json({ error: "이미 수강 중인 강의입니다" });

  await db.query("UPDATE payments SET status='failed' WHERE user_id=? AND course_id=? AND status='pending'", [req.user.id, courses[0].id]);
  const orderId = `DF-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  const pendingKey = `pending_${crypto.randomUUID()}`;
  const [result] = await db.query("INSERT INTO payments (user_id,course_id,amount,payment_key,order_id,provider) VALUES (?,?,?,?,?,'toss')", [req.user.id,courses[0].id,courses[0].price,pendingKey,orderId]);
  const customerKey = crypto.createHash("sha256").update(`${process.env.JWT_SECRET}:${req.user.id}`).digest("hex").slice(0, 32);
  res.status(201).json({ paymentId: result.insertId, orderId, amount: courses[0].price, orderName: courses[0].title, customerKey, demoMode: process.env.ALLOW_MOCK_PAYMENT === "true" });
}

export async function confirmPayment(req, res) {
  const { paymentKey, orderId, amount } = req.body;
  if (!paymentKey || !orderId || !Number.isInteger(Number(amount))) return res.status(400).json({ error: "결제 승인 정보가 올바르지 않습니다" });
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(`SELECT p.*,c.title,u.email FROM payments p JOIN courses c ON c.id=p.course_id JOIN users u ON u.id=p.user_id WHERE p.order_id=? AND p.user_id=? FOR UPDATE`, [orderId,req.user.id]);
    const payment = rows[0];
    if (!payment || payment.status !== "pending") { await connection.rollback(); return res.status(404).json({ error: "유효하지 않은 주문입니다" }); }
    if (Number(amount) !== payment.amount) { await connection.rollback(); return res.status(400).json({ error: "결제 금액이 일치하지 않습니다" }); }

    const approved = await confirmTossPayment({ paymentKey, orderId, amount: payment.amount });
    if (approved.orderId !== orderId || Number(approved.totalAmount) !== payment.amount) throw new Error("결제사 승인 결과가 주문과 일치하지 않습니다");
    await connection.query("UPDATE payments SET status='completed',payment_key=?,method=?,approved_at=?,receipt_url=? WHERE id=?", [paymentKey,approved.method||null,approved.approvedAt?new Date(approved.approvedAt):new Date(),approved.receipt?.url||null,payment.id]);
    await connection.query("INSERT IGNORE INTO enrollments (user_id,course_id) VALUES (?,?)", [req.user.id,payment.course_id]);
    await connection.commit();
    sendPaymentEmail(payment.email,payment.title,payment.amount).catch(() => {});
    res.json({ message: "결제가 완료되었습니다. 수강 신청이 완료되었습니다.", paymentId: payment.id, receiptUrl: approved.receipt?.url || null });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

export async function getMyPayments(req, res) {
  const [payments] = await db.query(`SELECT p.id,p.order_id,p.amount,p.status,p.method,p.receipt_url,p.approved_at,p.created_at,c.id course_id,c.title FROM payments p JOIN courses c ON c.id=p.course_id WHERE p.user_id=? ORDER BY p.created_at DESC`, [req.user.id]);
  res.json({ payments });
}

export async function getAllPayments(req, res) {
  const [payments] = await db.query(`SELECT p.id,p.order_id,p.payment_key,p.amount,p.status,p.method,p.approved_at,p.created_at,c.title course_title,u.email,u.nickname FROM payments p JOIN courses c ON c.id=p.course_id JOIN users u ON u.id=p.user_id ORDER BY p.created_at DESC LIMIT 200`);
  res.json({ payments });
}

export async function cancelPayment(req, res) {
  const [rows] = await db.query("SELECT id,payment_key,status FROM payments WHERE id=?", [req.params.paymentId]);
  const payment = rows[0];
  if (!payment || payment.status !== "completed") return res.status(404).json({ error: "취소 가능한 결제를 찾을 수 없습니다" });
  await cancelTossPayment(payment.payment_key, req.body.reason || "관리자 환불");
  await db.query("UPDATE payments SET status='cancelled',cancelled_at=NOW() WHERE id=?", [payment.id]);
  res.json({ message: "결제가 취소되었습니다" });
}
