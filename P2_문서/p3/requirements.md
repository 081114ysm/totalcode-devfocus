# P3 운영 요구사항 구현 현황

## 외부 연동

- 이메일: 회원가입, 무료 수강, 결제 완료, 뉴스레터 구독 알림
- Discord: 운영 오류 알림, 구독 알림, 주간 운영 리포트
- Webhook: `POST /api/webhooks/:provider`, HMAC-SHA256 서명과 이벤트 중복 방지
- 결제: 토스페이먼츠 결제위젯, 서버 승인 API, 금액·주문 ID 검증, 영수증, 관리자 환불

## 배치와 관측성

- 매시간 30분 지난 미완료 결제 만료
- 매일 90일 지난 집중 기록 정리
- 매월 강사 정산 계산
- 매주 Discord 운영 리포트
- JSON 구조화 로그, 요청 ID, 응답 시간, `/health`, 관리자 전용 `/metrics`
- 모든 배치 실행 결과를 `job_logs`에 저장

## 보안

- 모든 SQL 값은 `mysql2` 파라미터 바인딩 사용
- React 기본 escaping과 Helmet CSP로 XSS 방어
- JWT 역할과 강의 소유권을 서버에서 검증
- 인증 API와 전체 API에 별도 rate limit 적용
- 운영 환경에서 `JWT_SECRET` 필수, Webhook HMAC 서명 검증
- 결제 금액을 클라이언트 값이 아니라 강의 DB 가격과 비교
- 운영 환경에서는 Mock 결제를 금지하고 `TOSS_SECRET_KEY`가 없으면 승인 요청을 거부

## 성능

- 목록/결제/정산/배치 조회 인덱스
- MySQL connection pool과 keep-alive
- Next.js standalone production build와 압축
- 모바일 우선 반응형 UI, 외부 Google Font 빌드 의존성 제거
