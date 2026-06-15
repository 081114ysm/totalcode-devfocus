# API — 강사 전용 (Instructor)

> 필요 역할: `instructor` 또는 `admin`

---

## 강의 관리

### GET `/api/instructor/courses` — 내 강의 목록

**응답 200**
```json
{
  "courses": [
    {
      "id": 3,
      "title": "TypeScript 완전 정복",
      "description": "타입스크립트의 모든 것",
      "category": "백엔드",
      "lessonCount": 9,
      "enrollmentCount": 22,
      "created_at": "2026-02-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/instructor/courses` — 강의 생성

`instructor_id`는 JWT의 사용자 ID로 자동 설정된다.

**요청 바디**

| 필드 | 타입 | 필수 | 기본값 |
|------|------|:----:|--------|
| `title` | string | O | — |
| `description` | string | X | `""` |
| `thumbnail` | string | X | `""` |
| `category` | string | X | `"기타"` |

```json
{
  "title": "Next.js 실전 프로젝트",
  "description": "풀스택 Next.js 개발",
  "category": "프론트엔드"
}
```

**응답 201**
```json
{
  "course": {
    "id": 4,
    "title": "Next.js 실전 프로젝트",
    "instructor_id": 2
  }
}
```

**에러**
- `400` — 제목을 입력하세요

---

### PATCH `/api/instructor/courses/:id` — 강의 수정

소유권 검증: `courses.instructor_id === req.user.id`

**요청 바디**: 수정할 필드만 포함 (title, description, thumbnail, category)

**응답 200**
```json
{ "message": "강의가 수정되었습니다." }
```

**에러**
- `403` — 권한 없음 (본인 강의 아님)

---

### DELETE `/api/instructor/courses/:id` — 강의 삭제

소유권 검증 후 레슨·수강신청·진도·댓글·좋아요 CASCADE 삭제.

**응답 200**
```json
{ "message": "강의가 삭제되었습니다." }
```

---

## 레슨 관리

### POST `/api/instructor/courses/:id/lessons` — 레슨 추가

**요청 바디**

| 필드 | 타입 | 필수 | 기본값 |
|------|------|:----:|--------|
| `title` | string | O | — |
| `video_url` | string | X | `""` |
| `order` | number | X | `0` |
| `duration` | number | X | `0` (초) |

```json
{
  "title": "프로젝트 셋업",
  "video_url": "https://example.com/video/1",
  "order": 1,
  "duration": 600
}
```

**응답 201**
```json
{
  "lesson": {
    "id": 10,
    "course_id": 4,
    "title": "프로젝트 셋업",
    "order": 1,
    "duration": 600
  }
}
```

---

### PATCH `/api/instructor/courses/:id/lessons/:lessonId` — 레슨 수정

소유권 검증 (강의 소유자 확인).

**요청 바디**: 수정할 필드만 포함 (title, video_url, order, duration)

**응답 200**
```json
{ "message": "레슨이 수정되었습니다." }
```

---

### DELETE `/api/instructor/courses/:id/lessons/:lessonId` — 레슨 삭제

연결된 `progress` 데이터 CASCADE 삭제.

**응답 200**
```json
{ "message": "레슨이 삭제되었습니다." }
```
