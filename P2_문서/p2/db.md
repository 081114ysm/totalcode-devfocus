# P2 DB 변경사항 — DevFocus

## 1. P1 → P2 스키마 변경

### 1.1 users 테이블 — `role` 컬럼 추가

```sql
ALTER TABLE users
  ADD COLUMN role ENUM('student','instructor','admin') NOT NULL DEFAULT 'student';
```

기존 행은 모두 `'student'`로 설정된다.

### 1.2 courses 테이블 — `instructor_id` 컬럼 추가

```sql
ALTER TABLE courses
  ADD COLUMN instructor_id INT DEFAULT NULL,
  ADD CONSTRAINT fk_course_instructor
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL;
```

강사 계정 삭제 시 강의는 보존하고 `instructor_id`만 NULL로 변경한다.

---

## 2. P2/P3 신규 테이블

### 2.1 payments (결제)

```sql
CREATE TABLE IF NOT EXISTS payments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  course_id   INT NOT NULL,
  amount      INT NOT NULL,
  payment_key VARCHAR(100) NOT NULL UNIQUE,
  status      ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

**상태 전이**
```
pending → completed  (결제 확인)
pending → failed     (30분 초과 시 스케줄러 자동 처리)
```

### 2.2 settlements (강사 정산)

```sql
CREATE TABLE IF NOT EXISTS settlements (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  instructor_id INT NOT NULL,
  period        VARCHAR(7) NOT NULL,         -- YYYY-MM
  total_amount  INT NOT NULL DEFAULT 0,
  platform_fee  INT NOT NULL DEFAULT 0,      -- 30%
  net_amount    INT NOT NULL DEFAULT 0,      -- 70%
  status        ENUM('pending','paid') NOT NULL DEFAULT 'pending',
  paid_at       TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_settlement (instructor_id, period),
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);
```

`UNIQUE KEY (instructor_id, period)` — 동일 기간 중복 계산 방지, `ON DUPLICATE KEY UPDATE`로 재실행 안전.

### 2.3 job_logs (스케줄러 실행 로그)

```sql
CREATE TABLE IF NOT EXISTS job_logs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  job_name   VARCHAR(100) NOT NULL,
  status     ENUM('success','failed') NOT NULL,
  message    TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. P3 성능 인덱스

```sql
CREATE INDEX IF NOT EXISTS idx_progress_user     ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson   ON progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_focus_user        ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_created     ON focus_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_user  ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_snippets_user     ON code_snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user     ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_settlements_instr ON settlements(instructor_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status);
```

---

## 4. 마이그레이션 실행

```bash
# 신규 설치 (P1 전체 스키마)
mysql -u root -p devfocus < backend/src/config/schema.sql

# 기존 DB에 P2/P3 적용
mysql -u root -p devfocus < backend/src/config/schema_p2_p3.sql
```

---

## 5. 환경변수

| 변수 | 필수 | 설명 | 예시 |
|------|:----:|------|------|
| `PORT` | X | 서버 포트 | `3001` |
| `NODE_ENV` | X | 실행 환경 | `development` \| `production` |
| `DB_HOST` | O | MySQL 호스트 | `localhost` |
| `DB_PORT` | X | MySQL 포트 | `3306` |
| `DB_USER` | O | MySQL 사용자 | `root` |
| `DB_PASSWORD` | O | MySQL 비밀번호 | — |
| `DB_NAME` | O | DB 이름 | `devfocus` |
| `JWT_SECRET` | O | JWT 서명 비밀키 | 랜덤 32자 이상 |
| `EMAIL_HOST` | X | SMTP 호스트 | `smtp.gmail.com` |
| `EMAIL_PORT` | X | SMTP 포트 | `587` |
| `EMAIL_USER` | X | Gmail 주소 | `your@gmail.com` |
| `EMAIL_PASS` | X | Gmail 앱 비밀번호 | — |
| `DISCORD_WEBHOOK_URL` | X | Discord 웹훅 URL | — |
| `FRONTEND_URL` | X | CORS 허용 오리진 | `http://localhost:3000` |
| `LOG_LEVEL` | X | 로그 레벨 | `info` \| `debug` |

> `JWT_SECRET`은 프로덕션 환경에서 반드시 강력한 랜덤 값으로 교체해야 한다.

---

## 6. 관리자 계정 초기 설정

### 방법 1 — npm 스크립트 (권장)

```bash
cd backend
npm run create-admin
# 기본: admin@devfocus.com / admin1234!

# 커스텀 계정
ADMIN_EMAIL=myname@example.com ADMIN_PASSWORD=mypassword123 npm run create-admin
```

### 방법 2 — SQL 직접 실행

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### 동작 방식

- 해당 이메일로 계정이 있으면 `role = 'admin'`으로 업데이트
- 계정이 없으면 새로 생성
- Docker 환경: `docker exec devfocus-backend node src/scripts/createAdmin.js`
