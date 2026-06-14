import crypto from "node:crypto";
import db from "../config/db.js";
import { sendEmail } from "../services/email.js";
import { sendDiscord } from "../services/discord.js";

export async function subscribe(req,res){
  const email=String(req.body.email||"").trim().toLowerCase(); const channel=req.body.channel||"email";
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!["email","discord"].includes(channel))return res.status(400).json({error:"구독 정보가 올바르지 않습니다"});
  const token=crypto.randomUUID();
  await db.query(`INSERT INTO subscriptions (user_id,email,channel,active,unsubscribe_token) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE active=TRUE,user_id=VALUES(user_id),unsubscribe_token=VALUES(unsubscribe_token)`,[req.user?.id||null,email,channel,true,token]);
  if(channel==="email") await sendEmail({to:email,subject:"DevFocus 구독 완료",text:"새 강의와 학습 소식을 보내드릴게요."}); else await sendDiscord(`새 DevFocus 구독: ${email}`);
  res.status(201).json({message:"구독이 완료되었습니다",unsubscribeToken:token});
}
export async function unsubscribe(req,res){ const [result]=await db.query("UPDATE subscriptions SET active=FALSE WHERE unsubscribe_token=?",[req.params.token]); if(!result.affectedRows)return res.status(404).json({error:"구독을 찾을 수 없습니다"}); res.json({message:"구독이 해지되었습니다"}); }
