import bcrypt from "bcrypt";
import db from "../config/db.js";

const accounts = [
  {
    email: process.env.ADMIN_EMAIL || "admin@devfocus.local",
    password: process.env.ADMIN_PASSWORD || "Admin1234!",
    nickname: process.env.ADMIN_NICKNAME || "DevFocusAdmin",
    role: "admin"
  },
  {
    email: process.env.INSTRUCTOR_EMAIL || "instructor@devfocus.local",
    password: process.env.INSTRUCTOR_PASSWORD || "Instructor1234!",
    nickname: process.env.INSTRUCTOR_NICKNAME || "DevFocusInstructor",
    role: "instructor"
  },
  {
    email: process.env.STUDENT_EMAIL || "student@devfocus.local",
    password: process.env.STUDENT_PASSWORD || "Student1234!",
    nickname: process.env.STUDENT_NICKNAME || "DevFocusStudent",
    role: "student"
  }
];

for (const account of accounts) {
  if (!account.email || !account.password || account.password.length < 8) {
    throw new Error(`Invalid credentials for ${account.role}`);
  }
  const hash = await bcrypt.hash(account.password, 12);
  await db.query(
    `INSERT INTO users (email, password, nickname, role)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       password = VALUES(password),
       nickname = VALUES(nickname),
       role = VALUES(role)`,
    [account.email, hash, account.nickname, account.role]
  );
}

await db.end();
console.log("Demo accounts ready:", accounts.map((account) => account.email).join(", "));
