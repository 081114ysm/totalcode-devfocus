# API — 관리자 전용 (Admin) + Health Check

> 필요 역할: `admin` (정산 관련 포함)

---

## 통계

### GET `/api/admin/stats` — 전체 통계

**응답 200**
```json
{
  "totalUsers": 152,
  "totalCourses": 12,
  "totalEnrollments": 430,
  "totalFocusSeconds": 1728000,
  "paymentTotal": 3580000,
  "usersByRole": {
    "student": 148,
    "instructor": 3,
    "admin": 1
  }
}
```

---

## 사용자 관리

### GET `/api/admin/users` — 전체 사용자 목록

**응답 200**
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "nickname": "홍길동",
      "role": "student",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### PATCH `/api/admin/users/:id/role` — 역할 변경

**요청 바디**

| 필드 | 유효값 |
|------|--------|
| `role` | `student` \| `instructor` \| `admin` |

```json
{ "role": "instructor" }
```

**응답 200**
```json
{ "message": "역할이 변경되었습니다.", "user": { "id": 2, "role": "instructor" } }
```

**에러**
- `400` — 유효하지 않은 역할입니다
- `404` — 사용자를 찾을 수 없습니다

---

### DELETE `/api/admin/users/:id` — 사용자 강제 삭제

CASCADE로 연결 데이터 모두 삭제. 자기 자신은 삭제 불가.

**응답 200**
```json
{ "message": "사용자가 삭제되었습니다." }
```

**에러**
- `400` — 자기 자신은 삭제할 수 없습니다
- `404` — 사용자를 찾을 수 없습니다

---

## 강의 관리

### GET `/api/admin/courses` — 전체 강의 목록

**응답 200**
```json
{
  "courses": [
    {
      "id": 1,
      "title": "React 기초부터 실전까지",
      "category": "프론트엔드",
      "instructor": { "id": 2, "nickname": "김강사" },
      "enrollmentCount": 45,
      "lessonCount": 12,
      "created_at": "2026-01-05T00:00:00.000Z"
    }
  ]
}
```

---

### DELETE `/api/admin/courses/:id` — 강의 강제 삭제

레슨·수강신청·진도·댓글·좋아요·결제 내역 CASCADE 삭제.

**응답 200**
```json
{ "message": "강의가 삭제되었습니다." }
```

**에러**
- `404` — 강의를 찾을 수 없습니다

---

## 정산 관리

### GET `/api/admin/settlements` — 전체 정산 조회

**쿼리 파라미터**

| 파라미터 | 설명 | 예시 |
|---------|------|------|
| `period` | 기간 필터 (YYYY-MM) | `?period=2026-03` |
| `status` | 상태 필터 | `?status=pending` |

**응답 200**
```json
[
  {
    "id": 1,
    "instructor_name": "김강사",
    "instructor_email": "inst@example.com",
    "period": "2026-03",
    "total_amount": 299000,
    "platform_fee": 89700,
    "net_amount": 209300,
    "status": "pending",
    "paid_at": null
  }
]
```

---

### POST `/api/admin/settlements/calculate` — 정산 수동 계산

특정 기간의 강사별 정산을 계산하고 저장한다. 이미 계산된 기간이라도 재실행 안전 (UPSERT).

**요청 바디**

| 필드 | 타입 | 제약조건 |
|------|------|---------|
| `period` | string | YYYY-MM 형식 |

```json
{ "period": "2026-03" }
```

**응답 200**
```json
{ "message": "정산 계산 완료", "period": "2026-03", "instructorCount": 3 }
```

**에러**
- `400` — period는 YYYY-MM 형식이어야 합니다

---

### PATCH `/api/admin/settlements/:id/pay` — 지급 완료 처리

**응답 200**
```json
{ "message": "지급 처리 완료" }
```

**에러**
- `404` — 정산 내역을 찾을 수 없습니다
- `400` — 이미 지급된 정산입니다

---

## Health Check

### GET `/health` — 서버 상태

| 인증 | 불필요 |

모니터링 및 배포 확인용.

**응답 200**
```json
{
  "status": "ok",
  "uptime": 86400,
  "timestamp": "2026-04-22T10:00:00.000Z"
}
```
