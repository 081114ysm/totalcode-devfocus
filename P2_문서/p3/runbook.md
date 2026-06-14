# DevFocus 운영 런북

## 로컬/컨테이너 실행

```bash
export JWT_SECRET='32자 이상의 임의 문자열'
docker compose up --build
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:3001`
- Health: `GET http://localhost:3001/health`

## 필수 운영 설정

`DB_PASSWORD`, `DB_ROOT_PASSWORD`, `JWT_SECRET`, `WEBHOOK_SECRET`은 배포 플랫폼의
secret store에서 주입한다. 이메일은 `SMTP_*`, Discord는
`DISCORD_WEBHOOK_URL`을 설정할 때 활성화된다.

실결제는 토스페이먼츠 개발자센터에서 발급한 키를 사용한다.

```bash
export NEXT_PUBLIC_TOSS_CLIENT_KEY='live_ck_...'
export TOSS_SECRET_KEY='live_sk_...'
export ALLOW_MOCK_PAYMENT=false
```

클라이언트 키만 브라우저에 노출하며 시크릿 키는 반드시 백엔드 secret store에 둔다.
테스트 결제 시에는 `test_ck_...`, `test_sk_...`를 사용한다. 결제 성공 리다이렉트 후
백엔드가 주문 ID와 DB 가격을 대조하고 토스 승인 API를 호출한다.

## Webhook 서명

요청 JSON 문자열을 `WEBHOOK_SECRET`으로 HMAC-SHA256 처리한 16진수 값을
`x-devfocus-signature` 헤더로 전송한다. 공급자 이벤트 ID는 DB unique key로
중복 처리를 차단한다.

## 장애 대응

1. `/health`에서 DB 연결 상태를 확인한다.
2. JSON 로그의 `requestId`로 실패 요청을 추적한다.
3. `job_logs`에서 최근 배치 실패와 메시지를 확인한다.
4. `webhook_events`의 `failed` 이벤트를 원인 수정 후 재처리한다.
5. 결제·정산 수정은 원본 payment와 webhook event를 보존한 상태로 수행한다.

## 배포 전 확인

```bash
.codex/hooks/verify.sh
docker compose config
docker compose build
```
