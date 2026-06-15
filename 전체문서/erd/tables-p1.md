# ERD 테이블 명세 — P1 (기본 테이블)

## 1. users (사용자)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 사용자 고유 ID |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | 이메일 (로그인 ID) |
| `password` | VARCHAR(255) | NOT NULL | bcrypt 해시 비밀번호 |
| `nickname` | VARCHAR(100) | NOT NULL | 닉네임 |
| `role` | ENUM | NOT NULL, DEFAULT `'student'` | `student` \| `instructor` \| `admin` (P2 추가) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 가입일시 |

**관계**: → questions, answers, focus_sessions, progress, course_likes, course_comments, enrollments, code_snippets, courses(instructor_id), payments

---

## 2. courses (강의)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 강의 고유 ID |
| `title` | VARCHAR(255) | NOT NULL | 강의 제목 |
| `description` | TEXT | nullable | 강의 설명 |
| `thumbnail` | VARCHAR(500) | nullable | 썸네일 URL |
| `category` | VARCHAR(100) | DEFAULT `'전체'` | 강의 카테고리 |
| `instructor_id` | INT | FK → users(id), nullable | 강사 ID (P2 추가) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 등록일시 |

**FK 정책**: `instructor_id` ON DELETE SET NULL (강사 삭제 시 강의 보존)

**관계**: → lessons, enrollments, course_likes, course_comments, payments

---

## 3. lessons (강의 영상)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 레슨 고유 ID |
| `course_id` | INT | FK → courses(id), NOT NULL | 소속 강의 ID |
| `title` | VARCHAR(255) | NOT NULL | 레슨 제목 |
| `video_url` | VARCHAR(500) | nullable | 영상 URL |
| `` `order` `` | INT | DEFAULT 0 | 정렬 순서 |
| `duration` | INT | DEFAULT 0 | 영상 길이(초) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 등록일시 |

**FK 정책**: ON DELETE CASCADE

**관계**: → progress

---

## 4. progress (학습 진도)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 진도 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 사용자 ID |
| `lesson_id` | INT | FK → lessons(id), NOT NULL | 레슨 ID |
| `watched_seconds` | INT | DEFAULT 0 | 시청 시간(초) |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | 마지막 수정일시 |

**UNIQUE KEY**: `(user_id, lesson_id)` — UPSERT 보장

**인덱스**: `idx_progress_user`, `idx_progress_lesson`

**FK 정책**: ON DELETE CASCADE

---

## 5. focus_sessions (집중 타이머)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 세션 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 사용자 ID |
| `start_time` | DATETIME | NOT NULL | 집중 시작 시간 |
| `end_time` | DATETIME | nullable | 집중 종료 시간 (진행 중이면 NULL) |
| `duration` | INT | nullable | 집중 시간(초) (종료 후 자동 계산) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |

**인덱스**: `idx_focus_user`, `idx_focus_created` (스케줄러: 90일 이상 세션 정리)

**FK 정책**: ON DELETE CASCADE

---

## 6. questions (Q&A 질문)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 질문 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 작성자 ID |
| `title` | VARCHAR(255) | NOT NULL | 질문 제목 (2자 이상) |
| `content` | TEXT | nullable | 질문 내용 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 작성일시 |

**FK 정책**: ON DELETE CASCADE

**관계**: → answers

---

## 7. answers (Q&A 답변)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 답변 고유 ID |
| `question_id` | INT | FK → questions(id), NOT NULL | 질문 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 작성자 ID |
| `content` | TEXT | NOT NULL | 답변 내용 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 작성일시 |

**FK 정책**: ON DELETE CASCADE

---

## 8. course_likes (강의 좋아요)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 사용자 ID |
| `course_id` | INT | FK → courses(id), NOT NULL | 강의 ID |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 좋아요 시각 |

**UNIQUE KEY**: `(user_id, course_id)`

**FK 정책**: ON DELETE CASCADE

---

## 9. course_comments (강의 댓글)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 작성자 ID |
| `course_id` | INT | FK → courses(id), NOT NULL | 강의 ID |
| `content` | TEXT | NOT NULL | 댓글 내용 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 작성일시 |

**FK 정책**: ON DELETE CASCADE

---

## 10. enrollments (수강 신청)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 사용자 ID |
| `course_id` | INT | FK → courses(id), NOT NULL | 강의 ID |
| `enrolled_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 수강 신청 일시 |

**UNIQUE KEY**: `(user_id, course_id)` — 중복 수강 신청 방지

**인덱스**: `idx_enrollments_user`

**FK 정책**: ON DELETE CASCADE

---

## 11. code_snippets (코드 스니펫)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 작성자 ID |
| `title` | VARCHAR(255) | NOT NULL | 스니펫 제목 |
| `code` | TEXT | NOT NULL | 코드 내용 |
| `language` | VARCHAR(50) | NOT NULL, DEFAULT `'javascript'` | 프로그래밍 언어 |
| `memo` | TEXT | nullable | 메모 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 저장일시 |

**인덱스**: `idx_snippets_user`

**FK 정책**: ON DELETE CASCADE
