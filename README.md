# DevFocus

DevFocus는 학생, 강사, 관리자를 위한 개발자 강의 플랫폼입니다. Next.js 모바일
프런트엔드, Express API, MySQL DBMS, JWT 역할 기반 권한, 토스페이먼츠 결제,
이메일·Discord 알림, Webhook, 스케줄러, 로그와 모니터링을 포함합니다.

## 주요 경로

- `전체코드/frontend`: Next.js 16 프런트엔드
- `전체코드/backend`: Express 5 API
- `전체문서`: API, ERD, P1~P3 운영 문서
- `.codex`, `AGENTS.md`, `CODEX.md`: AI 협업 하네스와 작업 규칙
- `docker-compose.yml`: MySQL, API, 프런트엔드 컨테이너 구성
- `제출물`: PPT, 발표 원고, 제출 체크리스트

## 실행

```bash
cp 전체코드/backend/.env.example 전체코드/backend/.env
cp 전체코드/frontend/.env.example 전체코드/frontend/.env.local
docker compose up --build
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:3001`
- Health: `http://localhost:3001/health`

실결제에는 토스페이먼츠 테스트 또는 라이브 키가 필요합니다. 자세한 운영 설정은
`전체문서/p3/runbook.md`를 참고합니다.

## 검증

```bash
cd 전체코드/frontend && npm ci && npm run lint && npm run build
cd ../backend && npm install && npm test && npm audit --omit=dev
```
