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
  const [courseRows] = await db.query("SELECT id, price FROM courses ORDER BY id ASC");
  const courseIds = courseRows.map((row) => row.id);
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

  const [studentRows] = await db.query("SELECT id FROM users WHERE email = ? LIMIT 1", [accounts[2].email]);
  const studentId = studentRows?.[0]?.id;
  if (studentId && courseIds.length > 0) {
    const [paymentsToSeed] = await db.query(
      "SELECT id FROM payments WHERE payment_key LIKE 'demo_%' OR order_id LIKE 'DEMO-%'"
    );
    if (paymentsToSeed.length > 0) {
      await db.query("DELETE FROM payments WHERE payment_key LIKE 'demo_%' OR order_id LIKE 'DEMO-%'");
    }
    await db.query(
      `INSERT INTO payments
        (user_id, course_id, amount, payment_key, order_id, provider, method, approved_at, cancelled_at, receipt_url, status)
       VALUES
        (?, 1, 39000, 'demo_payment_completed_1', 'DEMO-PAID-001', 'toss', '카드', NOW(), NULL, 'https://example.com/receipt/demo-001', 'completed'),
        (?, 2, 49000, 'demo_payment_cancelled_1', 'DEMO-CANCEL-001', 'toss', '카드', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 1 DAY, 'https://example.com/receipt/demo-002', 'cancelled'),
        (?, 3, 59000, 'demo_payment_pending_1', 'DEMO-PENDING-001', 'toss', NULL, NULL, NULL, NULL, 'pending')`,
      [studentId, studentId, studentId]
    );

    await db.query("DELETE FROM job_logs WHERE job_name LIKE 'demo_%'");
    await db.query(
      `INSERT INTO job_logs (job_name, status, message, created_at) VALUES
       ('demo_daily_sync', 'success', '동기화 완료: 신규 강의 5개, 수강자 1명 반영', NOW() - INTERVAL 3 HOUR),
       ('demo_settlement_batch', 'success', '정산 계산 완료: 1건 지급 대기', NOW() - INTERVAL 2 HOUR),
       ('demo_notification_retry', 'failed', 'Discord 알림 전송 지연 후 재시도 예약', NOW() - INTERVAL 1 HOUR)`
    );

    await db.query("DELETE FROM webhook_events WHERE provider = 'toss-demo'");
    await db.query(
      `INSERT INTO webhook_events (provider, event_id, event_type, status, payload, error_message, created_at, processed_at) VALUES
       ('toss-demo', 'evt_demo_paid_001', 'payment.completed', 'processed', JSON_OBJECT('paymentKey', 'demo_payment_completed_1', 'amount', 39000), NULL, NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 2 HOUR),
       ('toss-demo', 'evt_demo_cancel_001', 'payment.cancelled', 'received', JSON_OBJECT('paymentKey', 'demo_payment_cancelled_1', 'amount', 49000), NULL, NOW() - INTERVAL 90 MINUTE, NULL),
       ('toss-demo', 'evt_demo_failed_001', 'payment.failed', 'failed', JSON_OBJECT('paymentKey', 'demo_payment_pending_1', 'amount', 59000), 'Gateway timeout', NOW() - INTERVAL 45 MINUTE, NULL)`
    );

    await db.query("DELETE FROM settlements WHERE instructor_id = ?", [instructorId]);
    await db.query(
      `INSERT INTO settlements (instructor_id, period, total_amount, platform_fee, net_amount, status, paid_at, created_at) VALUES
       (?, '2026-06', 39000, 3900, 35100, 'pending', NULL, NOW())`,
      [instructorId]
    );
  }
}

await db.end();
console.log("Demo accounts ready:", accounts.map((account) => account.email).join(", "));
