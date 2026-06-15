import cron from "node-cron";
import db from "./db.js";
import logger from "./logger.js";
import { calculateSettlements } from "../controllers/settlements.js";
import { sendDiscord } from "../services/discord.js";

async function runJob(name,job){ try{ const message=await job(); await db.query("INSERT INTO job_logs (job_name,status,message) VALUES (?,'success',?)",[name,String(message||"ok")]); }catch(error){ logger.error("scheduled job failed",{name,error:error.message}); await db.query("INSERT INTO job_logs (job_name,status,message) VALUES (?,'failed',?)",[name,error.message]).catch(()=>{}); } }

if(process.env.DISABLE_SCHEDULER!=="true"){
  cron.schedule("0 * * * *",()=>runJob("expire_payments",async()=>{const [result]=await db.query("UPDATE payments SET status='failed' WHERE status='pending' AND created_at < NOW()-INTERVAL 30 MINUTE"); return `${result.affectedRows} expired`; }));
  cron.schedule("15 3 * * *",()=>runJob("cleanup_focus",async()=>{const [result]=await db.query("DELETE FROM focus_sessions WHERE created_at < NOW()-INTERVAL 90 DAY"); return `${result.affectedRows} deleted`; }));
  cron.schedule("0 2 1 * *",()=>runJob("monthly_settlements",async()=>calculateSettlements(new Date(Date.now()-86400000).toISOString().slice(0,7))));
  cron.schedule("0 9 * * 1",()=>runJob("weekly_digest",async()=>{const [[stats]]=await db.query("SELECT COUNT(*) courses FROM courses"); await sendDiscord(`DevFocus 주간 운영 리포트: 강의 ${stats.courses}개`); return "sent";}));
}
