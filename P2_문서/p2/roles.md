# P2 역할 명세 — DevFocus RBAC

## 1. 역할 계층 구조

```
admin
 └─ instructor  (admin 권한 포함)
      └─ student  (기본값)
```

역할은 계층적으로 상위 역할이 하위 역할의 권한을 포함한다.
단, `requireRole` 미들웨어는 허용 역할을 명시적으로 나열하는 방식으로 구현한다.

---

## 2. 역할별 권한 매트릭스

| 기능 영역 | student | instructor | admin |
|-----------|:-------:|:----------:|:-----:|
| 강의 열람 | O | O | O |
| 수강 신청 | O | O | O |
| 강의 좋아요 / 댓글 | O | O | O |
| 집중 타이머 이용 | O | O | O |
| Q&A 질문/답변 | O | O | O |
| 코드 스니펫 이용 | O | O | O |
| 결제 기능 이용 | O | O | O |
| 내 정산 조회 | X | O | O |
| **강의 생성** | X | O (본인) | O |
| **강의 수정/삭제** | X | O (본인) | O |
| **레슨 추가/수정/삭제** | X | O (본인 강의) | O |
| **강사 대시보드** | X | O | O |
| **전체 사용자 목록** | X | X | O |
| **역할 변경** | X | X | O |
| **사용자 강제 삭제** | X | X | O |
| **모든 강의 강제 삭제** | X | X | O |
| **전체 통계 조회** | X | X | O |
| **정산 지급 처리** | X | X | O |

---

## 3. 역할 부여 규칙

| 상황 | 규칙 |
|------|------|
| 회원가입 시 `role` 미지정 | `student`로 자동 설정 |
| 회원가입 시 `role: "admin"` 요청 | `student`로 강제 다운그레이드 |
| 회원가입 허용 역할 | `student`, `instructor` 만 가능 |
| admin 역할 부여 | `PATCH /api/admin/users/:id/role` (admin 전용) 또는 `npm run create-admin` 스크립트 |

---

## 4. 소유권 검증

강사는 **본인이 생성한 강의/레슨만** 수정·삭제할 수 있다.

```
courses.instructor_id === req.user.id
  → 일치: 허용
  → 불일치 + req.user.role !== 'admin': 403 권한 없음
  → 불일치 + req.user.role === 'admin': 허용 (관리자 우선)
```

admin은 소유권에 관계없이 모든 강의/레슨에 접근 가능하다.

---

## 5. 역할별 접근 가능 엔드포인트

### student (+ 공개 엔드포인트)
```
GET  /api/courses
GET  /api/courses/:id
POST /api/courses/:id/enroll
POST /api/courses/:id/like
POST /api/courses/:id/comment
GET/POST /api/progress
GET/POST /api/focus
GET/POST /api/qna
GET/POST/PATCH/DELETE /api/snippets
POST /api/payments/initiate
POST /api/payments/confirm
GET  /api/payments/my
```

### instructor (student 포함)
```
GET/POST/PATCH/DELETE /api/instructor/courses
POST/PATCH/DELETE /api/instructor/courses/:id/lessons
GET /api/settlements/my
GET /api/settlements/my/summary
```

### admin (전체 포함)
```
GET/PATCH/DELETE /api/admin/users
GET/DELETE /api/admin/courses
GET /api/admin/stats
GET /api/admin/settlements
POST /api/admin/settlements/calculate
PATCH /api/admin/settlements/:id/pay
```
