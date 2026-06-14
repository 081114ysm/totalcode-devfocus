# ERD 마이그레이션 — DevFocus

## 신규 설치 (P1 전체)

```bash
mysql -u root -p devfocus < backend/src/config/schema.sql
```

생성 테이블: `users`, `courses`, `lessons`, `progress`, `focus_sessions`, `questions`, `answers`, `course_likes`, `course_comments`, `enrollments`, `code_snippets`

## P2/P3 마이그레이션 (기존 DB)

```bash
mysql -u root -p devfocus < backend/src/config/schema_p2_p3.sql
```

변경 내용:
1. `users.role` 컬럼 추가 (기존 행은 `'student'`)
2. `courses.instructor_id` 컬럼 + FK 추가
3. `payments` 테이블 생성
4. `job_logs` 테이블 생성
5. `settlements` 테이블 생성
6. 성능 인덱스 10개 추가

## 관리자 계정 설정

```bash
cd backend && npm run create-admin
# 또는
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```
