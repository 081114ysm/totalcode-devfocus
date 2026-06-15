# API — 결제 + 정산

## 1. 결제 (Payments)

### POST `/api/payments/initiate` — 결제 초기화

| 인증 | O (모든 역할) |

결제 요청을 초기화하고 `paymentKey`를 발급한다 (Mock 구현).

**요청 바디**

| 필드 | 타입 | 필수 | 기본값 |
|------|------|:----:|--------|
| `courseId` | number | O | — |
| `amount` | number | X | `29900` |

```json
{ "courseId": 1, "amount": 29900 }
```

**응답 201**
```json
{
  "paymentKey": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 29900,
  "status": "pending"
}
```

**에러**
- `404` — 강의를 찾을 수 없습니다
- `409` — 이미 수강 중인 강의입니다

---

### POST `/api/payments/confirm` — 결제 완료 처리

| 인증 | O (모든 역할) |

결제를 완료 처리하고 자동으로 수강 신청한다. 완료 시 이메일 발송.

**요청 바디**

| 필드 | 타입 | 필수 |
|------|------|:----:|
| `paymentKey` | string | O |

```json
{ "paymentKey": "550e8400-e29b-41d4-a716-446655440000" }
```

**응답 200**
```json
{
  "message": "결제가 완료되었습니다. 수강 신청이 완료되었습니다.",
  "payment": {
    "id": 5,
    "courseId": 1,
    "amount": 29900,
    "status": "completed"
  }
}
```

**에러**
- `400` — paymentKey가 필요합니다
- `404` — 유효하지 않은 결제입니다 (이미 처리됐거나 존재하지 않는 키)

---

### GET `/api/payments/my` — 내 결제 내역

| 인증 | O (모든 역할) |

**응답 200**
```json
{
  "payments": [
    {
      "id": 5,
      "course": { "id": 1, "title": "React 기초부터 실전까지" },
      "amount": 29900,
      "status": "completed",
      "created_at": "2026-04-22T10:00:00.000Z"
    }
  ]
}
```

**결제 상태 값**

| status | 설명 |
|--------|------|
| `pending` | 결제 요청 후 미완료 |
| `completed` | 결제 완료 |
| `failed` | 실패 또는 30분 초과 만료 (스케줄러 자동 처리) |

---

## 2. 정산 (Settlements)

### GET `/api/settlements/my` — 내 정산 내역

| 인증 | O (`instructor` 또는 `admin`) |

**응답 200**
```json
[
  {
    "id": 1,
    "period": "2026-03",
    "total_amount": 299000,
    "platform_fee": 89700,
    "net_amount": 209300,
    "status": "pending",
    "paid_at": null,
    "created_at": "2026-04-01T02:00:00.000Z"
  }
]
```

---

### GET `/api/settlements/my/summary` — 정산 요약

| 인증 | O (`instructor` 또는 `admin`) |

미지급 합계와 누적 지급액을 반환한다.

**응답 200**
```json
{
  "pendingCount": 2,
  "pendingAmount": 418600,
  "totalPaid": 1046500
}
```

---

## 3. 정산 관리 (Admin)

> 관리자 전용 정산 API는 [admin.md](./admin.md) 참조.

| 엔드포인트 | 설명 |
|-----------|------|
| `GET /api/admin/settlements` | 전체 정산 조회 (period, status 필터) |
| `POST /api/admin/settlements/calculate` | 특정 기간 정산 수동 계산 |
| `PATCH /api/admin/settlements/:id/pay` | 지급 완료 처리 |
