import db from "../config/db.js";

export async function calculateSettlements(period = new Date().toISOString().slice(0,7)) {
  await db.query(`INSERT INTO settlements (instructor_id,period,total_amount,platform_fee,net_amount)
    SELECT c.instructor_id, ?, SUM(p.amount), ROUND(SUM(p.amount)*0.2), ROUND(SUM(p.amount)*0.8)
    FROM payments p JOIN courses c ON c.id=p.course_id
    WHERE p.status='completed' AND c.instructor_id IS NOT NULL AND DATE_FORMAT(p.created_at,'%Y-%m')=?
    GROUP BY c.instructor_id
    ON DUPLICATE KEY UPDATE total_amount=VALUES(total_amount),platform_fee=VALUES(platform_fee),net_amount=VALUES(net_amount)`, [period,period]);
  return period;
}
export async function getMySettlements(req,res){ const [settlements]=await db.query("SELECT * FROM settlements WHERE instructor_id=? ORDER BY period DESC",[req.user.id]); res.json({settlements}); }
export async function getMySummary(req,res){ const [[summary]]=await db.query("SELECT COALESCE(SUM(total_amount),0) totalAmount,COALESCE(SUM(net_amount),0) netAmount,COALESCE(SUM(status='paid'),0) paidCount FROM settlements WHERE instructor_id=?",[req.user.id]); res.json(summary); }
export async function getAllSettlements(req,res){ const [settlements]=await db.query("SELECT s.*,u.nickname,u.email FROM settlements s JOIN users u ON u.id=s.instructor_id ORDER BY s.period DESC,s.created_at DESC"); res.json({settlements}); }
export async function triggerCalculation(req,res){ const period=await calculateSettlements(req.body.period); res.json({message:"정산 계산이 완료되었습니다",period}); }
export async function markAsPaid(req,res){ const [result]=await db.query("UPDATE settlements SET status='paid',paid_at=NOW() WHERE id=? AND status='pending'",[req.params.settlementId]); if(!result.affectedRows)return res.status(404).json({error:"대기 중인 정산을 찾을 수 없습니다"}); res.json({message:"지급 완료 처리되었습니다"}); }
