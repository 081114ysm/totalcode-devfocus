# P2 API 기능 명세 — DevFocus

> 전체 API 목록과 요청/응답 형식은 [api-spec.md](../api-spec.md) 참조.
> 이 문서는 P2에서 추가된 기능의 처리 흐름과 유효성 검사를 상세히 기술한다.

---

## 1. 인증 (Auth)

### POST `/api/auth/register` — 회원가입 (AUTH-P2-01)

**처리 흐름**
1. 이메일 형식, 비밀번호 4자 이상, 닉네임 2자 이상 검증
2. 이메일 중복 확인 → 중복 시 409
3. bcrypt (saltRounds=10)로 비밀번호 해시
4. `users` 테이블에 저장 (role 포함)
5. JWT 발급 (`{ id, role }` payload, 7일 만료)
6. 환영 이메일 발송 (비동기, 실패해도 응답에 영향 없음)

**입력**

| 필드 | 타입 | 필수 | 제약 |
|------|------|:----:|------|
| `email` | string | O | 이메일 형식, UNIQUE |
| `password` | string | O | 4자 이상 |
| `nickname` | string | O | 2자 이상 |
| `role` | string | X | `student` \| `instructor` (기본값: `student`) |

**응답 201**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": 1, "email": "user@example.com", "nickname": "홍길동", "role": "student" }
}
```

**에러**
- `400` — 유효성 검사 실패
- `409` — 이미 존재하는 이메일

---

### POST `/api/auth/login` — 로그인 (AUTH-P2-02)

**처리 흐름**
1. 이메일로 사용자 조회 → 없으면 401
2. `bcrypt.compare`로 비밀번호 검증 → 불일치 시 401
3. payload `{ id, role }`로 JWT 서명 (7일 만료)

**입력**

| 필드 | 타입 | 필수 |
|------|------|:----:|
| `email` | string | O |
| `password` | string | O |

**응답 200**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": 1, "email": "user@example.com", "nickname": "홍길동", "role": "instructor" }
}
```

**에러**
- `401` — 이메일 또는 비밀번호가 올바르지 않습니다

---

## 2. 관리자 전용 (Admin) — `admin` 역할 필요

### GET `/api/admin/stats` — 전체 통계 (ADMIN-01)

**응답 200**
```json
{
  "totalUsers": 152,
  "totalCourses": 12,
  "totalEnrollments": 430,
  "totalFocusSeconds": 1728000,
  "paymentTotal": 3580000,
  "usersByRole": { "student": 148, "instructor": 3, "admin": 1 }
}
```

---

### GET `/api/admin/users` — 전체 사용자 목록 (ADMIN-02)

**응답 200**
```json
{
  "users": [
    { "id": 1, "email": "user@example.com", "nickname": "홍길동", "role": "student", "created_at": "2026-01-01T00:00:00.000Z" }
  ]
}
```

---

### PATCH `/api/admin/users/:id/role` — 역할 변경 (ADMIN-03)

**유효성 검사**
- `role` 값이 `student`, `instructor`, `admin` 중 하나여야 함
- 존재하지 않는 사용자 → 404

**요청 바디**
```json
{ "role": "instructor" }
```

**응답 200**
```json
{ "message": "역할이 변경되었습니다.", "user": { "id": 2, "role": "instructor" } }
```

---

### DELETE `/api/admin/users/:id` — 사용자 강제 삭제 (ADMIN-04)

**유효성 검사**
- 자기 자신 삭제 불가 → 400
- 존재하지 않는 사용자 → 404

**응답 200**
```json
{ "message": "사용자가 삭제되었습니다." }
```

---

### GET `/api/admin/courses` — 전체 강의 목록 (ADMIN-05)

**응답 200**
```json
{
  "courses": [
    {
      "id": 1,
      "title": "React 기초부터 실전까지",
      "instructor": { "id": 2, "nickname": "김강사" },
      "enrollmentCount": 45,
      "lessonCount": 12,
      "created_at": "2026-01-05T00:00:00.000Z"
    }
  ]
}
```

---

### DELETE `/api/admin/courses/:id` — 강의 강제 삭제 (ADMIN-06)

레슨·수강신청·진도·댓글·좋아요 CASCADE 삭제.

**응답 200**
```json
{ "message": "강의가 삭제되었습니다." }
```

---

## 3. 강사 전용 (Instructor) — `instructor` 또는 `admin` 역할 필요

### GET `/api/instructor/courses` — 내 강의 목록 (INSTR-01)

**응답 200**
```json
{
  "courses": [
    { "id": 3, "title": "TypeScript 완전 정복", "lessonCount": 9, "enrollmentCount": 22, "created_at": "2026-02-01T00:00:00.000Z" }
  ]
}
```

---

### POST `/api/instructor/courses` — 강의 생성 (INSTR-02)

`instructor_id`는 JWT의 `id`로 자동 설정.

**요청 바디**

| 필드 | 타입 | 필수 | 기본값 |
|------|------|:----:|--------|
| `title` | string | O | — |
| `description` | string | X | `""` |
| `thumbnail` | string | X | `""` |
| `category` | string | X | `"기타"` |

**응답 201**
```json
{ "course": { "id": 4, "title": "Next.js 실전 프로젝트", "instructor_id": 2 } }
```

---

### PATCH `/api/instructor/courses/:id` — 강의 수정 (INSTR-03)

소유권 검증: `courses.instructor_id === req.user.id`

**응답 200**
```json
{ "message": "강의가 수정되었습니다." }
```

**에러**
- `403` — 본인 강의가 아님

---

### DELETE `/api/instructor/courses/:id` — 강의 삭제 (INSTR-04)

소유권 검증 후 CASCADE 삭제.

**응답 200**
```json
{ "message": "강의가 삭제되었습니다." }
```

---

### POST `/api/instructor/courses/:id/lessons` — 레슨 추가 (INSTR-05)

**요청 바디**

| 필드 | 타입 | 필수 | 기본값 |
|------|------|:----:|--------|
| `title` | string | O | — |
| `video_url` | string | X | `""` |
| `order` | number | X | `0` |
| `duration` | number | X | `0` |

**응답 201**
```json
{ "lesson": { "id": 10, "course_id": 4, "title": "프로젝트 셋업", "order": 1, "duration": 600 } }
```

---

### PATCH `/api/instructor/courses/:id/lessons/:lessonId` — 레슨 수정 (INSTR-06)

소유권 검증 (강의 소유자 확인).

**응답 200**
```json
{ "message": "레슨이 수정되었습니다." }
```

---

### DELETE `/api/instructor/courses/:id/lessons/:lessonId` — 레슨 삭제 (INSTR-07)

연결된 `progress` 데이터 CASCADE 삭제.

**응답 200**
```json
{ "message": "레슨이 삭제되었습니다." }
```

---

## 4. 에러 응답 코드

| HTTP | 메시지 | 발생 상황 |
|------|--------|----------|
| 400 | 유효성 검사 실패 | 입력값 형식 오류 |
| 401 | 토큰 없음 | Authorization 헤더 누락 |
| 401 | 토큰 오류 | JWT 만료 또는 위변조 |
| 401 | 이메일 또는 비밀번호가 올바르지 않습니다 | 로그인 자격증명 불일치 |
| 403 | 권한 없음 | 역할 부족 또는 소유권 없음 |
| 404 | 사용자를 찾을 수 없습니다 | 존재하지 않는 사용자 ID |
| 404 | 강의를 찾을 수 없습니다 | 존재하지 않는 강의 ID |
| 409 | 이미 존재하는 이메일입니다 | 이메일 중복 |
| 500 | 서버 에러 | 내부 서버 오류 |
