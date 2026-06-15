# API — 학습 (진도 + 집중타이머 + 스니펫)

## 1. 학습 진도 (Progress)

### POST `/api/progress` — 진도 저장

| 인증 | O (모든 역할) |

영상별 시청 시간을 저장한다. 기존 기록이 있으면 UPSERT로 업데이트한다.

**요청 바디**

| 필드 | 타입 | 필수 | 제약조건 |
|------|------|:----:|---------|
| `lessonId` | number | O | 양의 정수 |
| `watchedSeconds` | number | O | 0 이상 |

```json
{ "lessonId": 3, "watchedSeconds": 450 }
```

**응답 200**
```json
{ "message": "진도가 저장되었습니다.", "watchedSeconds": 450 }
```

---

### GET `/api/progress/:courseId` — 강의별 진도 조회

| 인증 | O (모든 역할) |

**응답 200**
```json
{
  "progress": [
    { "lessonId": 1, "title": "React란 무엇인가?", "watchedSeconds": 600, "duration": 600 },
    { "lessonId": 2, "title": "JSX 문법 이해하기", "watchedSeconds": 300, "duration": 720 },
    { "lessonId": 3, "title": "useState와 useEffect", "watchedSeconds": 0, "duration": 900 }
  ]
}
```

---

## 2. 집중 타이머 (Focus)

### POST `/api/focus/start` — 집중 시작

| 인증 | O (모든 역할) |

**응답 201**
```json
{
  "session": {
    "id": 10,
    "start_time": "2026-04-22T09:00:00.000Z"
  }
}
```

---

### POST `/api/focus/end` — 집중 종료

| 인증 | O (모든 역할) |

`duration`은 서버에서 자동 계산한다 (`end_time - start_time`, 초 단위).

**요청 바디**

| 필드 | 타입 | 필수 |
|------|------|:----:|
| `sessionId` | number | O |

```json
{ "sessionId": 10 }
```

**응답 200**
```json
{
  "session": {
    "id": 10,
    "start_time": "2026-04-22T09:00:00.000Z",
    "end_time": "2026-04-22T10:30:00.000Z",
    "duration": 5400
  }
}
```

**에러**
- `404` — 세션 없음

---

### GET `/api/focus/history` — 집중 기록 조회

| 인증 | O (모든 역할) |

**응답 200**
```json
{
  "sessions": [
    {
      "id": 10,
      "start_time": "2026-04-22T09:00:00.000Z",
      "end_time": "2026-04-22T10:30:00.000Z",
      "duration": 5400,
      "created_at": "2026-04-22T09:00:00.000Z"
    }
  ],
  "totalSeconds": 18000
}
```

---

## 3. 코드 스니펫 (Snippets)

### GET `/api/snippets` — 내 스니펫 목록

| 인증 | O (모든 역할) |

**쿼리 파라미터**

| 파라미터 | 설명 |
|---------|------|
| `language` | 언어 필터 (`전체` 또는 생략 시 전체) |

**응답 200**
```json
{
  "snippets": [
    {
      "id": 1,
      "title": "useEffect 기본 패턴",
      "code": "useEffect(() => { /* ... */ }, []);",
      "language": "javascript",
      "memo": "컴포넌트 마운트 시 실행",
      "created_at": "2026-04-15T00:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/snippets/languages` — 사용 언어 목록

| 인증 | O (모든 역할) |

**응답 200**
```json
["전체", "javascript", "python", "typescript"]
```

---

### POST `/api/snippets` — 스니펫 저장

| 인증 | O (모든 역할) |

**요청 바디**

| 필드 | 타입 | 필수 | 제약조건 |
|------|------|:----:|---------|
| `title` | string | O | — |
| `code` | string | O | — |
| `language` | string | O | — |
| `memo` | string | X | — |

```json
{
  "title": "useEffect 기본 패턴",
  "code": "useEffect(() => { /* ... */ }, []);",
  "language": "javascript",
  "memo": "컴포넌트 마운트 시 실행"
}
```

**응답 201**
```json
{
  "snippet": {
    "id": 1,
    "title": "useEffect 기본 패턴",
    "code": "useEffect(() => { /* ... */ }, []);",
    "language": "javascript",
    "memo": "컴포넌트 마운트 시 실행",
    "created_at": "2026-04-22T10:00:00.000Z"
  }
}
```

---

### GET `/api/snippets/:id` — 스니펫 상세

| 인증 | O (본인만) |

**응답 200** — 스니펫 전체 필드 반환

**에러**
- `404` — 스니펫을 찾을 수 없습니다

---

### PATCH `/api/snippets/:id` — 스니펫 수정

| 인증 | O (본인만) |

**요청 바디**: 수정할 필드만 포함 (title, code, language, memo 모두 선택)

**응답 200**
```json
{ "snippet": { "id": 1, "title": "수정된 제목", ... } }
```

---

### DELETE `/api/snippets/:id` — 스니펫 삭제

| 인증 | O (본인만) |

**응답 200**
```json
{ "message": "스니펫이 삭제되었습니다." }
```
