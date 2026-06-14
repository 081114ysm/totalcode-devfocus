# API 개요 — DevFocus

## 기본 정보

| 항목 | 내용 |
|------|------|
| Base URL (로컬) | `http://localhost:3001` |
| 응답 형식 | `application/json` |
| 인코딩 | UTF-8 (utf8mb4) |
| 인증 방식 | JWT Bearer Token |
| 토큰 유효기간 | 7일 |

---

## 인증 헤더

인증이 필요한 API는 아래 헤더를 포함한다.

```
Authorization: Bearer {token}
```

---

## 공통 에러 응답

```json
{ "error": "에러 메시지" }
```

| HTTP | 메시지 | 설명 |
|------|--------|------|
| 400 | 입력값이 올바르지 않습니다 | 유효성 검사 실패 |
| 401 | 토큰 없음 | Authorization 헤더 누락 |
| 401 | 토큰 오류 | JWT 만료/위변조 |
| 401 | 이메일 또는 비밀번호가 올바르지 않습니다 | 로그인 실패 |
| 403 | 권한 없음 | 역할 또는 소유권 부족 |
| 404 | 리소스를 찾을 수 없습니다 | 해당 ID 없음 |
| 409 | 이미 존재하는 이메일입니다 | 이메일 중복 |
| 500 | 서버 에러 | 내부 서버 오류 |

---

## 역할(Role)

| 역할 | 설명 |
|------|------|
| `student` | 기본 사용자. 강의 수강, Q&A, 집중 타이머 등 이용 |
| `instructor` | student 권한 포함 + 강의/레슨 CRUD (본인 강의만) + 정산 조회 |
| `admin` | instructor 권한 포함 + 전체 관리 + 정산 처리 |

---

## 엔드포인트 요약

| Method | Endpoint | 인증 | 역할 | 설명 |
|--------|----------|:----:|------|------|
| POST | `/api/auth/register` | X | — | 회원가입 |
| POST | `/api/auth/login` | X | — | 로그인 |
| GET | `/api/users/me` | O | 모두 | 내 정보 조회 |
| PATCH | `/api/users/me` | O | 모두 | 닉네임 수정 |
| GET | `/api/courses` | X | — | 강의 목록 |
| GET | `/api/courses/categories` | X | — | 카테고리 목록 |
| GET | `/api/courses/my` | O | 모두 | 내 수강 목록 |
| GET | `/api/courses/:id` | 선택 | — | 강의 상세 |
| POST | `/api/courses/:id/enroll` | O | 모두 | 수강 신청 |
| POST | `/api/courses/:id/like` | O | 모두 | 좋아요 토글 |
| POST | `/api/courses/:id/comment` | O | 모두 | 댓글 작성 |
| POST | `/api/progress` | O | 모두 | 진도 저장 |
| GET | `/api/progress/:courseId` | O | 모두 | 진도 조회 |
| POST | `/api/focus/start` | O | 모두 | 집중 시작 |
| POST | `/api/focus/end` | O | 모두 | 집중 종료 |
| GET | `/api/focus/history` | O | 모두 | 집중 기록 |
| GET | `/api/qna` | X | — | 질문 목록 |
| POST | `/api/qna` | O | 모두 | 질문 작성 |
| GET | `/api/qna/:id` | X | — | 질문 상세 |
| POST | `/api/qna/answer` | O | 모두 | 답변 작성 |
| GET | `/api/snippets` | O | 모두 | 스니펫 목록 |
| GET | `/api/snippets/languages` | O | 모두 | 언어 목록 |
| POST | `/api/snippets` | O | 모두 | 스니펫 저장 |
| GET | `/api/snippets/:id` | O | 모두 | 스니펫 상세 |
| PATCH | `/api/snippets/:id` | O | 모두 | 스니펫 수정 |
| DELETE | `/api/snippets/:id` | O | 모두 | 스니펫 삭제 |
| POST | `/api/payments/initiate` | O | 모두 | 결제 초기화 |
| POST | `/api/payments/confirm` | O | 모두 | 결제 완료 |
| GET | `/api/payments/my` | O | 모두 | 내 결제 내역 |
| GET | `/api/settlements/my` | O | instructor+ | 내 정산 내역 |
| GET | `/api/settlements/my/summary` | O | instructor+ | 정산 요약 |
| GET | `/api/instructor/courses` | O | instructor+ | 내 강의 목록 |
| POST | `/api/instructor/courses` | O | instructor+ | 강의 생성 |
| PATCH | `/api/instructor/courses/:id` | O | instructor+ | 강의 수정 |
| DELETE | `/api/instructor/courses/:id` | O | instructor+ | 강의 삭제 |
| POST | `/api/instructor/courses/:id/lessons` | O | instructor+ | 레슨 추가 |
| PATCH | `/api/instructor/courses/:id/lessons/:lessonId` | O | instructor+ | 레슨 수정 |
| DELETE | `/api/instructor/courses/:id/lessons/:lessonId` | O | instructor+ | 레슨 삭제 |
| GET | `/api/admin/stats` | O | admin | 전체 통계 |
| GET | `/api/admin/users` | O | admin | 사용자 목록 |
| PATCH | `/api/admin/users/:id/role` | O | admin | 역할 변경 |
| DELETE | `/api/admin/users/:id` | O | admin | 사용자 삭제 |
| GET | `/api/admin/courses` | O | admin | 전체 강의 관리 |
| DELETE | `/api/admin/courses/:id` | O | admin | 강의 강제 삭제 |
| GET | `/api/admin/settlements` | O | admin | 전체 정산 조회 |
| POST | `/api/admin/settlements/calculate` | O | admin | 정산 수동 계산 |
| PATCH | `/api/admin/settlements/:id/pay` | O | admin | 지급 완료 처리 |
| GET | `/health` | X | — | 서버 상태 |
