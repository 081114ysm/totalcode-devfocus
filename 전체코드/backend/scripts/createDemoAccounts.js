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

const [[instructorRow]] = await db.query(
  "SELECT id FROM users WHERE email = ? LIMIT 1",
  [accounts[1].email]
);

if (instructorRow?.id) {
  const instructorId = instructorRow.id;
  await db.query(
    "UPDATE courses SET instructor_id = ? WHERE id IN (1, 2, 3)",
    [instructorId]
  );

  await db.query(
    `INSERT INTO courses (id, title, description, thumbnail, category, price, level, published, instructor_id)
     VALUES
     (4, 'Next.js App Router Mastery', 'Build a production-ready course platform with the App Router and server actions.', NULL, 'Frontend', 69000, 2, TRUE, ?),
     (5, 'MySQL Indexing and Query Tuning', 'Learn how to speed up course search, enrollment, and admin dashboards.', NULL, 'Database', 59000, 2, TRUE, ?)
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       description = VALUES(description),
       thumbnail = VALUES(thumbnail),
       category = VALUES(category),
       price = VALUES(price),
       level = VALUES(level),
       published = VALUES(published),
       instructor_id = VALUES(instructor_id)`,
    [instructorId, instructorId]
  );

  await db.query(
    `INSERT INTO lessons (course_id, title, video_url, \`order\`, duration) VALUES
     (4, 'Project architecture and folder structure', NULL, 1, 1200),
     (4, 'Server actions and forms', NULL, 2, 1500),
     (4, 'Caching and performance', NULL, 3, 1500),
     (5, 'Indexes that matter', NULL, 1, 1200),
     (5, 'EXPLAIN and slow query analysis', NULL, 2, 1500),
     (5, 'Practical tuning checklist', NULL, 3, 1500)
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       video_url = VALUES(video_url),
       \`order\` = VALUES(\`order\`),
       duration = VALUES(duration)`
  );
}

await db.end();
console.log("Demo accounts ready:", accounts.map((account) => account.email).join(", "));
