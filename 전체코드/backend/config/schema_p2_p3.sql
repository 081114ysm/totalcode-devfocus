-- 1. users에 role 컬럼 추가 (없을 때만)
SET @s = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='users' AND COLUMN_NAME='role') > 0,
  'SELECT 1',
  "ALTER TABLE users ADD COLUMN role ENUM('student','instructor','admin') NOT NULL DEFAULT 'student'"
));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='courses' AND COLUMN_NAME='price') > 0, 'SELECT 1', 'ALTER TABLE courses ADD COLUMN price INT NOT NULL DEFAULT 0'));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='courses' AND COLUMN_NAME='level') > 0, 'SELECT 1', "ALTER TABLE courses ADD COLUMN level ENUM('입문','초급','중급','고급') NOT NULL DEFAULT '입문'"));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='courses' AND COLUMN_NAME='published') > 0, 'SELECT 1', 'ALTER TABLE courses ADD COLUMN published BOOLEAN NOT NULL DEFAULT TRUE'));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- 2. courses에 instructor_id 추가 (없을 때만)
SET @s = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='courses' AND COLUMN_NAME='instructor_id') > 0,
  'SELECT 1',
  'ALTER TABLE courses ADD COLUMN instructor_id INT DEFAULT NULL'
));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- 3. instructor_id 외래키 (없을 때만)
SET @s = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='courses' AND CONSTRAINT_NAME='fk_course_instructor') > 0,
  'SELECT 1',
  'ALTER TABLE courses ADD CONSTRAINT fk_course_instructor FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL'
));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- 4. payments 테이블
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  amount INT NOT NULL,
  payment_key VARCHAR(100) NOT NULL UNIQUE,
  order_id VARCHAR(64) NULL UNIQUE,
  provider VARCHAR(30) NOT NULL DEFAULT 'toss',
  method VARCHAR(50) NULL,
  approved_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  receipt_url VARCHAR(500) NULL,
  status ENUM('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='payments' AND COLUMN_NAME='order_id') > 0, 'SELECT 1', 'ALTER TABLE payments ADD COLUMN order_id VARCHAR(64) NULL UNIQUE AFTER payment_key'));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='payments' AND COLUMN_NAME='provider') > 0, 'SELECT 1', "ALTER TABLE payments ADD COLUMN provider VARCHAR(30) NOT NULL DEFAULT 'toss' AFTER order_id"));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='payments' AND COLUMN_NAME='method') > 0, 'SELECT 1', 'ALTER TABLE payments ADD COLUMN method VARCHAR(50) NULL AFTER provider'));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='payments' AND COLUMN_NAME='approved_at') > 0, 'SELECT 1', 'ALTER TABLE payments ADD COLUMN approved_at TIMESTAMP NULL AFTER method'));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='payments' AND COLUMN_NAME='cancelled_at') > 0, 'SELECT 1', 'ALTER TABLE payments ADD COLUMN cancelled_at TIMESTAMP NULL AFTER approved_at'));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='payments' AND COLUMN_NAME='receipt_url') > 0, 'SELECT 1', 'ALTER TABLE payments ADD COLUMN receipt_url VARCHAR(500) NULL AFTER cancelled_at'));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
ALTER TABLE payments MODIFY COLUMN status ENUM('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending';

-- 5. job_logs 테이블 (스케줄러 실행 이력)
CREATE TABLE IF NOT EXISTS job_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_name VARCHAR(100) NOT NULL,
  status ENUM('success','failed') NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. DB 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_focus_user ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_created ON focus_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_snippets_user ON code_snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);

SET @s = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='course_comments' AND COLUMN_NAME='lesson_id') > 0,
  'SELECT 1',
  'ALTER TABLE course_comments ADD COLUMN lesson_id INT DEFAULT NULL AFTER course_id'
));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
SET @s = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='course_comments' AND COLUMN_NAME='reply_content') > 0,
  'SELECT 1',
  'ALTER TABLE course_comments ADD COLUMN reply_content TEXT DEFAULT NULL AFTER content'
));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
SET @s = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='course_comments' AND COLUMN_NAME='reply_user_id') > 0,
  'SELECT 1',
  'ALTER TABLE course_comments ADD COLUMN reply_user_id INT DEFAULT NULL AFTER reply_content'
));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
SET @s = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='course_comments' AND COLUMN_NAME='reply_at') > 0,
  'SELECT 1',
  'ALTER TABLE course_comments ADD COLUMN reply_at TIMESTAMP NULL DEFAULT NULL AFTER reply_user_id'
));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
SET @s = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='course_comments' AND CONSTRAINT_NAME='fk_course_comments_lesson') > 0,
  'SELECT 1',
  'ALTER TABLE course_comments ADD CONSTRAINT fk_course_comments_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL'
));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
SET @s = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='course_comments' AND CONSTRAINT_NAME='fk_course_comments_reply_user') > 0,
  'SELECT 1',
  'ALTER TABLE course_comments ADD CONSTRAINT fk_course_comments_reply_user FOREIGN KEY (reply_user_id) REFERENCES users(id) ON DELETE SET NULL'
));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
CREATE INDEX IF NOT EXISTS idx_course_comments_course ON course_comments(course_id, created_at);
CREATE INDEX IF NOT EXISTS idx_course_comments_lesson ON course_comments(lesson_id, created_at);

-- 7. settlements 테이블 (강사 정산)
CREATE TABLE IF NOT EXISTS settlements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instructor_id INT NOT NULL,
  period VARCHAR(7) NOT NULL,
  total_amount INT NOT NULL DEFAULT 0,
  platform_fee INT NOT NULL DEFAULT 0,
  net_amount INT NOT NULL DEFAULT 0,
  status ENUM('pending','paid') NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_settlement (instructor_id, period),
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_settlements_instructor ON settlements(instructor_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  email VARCHAR(255) NOT NULL,
  channel ENUM('email','discord') NOT NULL DEFAULT 'email',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  unsubscribe_token VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_subscription (email, channel),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS course_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  rating TINYINT NOT NULL,
  content VARCHAR(1000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (user_id, course_id),
  CONSTRAINT chk_rating_p3 CHECK (rating BETWEEN 1 AND 5),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  event_id VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  status ENUM('received','processed','failed') NOT NULL DEFAULT 'received',
  payload JSON NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  UNIQUE KEY unique_provider_event (provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payments(status, created_at);
CREATE INDEX IF NOT EXISTS idx_courses_catalog ON courses(category, created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_course ON course_reviews(course_id, created_at);
CREATE INDEX IF NOT EXISTS idx_job_logs_name_created ON job_logs(job_name, created_at);
