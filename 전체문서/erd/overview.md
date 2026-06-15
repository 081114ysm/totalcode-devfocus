# ERD 개요 — DevFocus

## 기본 정보

| 항목 | 내용 |
|------|------|
| DB | MySQL 8.0 |
| 문자셋 | utf8mb4 / utf8mb4_unicode_ci |
| 날짜 형식 | TIMESTAMP / DATETIME (CURRENT_TIMESTAMP 기본값) |
| FK 정책 | 대부분 ON DELETE CASCADE, 예외는 명시 |

---

## ER 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                           users                                  │
├─────────────────────────────────────────────────────────────────┤
│ PK  id           INT AUTO_INCREMENT                             │
│     email        VARCHAR(255) NOT NULL UNIQUE                   │
│     password     VARCHAR(255) NOT NULL                          │
│     nickname     VARCHAR(100) NOT NULL                          │
│     role         ENUM('student','instructor','admin') DEFAULT 'student'  ← P2
│     created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP           │
└──────────┬──────────────────────────────────────────────────────┘
           │ 1:N (instructor_id)  ← P2
           ▼
┌──────────────────────┐      ┌──────────────────────┐
│       courses        │      │       lessons         │
├──────────────────────┤      ├──────────────────────┤
│ PK  id               │◄─────│ FK  course_id         │
│     title            │  1:N │ PK  id               │
│     description      │      │     title            │
│     thumbnail        │      │     video_url        │
│     category         │      │     `order`          │
│ FK  instructor_id    │      │     duration         │
│     created_at       │      │     created_at       │
└──────┬───────────────┘      └───────┬──────────────┘
       │                              │
       │ 1:N                          │ 1:N
       ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│     enrollments      │      │       progress        │
├──────────────────────┤      ├──────────────────────┤
│ PK  id               │      │ PK  id               │
│ FK  user_id          │      │ FK  user_id          │
│ FK  course_id        │      │ FK  lesson_id        │
│     enrolled_at      │      │     watched_seconds  │
│ UNIQUE(user_id,      │      │     updated_at       │
│        course_id)    │      │ UNIQUE(user_id,      │
└──────────────────────┘      │        lesson_id)    │
                              └──────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐
│    course_likes      │      │   course_comments     │
├──────────────────────┤      ├──────────────────────┤
│ PK  id               │      │ PK  id               │
│ FK  user_id          │      │ FK  user_id          │
│ FK  course_id        │      │ FK  course_id        │
│     created_at       │      │     content          │
│ UNIQUE(user_id,      │      │     created_at       │
│        course_id)    │      └──────────────────────┘
└──────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐
│     focus_sessions   │      │    code_snippets      │
├──────────────────────┤      ├──────────────────────┤
│ PK  id               │      │ PK  id               │
│ FK  user_id          │      │ FK  user_id          │
│     start_time       │      │     title            │
│     end_time         │      │     code             │
│     duration         │      │     language         │
│     created_at       │      │     memo             │
└──────────────────────┘      │     created_at       │
                              └──────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐
│      questions       │      │       answers         │
├──────────────────────┤      ├──────────────────────┤
│ PK  id               │◄─────│ FK  question_id       │
│ FK  user_id          │  1:N │ PK  id               │
│     title            │      │ FK  user_id          │
│     content          │      │     content          │
│     created_at       │      │     created_at       │
└──────────────────────┘      └──────────────────────┘

────────── P2/P3 신규 ──────────

┌──────────────────────┐      ┌──────────────────────┐
│      payments        │      │     settlements       │
├──────────────────────┤      ├──────────────────────┤
│ PK  id               │      │ PK  id               │
│ FK  user_id          │      │ FK  instructor_id    │
│ FK  course_id        │      │     period (YYYY-MM) │
│     amount           │      │     total_amount     │
│     payment_key      │      │     platform_fee     │
│     status           │      │     net_amount       │
│     created_at       │      │     status           │
└──────────────────────┘      │     paid_at          │
                              │ UNIQUE(instructor_id,│
                              │        period)       │
                              └──────────────────────┘

