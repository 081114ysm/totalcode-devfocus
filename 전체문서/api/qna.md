# API — Q&A 게시판

## GET `/api/qna` — 질문 목록 조회

| 인증 | 불필요 |

**응답 200**
```json
{
  "questions": [
    {
      "id": 1,
      "title": "useEffect 의존성 배열이 뭔가요?",
      "author": { "id": 1, "nickname": "홍길동" },
      "answerCount": 3,
      "created_at": "2026-04-20T00:00:00.000Z"
    }
  ]
}
```

---

## POST `/api/qna` — 질문 작성

| 인증 | O (모든 역할) |

**요청 바디**

| 필드 | 타입 | 필수 | 제약조건 |
|------|------|:----:|---------|
| `title` | string | O | 2자 이상 |
| `content` | string | O | 빈 값 불가 |

```json
{
  "title": "useEffect 의존성 배열이 뭔가요?",
  "content": "두 번째 인자에 들어가는 배열이 정확히 어떤 역할을 하는지 궁금합니다."
}
```

**응답 201**
```json
{
  "question": {
    "id": 2,
    "title": "useEffect 의존성 배열이 뭔가요?",
    "content": "두 번째 인자에...",
    "author": { "id": 1, "nickname": "홍길동" },
    "created_at": "2026-04-22T10:00:00.000Z"
  }
}
```

---

## GET `/api/qna/:id` — 질문 상세 + 답변 목록

| 인증 | 불필요 |

**응답 200**
```json
{
  "question": {
    "id": 1,
    "title": "useEffect 의존성 배열이 뭔가요?",
    "content": "두 번째 인자에 들어가는 배열이...",
    "author": { "id": 1, "nickname": "홍길동" },
    "created_at": "2026-04-20T00:00:00.000Z"
  },
  "answers": [
    {
      "id": 1,
      "content": "의존성 배열에 포함된 값이 바뀔 때마다 effect가 재실행됩니다.",
      "author": { "id": 2, "nickname": "김강사" },
      "created_at": "2026-04-21T00:00:00.000Z"
    }
  ]
}
```

**에러**
- `404` — 질문 없음

---

## POST `/api/qna/answer` — 답변 작성

| 인증 | O (모든 역할) |

**요청 바디**

| 필드 | 타입 | 필수 |
|------|------|:----:|
| `questionId` | number | O |
| `content` | string | O |

```json
{ "questionId": 1, "content": "의존성 배열에 포함된 값이 바뀔 때마다 effect가 재실행됩니다." }
```

**응답 201**
```json
{
  "answer": {
    "id": 2,
    "content": "의존성 배열에...",
    "author": { "id": 2, "nickname": "김강사" },
    "created_at": "2026-04-22T10:00:00.000Z"
  }
}
```
