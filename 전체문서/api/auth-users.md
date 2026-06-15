# API — 인증 + 사용자

## 1. 인증 (Auth)

### POST `/api/auth/register` — 회원가입

| 항목 | 내용 |
|------|------|
| 인증 | 불필요 |
| Rate Limit | 15분 / 20회 |

**요청 바디**

| 필드 | 타입 | 필수 | 제약조건 |
|------|------|:----:|---------|
| `email` | string | O | 이메일 형식, UNIQUE |
| `password` | string | O | 4자 이상 |
| `nickname` | string | O | 2자 이상 |
| `role` | string | X | `student` \| `instructor` (기본값: `student`) |

```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "홍길동",
  "role": "student"
}
```

**응답 201**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "홍길동",
    "role": "student"
  }
}
```

**에러**
- `400` — 유효성 검사 실패 (이메일 형식, 비밀번호 길이, 닉네임 길이)
- `409` — 이미 존재하는 이메일

---

### POST `/api/auth/login` — 로그인

| 항목 | 내용 |
|------|------|
| 인증 | 불필요 |
| Rate Limit | 15분 / 20회 |

**요청 바디**

| 필드 | 타입 | 필수 |
|------|------|:----:|
| `email` | string | O |
| `password` | string | O |

```json
{ "email": "user@example.com", "password": "password123" }
```

**응답 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "홍길동",
    "role": "instructor"
  }
}
```

**에러**
- `401` — 이메일 또는 비밀번호가 올바르지 않습니다

---

## 2. 사용자 (Users)

### GET `/api/users/me` — 내 정보 조회

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**응답 200**
```json
{
  "id": 1,
  "email": "user@example.com",
  "nickname": "홍길동",
  "role": "student",
  "created_at": "2026-01-01T00:00:00.000Z"
}
```

---

### PATCH `/api/users/me` — 닉네임 수정

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**요청 바디**

| 필드 | 타입 | 필수 | 제약조건 |
|------|------|:----:|---------|
| `nickname` | string | O | 2자 이상 |

```json
{ "nickname": "새닉네임" }
```

**응답 200**
```json
{ "message": "닉네임이 수정되었습니다.", "nickname": "새닉네임" }
```
