import crypto from "node:crypto";
import db from "../config/db.js";

function validSignature(raw,signature){ if(!process.env.WEBHOOK_SECRET)return process.env.NODE_ENV!=="production"; const expected=crypto.createHmac("sha256",process.env.WEBHOOK_SECRET).update(raw).digest("hex"); try{return crypto.timingSafeEqual(Buffer.from(signature||""),Buffer.from(expected));}catch{return false;} }
export async function receiveWebhook(req,res){
  const raw=JSON.stringify(req.body); if(!validSignature(raw,req.headers["x-devfocus-signature"]))return res.status(401).json({error:"Webhook 서명이 올바르지 않습니다"});
  const {id,type,data}=req.body; if(!id||!type)return res.status(400).json({error:"이벤트 id와 type이 필요합니다"});
  try{ await db.query("INSERT INTO webhook_events (provider,event_id,event_type,payload) VALUES (?,?,?,?)",[req.params.provider,id,type,JSON.stringify(req.body)]); }catch(error){ if(error.code==="ER_DUP_ENTRY")return res.status(200).json({duplicate:true}); throw error; }
  if(type==="payment.completed"&&data?.paymentKey)await db.query("UPDATE payments SET status='completed' WHERE payment_key=? AND status='pending'",[data.paymentKey]);
  await db.query("UPDATE webhook_events SET status='processed',processed_at=NOW() WHERE provider=? AND event_id=?",[req.params.provider,id]);
  res.status(202).json({received:true});
}