┌──────────────────────┐
│      job_logs         │
├──────────────────────┤
│ PK  id               │
│     job_name         │
│     status           │
│     message          │
│     created_at       │
└──────────────────────┘
```

---

## 전체 관계 요약

| 관계 | 카디널리티 | 설명 |
|------|-----------|------|
| users → courses (instructor_id) | 1:N | 강사가 여러 강의 생성 (P2) |
| users → questions | 1:N | 사용자가 여러 질문 작성 |
| users → answers | 1:N | 사용자가 여러 답변 작성 |
| users → focus_sessions | 1:N | 사용자가 여러 집중 세션 |
| users → progress | 1:N | 사용자가 여러 레슨 진도 보유 |
| users → course_likes | 1:N | 사용자가 여러 강의 좋아요 |
| users → course_comments | 1:N | 사용자가 여러 강의 댓글 |
| users → enrollments | 1:N | 사용자가 여러 강의 수강 신청 |
| users → code_snippets | 1:N | 사용자가 여러 코드 스니펫 저장 |
| users → payments | 1:N | 사용자가 여러 결제 내역 보유 (P2) |
| courses → lessons | 1:N | 강의에 여러 레슨 포함 |
| courses → enrollments | 1:N | 강의에 여러 수강 신청 |
| courses → course_likes | 1:N | 강의에 여러 좋아요 |
| courses → course_comments | 1:N | 강의에 여러 댓글 |
| courses → payments | 1:N | 강의에 여러 결제 내역 (P2) |
| lessons → progress | 1:N | 레슨당 여러 진도 기록 |
| questions → answers | 1:N | 질문에 여러 답변 |

**복합 UNIQUE KEY**

| 테이블 | 키 | 목적 |
|--------|-----|------|
| `progress` | `(user_id, lesson_id)` | 사용자별 레슨당 1개 진도 (UPSERT) |
| `course_likes` | `(user_id, course_id)` | 사용자당 강의별 1번 좋아요 |
| `enrollments` | `(user_id, course_id)` | 중복 수강 신청 방지 |
| `settlements` | `(instructor_id, period)` | 강사별 월별 정산 중복 방지 |

---

## 인덱스 목록

### UNIQUE 인덱스 (P1)

| 테이블 | 컬럼 |
|--------|------|
| users | email |
| progress | (user_id, lesson_id) |
| course_likes | (user_id, course_id) |
| enrollments | (user_id, course_id) |

### 성능 인덱스 (P3 추가)

| 인덱스명 | 테이블 | 컬럼 | 목적 |
|----------|--------|------|------|
| `idx_progress_user` | progress | user_id | 사용자별 진도 조회 |
| `idx_progress_lesson` | progress | lesson_id | 레슨별 진도 조회 |
| `idx_focus_user` | focus_sessions | user_id | 사용자별 집중 기록 |
| `idx_focus_created` | focus_sessions | created_at | 90일 이상 세션 정리 |
| `idx_enrollments_user` | enrollments | user_id | 사용자별 수강 목록 |
| `idx_snippets_user` | code_snippets | user_id | 사용자별 스니펫 조회 |
| `idx_payments_user` | payments | user_id | 사용자별 결제 내역 |
| `idx_courses_instructor` | courses | instructor_id | 강사별 강의 목록 |
| `idx_settlements_instr` | settlements | instructor_id | 강사별 정산 조회 |
| `idx_settlements_status` | settlements | status | 미지급 정산 필터 |

---

## 설계 원칙

### 삭제 정책

| 상황 | 정책 | 이유 |
|------|------|------|
| 사용자 삭제 | CASCADE → 질문, 답변, 진도, 집중 기록, 스니펫, 결제 | 개인 데이터이므로 함께 삭제 |
| 강사 삭제 | `courses.instructor_id` → SET NULL | 강의는 콘텐츠 자산이므로 보존 |
| 강의 삭제 | CASCADE → 레슨, 수강신청, 좋아요, 댓글, 결제 | 강의가 없으면 연관 데이터 불필요 |
| 레슨 삭제 | CASCADE → 진도 기록 | 레슨이 없으면 진도 의미 없음 |

### 날짜/시간

- `created_at`: `DEFAULT CURRENT_TIMESTAMP`
- `updated_at`: `ON UPDATE CURRENT_TIMESTAMP` (progress 테이블)
- `end_time`, `paid_at`: 완료 전까지 `NULL` 허용
- `start_time` (focus_sessions): `DATETIME` 사용 (정밀한 경과시간 계산)
