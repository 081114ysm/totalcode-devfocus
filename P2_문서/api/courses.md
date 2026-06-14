# API — 강의 (Courses)

## GET `/api/courses` — 강의 목록 조회

| 항목 | 내용 |
|------|------|
| 인증 | 불필요 |

**쿼리 파라미터**

| 파라미터 | 설명 | 예시 |
|---------|------|------|
| `category` | 카테고리 필터 (`전체` 또는 생략 시 전체) | `?category=프론트엔드` |
| `search` | 제목/설명 부분 검색 | `?search=React` |

**응답 200**
```json
{
  "courses": [
    {
      "id": 1,
      "title": "React 기초부터 실전까지",
      "description": "React의 기본 개념부터 프로젝트 실습까지 배워봅니다.",
      "thumbnail": "/images/react.png",
      "category": "프론트엔드",
      "instructor": { "id": 2, "nickname": "김강사" },
      "lessonCount": 12,
      "likeCount": 24,
      "enrollmentCount": 45,
      "created_at": "2026-01-05T00:00:00.000Z"
    }
  ]
}
```

---

## GET `/api/courses/categories` — 카테고리 목록

| 인증 | 불필요 |

**응답 200**
```json
["전체", "프론트엔드", "백엔드", "알고리즘"]
```

---

## GET `/api/courses/my` — 내 수강 목록

| 인증 | O (모든 역할) |

**응답 200**
```json
[
  {
    "id": 1,
    "title": "React 기초부터 실전까지",
    "enrolled_at": "2026-04-01T00:00:00.000Z",
    "total_lessons": 12,
    "watched_lessons": 5
  }
]
```

---

## GET `/api/courses/:courseId` — 강의 상세 조회

| 항목 | 내용 |
|------|------|
| 인증 | 선택 (로그인 시 liked/enrolled 포함) |

**응답 200**
```json
{
  "id": 1,
  "title": "React 기초부터 실전까지",
  "description": "...",
  "thumbnail": "/images/react.png",
  "category": "프론트엔드",
  "instructor": { "id": 2, "nickname": "김강사" },
  "lessons": [
    { "id": 1, "title": "React란 무엇인가?", "video_url": "https://...", "order": 1, "duration": 600 },
    { "id": 2, "title": "JSX 문법 이해하기", "video_url": "https://...", "order": 2, "duration": 720 }
  ],
  "likeCount": 24,
  "enrollmentCount": 45,
  "liked": false,
  "enrolled": true,
  "comments": [
    {
      "id": 3,
      "content": "정말 유익한 강의입니다!",
      "user": { "id": 5, "nickname": "학생A" },
      "created_at": "2026-04-10T00:00:00.000Z"
    }
  ],
  "created_at": "2026-01-05T00:00:00.000Z"
}
```

**에러**
- `404` — 강의를 찾을 수 없습니다

---

## POST `/api/courses/:courseId/enroll` — 수강 신청

| 인증 | O (모든 역할) |

**응답 201**
```json
{ "message": "수강 신청이 완료되었습니다." }
```

**에러**
- `409` — 이미 수강 신청된 강의입니다

---

## POST `/api/courses/:courseId/like` — 좋아요 토글

| 인증 | O (모든 역할) |

**응답 200**
```json
{ "liked": true, "likeCount": 25 }
```

---

## POST `/api/courses/:courseId/comment` — 댓글 작성

| 인증 | O (모든 역할) |

**요청 바디**

| 필드 | 타입 | 필수 |
|------|------|:----:|
| `content` | string | O |

```json
{ "content": "강의가 매우 유익했습니다!" }
```

**응답 201**
```json
{
  "comment": {
    "id": 5,
    "content": "강의가 매우 유익했습니다!",
    "user": { "id": 1, "nickname": "홍길동" },
    "created_at": "2026-04-22T10:00:00.000Z"
  }
}
```
