# ERD 테이블 명세 — P2/P3 신규 테이블

## 1. payments (결제) — P2

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 결제 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 결제 사용자 ID |
| `course_id` | INT | FK → courses(id), NOT NULL | 결제 강의 ID |
| `amount` | INT | NOT NULL | 결제 금액(원) |
| `payment_key` | VARCHAR(100) | NOT NULL, UNIQUE | 결제 키 (UUID, Mock 발급) |
| `status` | ENUM | DEFAULT `'pending'` | `pending` \| `completed` \| `failed` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 결제 요청 일시 |

**인덱스**: `idx_payments_user`

**FK 정책**: ON DELETE CASCADE (사용자/강의 삭제 시 결제 내역도 삭제)

**상태 전이**
```
pending ──→ completed  (confirmPayment API 호출)
pending ──→ failed     (30분 초과 시 스케줄러 자동 처리)
```

---

## 2. settlements (강사 정산) — P3

강사별, 월별로 집계된 정산 정보를 저장한다. 플랫폼 수수료 30% / 강사 정산액 70%.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 정산 고유 ID |
| `instructor_id` | INT | FK → users(id), NOT NULL | 강사 ID |
| `period` | VARCHAR(7) | NOT NULL | 정산 기간 (YYYY-MM) |
| `total_amount` | INT | NOT NULL, DEFAULT 0 | 해당 월 총 매출액(원) |
| `platform_fee` | INT | NOT NULL, DEFAULT 0 | 플랫폼 수수료 (total × 30%, 내림) |
| `net_amount` | INT | NOT NULL, DEFAULT 0 | 강사 정산액 (total - fee) |
| `status` | ENUM | DEFAULT `'pending'` | `pending` \| `paid` |
| `paid_at` | TIMESTAMP | nullable | 지급 완료 시각 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 정산 생성일시 |

**UNIQUE KEY**: `(instructor_id, period)` — 동일 기간 중복 계산 방지, `ON DUPLICATE KEY UPDATE`로 재실행 안전

**인덱스**: `idx_settlements_instr`, `idx_settlements_status`

**FK 정책**: ON DELETE CASCADE

**정산 계산 공식**
```
platform_fee = FLOOR(total_amount × 0.30)
net_amount   = total_amount - platform_fee
```

---

## 3. job_logs (스케줄러 실행 로그) — P3

node-cron 스케줄러 작업의 실행 이력을 저장한다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 고유 ID |
| `job_name` | VARCHAR(100) | NOT NULL | 작업 이름 |
| `status` | ENUM | NOT NULL | `success` \| `failed` |
| `message` | TEXT | nullable | 실행 결과 또는 에러 내용 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 실행 시각 |

**job_name 목록**

| job_name | 스케줄 | 설명 |
|----------|--------|------|
| `daily_stats` | 매일 09:00 | Discord에 일별 통계 전송 |
| `cleanup_focus_sessions` | 매주 월요일 03:00 | 90일 이상 된 집중 세션 삭제 |
| `expire_payments` | 매시간 | pending 결제 30분 초과 시 failed 처리 |
| `monthly_settlement` | 매월 1일 02:00 | 전월 강사 정산 자동 계산 |
