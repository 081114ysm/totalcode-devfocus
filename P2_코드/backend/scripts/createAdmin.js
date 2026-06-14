import bcrypt from "bcrypt";
import db from "../config/db.js";

const email=process.env.ADMIN_EMAIL; const password=process.env.ADMIN_PASSWORD; const nickname=process.env.ADMIN_NICKNAME||"관리자";
if(!email||!password||password.length<8) throw new Error("ADMIN_EMAIL과 8자 이상의 ADMIN_PASSWORD가 필요합니다");
const hash=await bcrypt.hash(password,12);
await db.query(`INSERT INTO users (email,password,nickname,role) VALUES (?,?,?,'admin') ON DUPLICATE KEY UPDATE password=VALUES(password),nickname=VALUES(nickname),role='admin'`,[email,hash,nickname]);
await db.end(); console.log(`Admin ready: ${email}`);
