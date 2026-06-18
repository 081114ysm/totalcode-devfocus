const PDFDocument = require("/tmp/devfocus-pdf/node_modules/pdfkit");
const fs = require("node:fs");
const path = require("node:path");

const outPath = path.join(__dirname, "..", "제출물", "DevFocus_발표자료.pdf");

// MacBook 14" (3024×1964) 비율 = 1.540:1
const W = 841.89;
const H = 547;

const doc = new PDFDocument({ margin: 0, autoFirstPage: false });
doc.pipe(fs.createWriteStream(outPath));

doc.registerFont("KR",      "/tmp/devfocus-pdf/NotoSansKR-Regular.ttf");
doc.registerFont("KR-Bold", "/tmp/devfocus-pdf/NotoSansKR-Bold.ttf");

const C = {
  coral: "#FF5A5F", ink: "#1F1F1F", gray: "#667085",
  line:  "#E7E7E7", paper: "#FFFFFF",
  green: "#00A86B", blue:  "#4568DC", yellow: "#FFC857", dark: "#1F1F1F",
};

function newSlide(bg = C.paper) {
  doc.addPage({ size: [W, H], margin: 0 });
  doc.rect(0, 0, W, H).fill(bg);
}

function footer(n, dark = false) {
  doc.fillColor(dark ? "#AFAFAF" : "#999").font("KR").fontSize(9)
     .text("DEVFOCUS  P3", 36, H - 22);
  doc.text(String(n).padStart(2, "0"), W - 68, H - 22, { width: 32, align: "right" });
}

function label(text, y = 36, dark = false) {
  doc.fillColor(C.coral).font("KR-Bold").fontSize(10)
     .text(text.toUpperCase(), 42, y, { characterSpacing: 1.5 });
}

function heading(text, y = 52, dark = false, size = 22, width = 560) {
  doc.fillColor(dark ? C.paper : C.ink).font("KR-Bold").fontSize(size)
     .text(text, 42, y, { width, lineGap: 3 });
}

function body(text, y = 132, dark = false, width = 760) {
  if (!text) return;
  doc.fillColor(dark ? "#D0D0D0" : C.gray).font("KR").fontSize(13)
     .text(text, 42, y, { width, lineGap: 4 });
}

function card(x, y, w, h, accent, title, text, dark = false) {
  doc.roundedRect(x, y, w, h, 12).fillAndStroke(dark ? "#202020" : C.paper, C.line);
  doc.rect(x, y, 5, h).fill(accent);
  doc.fillColor(dark ? C.paper : C.ink).font("KR-Bold").fontSize(14)
     .text(title, x + 16, y + 16, { width: w - 28 });
  doc.fillColor(dark ? "#D0D0D0" : C.gray).font("KR").fontSize(11)
     .text(text, x + 16, y + 46, { width: w - 28, height: h - 62, lineGap: 4, ellipsis: true });
}

function metric(x, y, value, text, color) {
  doc.fillColor(color).font("KR-Bold").fontSize(36).text(value, x, y, { width: 200 });
  doc.fillColor(C.gray).font("KR").fontSize(11).text(text, x, y + 48, { width: 200 });
}

function infoBox(y, h, accentColor, title, text) {
  doc.rect(42, y, W - 84, h).fill("#F8F8FB");
  doc.rect(42, y, 4, h).fill(accentColor);
  doc.fillColor(C.ink).font("KR-Bold").fontSize(12).text(title, 58, y + 16);
  doc.fillColor(C.gray).font("KR").fontSize(11)
     .text(text, 58, y + 38, { width: W - 116, lineGap: 4 });
}

function statsBar(y, items) {
  doc.moveTo(42, y).lineTo(W - 42, y).lineWidth(1).stroke(C.line);
  items.forEach(([val, desc], i) => {
    const x = 42 + i * ((W - 84) / items.length);
    const w = (W - 84) / items.length;
    doc.fillColor(C.coral).font("KR-Bold").fontSize(15).text(val,  x, y + 12, { width: w, align: "center" });
    doc.fillColor(C.gray).font("KR").fontSize(9.5).text(desc,       x, y + 34, { width: w, align: "center" });
  });
}

// ─────────────────────────────────────────────────────────────
// 1  COVER
// ─────────────────────────────────────────────────────────────
newSlide(C.dark);
doc.circle(715, 72, 95).fill(C.coral);
doc.circle(735, 380, 55).fill(C.yellow);
// 프로젝트 한 줄 소개
doc.fillColor(C.coral).font("KR-Bold").fontSize(10)
   .text("DEVFOCUS", 42, 38, { characterSpacing: 1.5 });
doc.fillColor("#888").font("KR").fontSize(12)
   .text("개발자를 위한 강의 플랫폼 — 강의 탐색 · 결제 · 학습 · 강사 운영 · 모니터링까지 하나의 서비스", 42, 57, { width: 640 });
// 구분선
doc.moveTo(42, 78).lineTo(640, 78).lineWidth(1).stroke("#333");
// P3 타이틀
doc.fillColor(C.coral).font("KR-Bold").fontSize(9)
   .text("P3  PITCH DECK", 42, 88, { characterSpacing: 1.5 });
doc.fillColor(C.paper).font("KR-Bold").fontSize(28)
   .text("P2를 넘어\n운영 가능한 서비스로.", 42, 105, { width: 480, lineGap: 5 });
doc.fillColor("#B0B0B0").font("KR").fontSize(13)
   .text("결제 모듈 · 스케줄러 · 알림 · Webhook · 모니터링\n보안 강화 · 코드 최적화 · AWS 배포", 42, 218, { width: 480, lineGap: 6 });
doc.moveTo(42, 308).lineTo(340, 308).lineWidth(1).stroke("#444");
doc.fillColor("#888").font("KR").fontSize(10)
   .text("P3  |  2026.06.15  |  totalcode-devfocus.vercel.app", 42, 321);

// ─────────────────────────────────────────────────────────────
// 2  P2 → P3 변경 요약
// ─────────────────────────────────────────────────────────────
newSlide(); footer(2);
label("P2 → P3");
heading("P2 인증·권한 위에\n운영 레이어를 쌓았습니다.");
body("P2에서 완성한 JWT·역할 기반 권한·Rate Limit 기반에 결제·알림·스케줄러·모니터링·보안을 추가했습니다.");

// 좌측: P2에서 유지 / 우측: P3에서 추가
doc.moveTo(42, 174).lineTo(W - 42, 174).lineWidth(1).stroke(C.line);

// P2 유지 박스
doc.roundedRect(42, 184, 370, 300, 12).fillAndStroke("#F8F8FB", C.line);
doc.rect(42, 184, 5, 300).fill(C.gray);
doc.fillColor(C.gray).font("KR-Bold").fontSize(12).text("P2에서 가져온 것", 58, 200);
const p2items = [
  "JWT 인증 (httpOnly 쿠키)",
  "역할 기반 권한 (학생 / 강사 / 관리자)",
  "리소스 소유권 검증 미들웨어",
  "Rate Limit (기본)",
  "MySQL 영구 저장 · 18개 테이블",
  "42개 API 엔드포인트",
];
p2items.forEach((t, i) => {
  doc.fillColor(C.gray).font("KR").fontSize(11).text("·  " + t, 58, 228 + i * 22, { width: 340 });
});

// P3 추가 박스
doc.roundedRect(426, 184, 374, 300, 12).fillAndStroke("#FFF8F8", C.line);
doc.rect(426, 184, 5, 300).fill(C.coral);
doc.fillColor(C.coral).font("KR-Bold").fontSize(12).text("P3에서 추가한 것", 442, 200);
const p3items = [
  "Toss 결제 연동 (데모) + Webhook HMAC",
  "스케줄러 4개 (node-schedule)",
  "Discord / 이메일 알림 시스템",
  "/health · /metrics 모니터링",
  "winston 구조화 JSON 로그",
  "SQL Injection · XSS · Helmet 보안",
  "복합 인덱스 16개 · SSR 최적화 · 배포",
];
p3items.forEach((t, i) => {
  doc.fillColor(C.ink).font("KR").fontSize(11).text("·  " + t, 442, 228 + i * 22, { width: 344 });
});

// ─────────────────────────────────────────────────────────────
// 3  결제 모듈
// ─────────────────────────────────────────────────────────────
newSlide(); footer(3);
label("Payment Module");
heading("결제 구조는 완성.\n실키 발급 후 즉시 전환 가능합니다.");
body("Toss Payments 테스트 키로 데모 구현 완료. 서버 검증·Webhook·환불 로직은 실결제와 동일한 구조입니다.");
doc.moveTo(42, 174).lineTo(W - 42, 174).lineWidth(1).stroke(C.line);
metric(68,  195, "데모",   "test_ck_* 키 사용 중",  C.coral);
metric(300, 195, "100%",  "서버 금액 재검증",       C.blue);
metric(540, 195, "HMAC",  "Webhook 서명 검증",      C.green);
infoBox(310, 90, C.coral,
  "결제 흐름 (실결제 전환 시 동일 구조 유지)",
  "클라이언트 요청 → Toss 결제창 열기 → 서버 금액 재검증 → 승인 확정 → 수강 등록 → 강사 정산 적립\n" +
  "실결제 전환: clientKey·secretKey를 Toss 라이브 키로 교체 → 테스트 통과 → 배포");
infoBox(416, 80, C.yellow,
  "다음 단계: 실결제 전환",
  "Toss 사업자 등록 후 라이브 API 키 발급 → .env TOSS_SECRET_KEY 교체 → E2E 결제 테스트 → 프로덕션 배포");

// ─────────────────────────────────────────────────────────────
// 4  스케줄러
// ─────────────────────────────────────────────────────────────
newSlide(); footer(4);
label("Scheduler");
heading("4개의 배치가\n서비스를 자동 운영합니다.");
body("node-schedule 기반. DISABLE_SCHEDULER=false 로 운영 활성화 상태이며, 실행 결과를 job_logs 테이블에 100% 기록합니다.");
doc.moveTo(42, 174).lineTo(W - 42, 174).lineWidth(1).stroke(C.line);
[
  [42,  C.coral,  "결제 만료",    "매시간 정각\n미승인 결제 자동 취소\n결제 상태 → expired\n수강 미등록 처리"],
  [240, C.blue,   "세션 정리",   "매일 03:15\n만료 세션 DB 삭제\n불필요 토큰 정리\n저장 공간 확보"],
  [438, C.green,  "강사 정산",   "매월 1일 00:00\n전월 결제 집계\n정산 금액 자동 계산\n강사별 내역 DB 저장"],
  [636, C.yellow, "운영 리포트", "매주 월요일 09:00\n주간 통계 집계\nDiscord 자동 전송\n회원·결제·완강 수치"],
].forEach(([x, color, title, text]) => {
  card(x, 184, 185, 280, color, title, text);
});
statsBar(477, [["4개","Cron Job"],["매시간","결제 만료"],["매일","세션 정리"],["매월","강사 정산"],["100%","job_logs 기록"]]);

// ─────────────────────────────────────────────────────────────
// 5  알림 시스템
// ─────────────────────────────────────────────────────────────
newSlide(); footer(5);
label("Notification");
heading("에러는 즉시,\n주간 리포트는 자동으로.");
body("Discord Webhook과 이메일(nodemailer) 두 채널로 알림을 발송합니다. Webhook URL·SMTP 설정으로 즉시 활성화 가능.");
card(42,  180, 374, 250, C.blue,  "Discord Webhook",
  "에러 발생 즉시 Discord 채널 알림\n스케줄러 배치 실행 결과 전송\n매주 월: 주간 운영 통계 리포트\nWebhook URL 환경변수 설정으로 활성화\n\n현재: DISCORD_WEBHOOK_URL 미설정 → 비활성 상태");
card(426, 180, 374, 250, C.green, "이메일 (nodemailer)",
  "결제 완료 확인 메일 발송\n환불 처리 완료 알림\n강사 정산 내역 발송\nSMTP 서버 연결 구조 완성\n\n현재: SMTP_USER/PASS 미설정 → 실발송 대기 중");
infoBox(444, 65, C.yellow, "활성화 방법",
  "Discord: .env DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/… 설정\n" +
  "이메일: SMTP_HOST / SMTP_USER / SMTP_PASS 설정 후 재시작");

// ─────────────────────────────────────────────────────────────
// 6  Webhook + HMAC
// ─────────────────────────────────────────────────────────────
newSlide(); footer(6);
label("Webhook & HMAC");
heading("결제 이벤트는\n서명으로 검증합니다.");
body("Toss가 전송하는 결제 이벤트를 HMAC-SHA256 서명으로 검증. 위변조 요청은 즉시 거부합니다.");
doc.moveTo(42, 174).lineTo(W - 42, 174).lineWidth(1).stroke(C.line);
metric(68,  195, "HMAC",   "SHA-256 서명 검증",  C.coral);
metric(300, 195, "멱등성",  "중복 처리 방지",     C.blue);
metric(540, 195, "즉시",   "서명 불일치 거부",    C.green);
infoBox(310, 90, C.coral,
  "Webhook 처리 흐름",
  "POST /payments/webhook 수신 → HMAC-SHA256(body, secretKey) 검증 → 처리 이력 조회 (멱등성)\n" +
  "→ 이벤트 타입 분기 (승인·취소·실패) → 수강 상태 갱신 → Discord 알림 발송");
infoBox(416, 80, C.blue,
  "보안 포인트",
  "서명 불일치 즉시 400 반환 · 재생 공격 방지 · 처리 이력을 DB에 기록해 동일 이벤트 중복 실행 차단\n" +
  "x-toss-signature 헤더 비교 · Buffer.compare로 타이밍 공격 방어");

// ─────────────────────────────────────────────────────────────
// 7  모니터링 & 로그
// ─────────────────────────────────────────────────────────────
newSlide(); footer(7);
label("Monitoring & Logging");
heading("수치로 상태를 보고\nID로 요청을 추적합니다.");
body("/health · /metrics 엔드포인트와 winston JSON 로그로 응답속도·DB상태·배치 결과를 실시간 파악합니다.");
[
  [42,  C.coral, "/health",      "GET /health\nDB ping 응답 확인\nAPI 서버 uptime\n배포 후 자동 헬스체크\nDocker healthcheck 연동"],
  [240, C.blue,  "/metrics",     "GET /metrics\n요청 수 카운팅\n평균·최대 응답시간\np95 응답 시간 추적\n엔드포인트별 집계"],
  [438, C.green, "winston 로그", "JSON 구조화 포맷\nx-request-id 전 구간 연동\nHTTP 요청 자동 기록\n배치·Webhook·에러 레벨 분류"],
  [636, C.yellow,"x-request-id", "모든 요청에 UUID 부여\n요청 → DB → 응답 추적\n에러 발생 시 ID로 역추적\nDiscord 알림에 ID 포함"],
].forEach(([x, color, title, text]) => {
  card(x, 180, 185, 268, color, title, text);
});
statsBar(462, [["/health","DB + uptime"],["/metrics","p95 추적"],["JSON","구조화 로그"],["UUID","요청 ID"],["Discord","에러 즉시"]]);

// ─────────────────────────────────────────────────────────────
// 8  보안 강화
// ─────────────────────────────────────────────────────────────
newSlide(); footer(8);
label("Security");
heading("입력을 차단하고,\n경계를 설정했습니다.");
body("P2 인증 위에 SQL Injection·XSS·Helmet·엔드포인트별 Rate Limit를 추가해 외부 위협 경계를 완성했습니다.");
[
  [42,  C.coral,  "SQL Injection", "mysql2 파라미터 바인딩\n사용자 입력 쿼리 직접 삽입 차단\nORMless 환경에서 안전 쿼리 보장\n모든 DB 쿼리 파라미터화"],
  [240, C.blue,   "XSS 방어",     "Helmet CSP 헤더 적용\nX-Frame-Options: DENY\nX-Content-Type-Options: nosniff\nContent-Security-Policy 설정"],
  [438, C.green,  "Rate Limit",   "API: 100 req / 15분\nAuth: 10 req / 15분 (엄격)\n엔드포인트별 분리 적용\nIP 기반 카운팅"],
  [636, C.yellow, "CORS & 기타",  "화이트리스트 기반 CORS\nJWT httpOnly 쿠키 저장\nHelmet 보안 헤더 묶음\nBcrypt 패스워드 해싱"],
].forEach(([x, color, title, text]) => {
  card(x, 180, 185, 275, color, title, text);
});
statsBar(469, [["SQL","파라미터 바인딩"],["XSS","Helmet CSP"],["100/15m","API Limit"],["10/15m","Auth Limit"],["CORS","화이트리스트"]]);

// ─────────────────────────────────────────────────────────────
// 9  코드 최적화 & 리팩토링
// ─────────────────────────────────────────────────────────────
newSlide(); footer(9);
label("Optimization & Refactoring");
heading("DB는 인덱스로,\n화면은 SSR로 빠르게.");
body("복합 인덱스 16개 추가로 JOIN 쿼리 속도를 높이고, Next.js SSR·Image 최적화로 프론트 초기 렌더링 시간을 단축했습니다.");
doc.moveTo(42, 174).lineTo(W - 42, 174).lineWidth(1).stroke(C.line);
metric(68,  195, "16개",  "복합 인덱스 추가",   C.coral);
metric(300, 195, "SSR",   "Next.js 서버 렌더링", C.blue);
metric(540, 195, "5.6MB", "프로덕션 빌드 크기", C.green);
infoBox(310, 90, C.blue,
  "DB 최적화 상세",
  "복합 인덱스: (course_id, user_id), (user_id, created_at) 등 16개 → JOIN 포함 조회 속도 향상\n" +
  "커넥션 풀 설정 · 불필요한 SELECT * 제거 · N+1 쿼리 패턴 리팩토링");
infoBox(416, 80, C.green,
  "프론트 최적화 상세",
  "Next.js 14 SSR: 초기 로딩 시 서버에서 HTML 완성 → FCP 단축 · SEO 개선\n" +
  "next/image 자동 최적화 · dynamic import 번들 분리 · Vercel Edge Cache 활용 · 빌드 5.6 MB");

// ─────────────────────────────────────────────────────────────
// 10  배포
// ─────────────────────────────────────────────────────────────
newSlide(); footer(10);
label("Deployment");
heading("프론트는 Vercel,\n백엔드는 AWS EC2.");
body("git push 한 번으로 Vercel이 자동 빌드·배포합니다. 백엔드는 Docker로 EC2에서 실행됩니다.");
card(42,  180, 374, 250, C.green, "Frontend — Vercel",
  "GitHub main 브랜치 push → 자동 빌드 시작\nNext.js 14 SSR 빌드 · 빌드 실패 시 배포 차단\nEdge Network CDN 자동 적용\n\n배포 URL\nhttps://totalcode-devfocus.vercel.app");
card(426, 180, 374, 250, C.coral, "Backend — AWS EC2",
  "Docker 컨테이너로 Express 서버 실행\nMySQL도 Docker Compose로 함께 관리\n/health 엔드포인트로 생존 확인\n\n서버 주소\nhttp://13.125.181.228:3001");
infoBox(444, 65, C.blue, "환경 분리",
  "프론트 .env: NEXT_PUBLIC_API_URL · NEXT_PUBLIC_TOSS_CLIENT_KEY (Vercel 환경변수)\n" +
  "백엔드 .env: DB_PASSWORD · TOSS_SECRET_KEY · DISCORD_WEBHOOK_URL · SMTP (EC2 .env.production)");

// ─────────────────────────────────────────────────────────────
// 11  수치로 검증
// ─────────────────────────────────────────────────────────────
newSlide(); footer(11);
label("Validation");
heading("P3에서 추가된 것을\n수치로 정리했습니다.", 52, false, 22, 680);
body("스케줄러 4개 · 알림 2채널 · Webhook HMAC · /health·/metrics · 보안 5종 · 인덱스 16개 · 배포 완료");
doc.moveTo(42, 174).lineTo(W - 42, 174).lineWidth(1).stroke(C.line);
[
  { x: 42,  color: C.coral,  bg: "#FFF1F1", value: "4개",   sub: "Cron Job",       desc: "결제만료·세션·정산·리포트\njob_logs 100% 기록" },
  { x: 240, color: C.blue,   bg: "#EEF2FF", value: "2채널", sub: "알림",           desc: "Discord Webhook\nSMTP 이메일" },
  { x: 438, color: C.green,  bg: "#F0FBF6", value: "HMAC",  sub: "Webhook 검증",   desc: "SHA-256 서명 검증\n멱등성·재생 공격 방어" },
  { x: 636, color: C.yellow, bg: "#FFFBEE", value: "16개",  sub: "DB 인덱스",      desc: "복합 인덱스 추가\nJOIN 쿼리 최적화" },
].forEach(m => {
  doc.roundedRect(m.x, 184, 183, 215, 12).fillAndStroke(m.bg, C.line);
  doc.rect(m.x, 184, 5, 215).fill(m.color);
  doc.fillColor(m.color).font("KR-Bold").fontSize(34).text(m.value, m.x + 14, 200, { width: 160, align: "center" });
  doc.fillColor(C.ink).font("KR-Bold").fontSize(12).text(m.sub,    m.x + 14, 248, { width: 160, align: "center" });
  doc.fillColor(C.gray).font("KR").fontSize(10).text(m.desc,       m.x + 14, 270, { width: 160, align: "center", lineGap: 3 });
});
doc.moveTo(42, 412).lineTo(W - 42, 412).lineWidth(1).stroke(C.line);
[
  ["결제 모듈",    "Toss 데모 · HMAC Webhook"],
  ["스케줄러",     "4개 배치 · job_logs"],
  ["모니터링",     "/health · /metrics · winston"],
  ["보안",        "SQL · XSS · Helmet · Rate Limit"],
].forEach(([title, detail], i) => {
  const x = 42 + i * 200;
  doc.fillColor(C.ink).font("KR-Bold").fontSize(11).text(title,  x, 424, { width: 190 });
  doc.fillColor(C.gray).font("KR").fontSize(9.5).text(detail,    x, 444, { width: 190, lineGap: 2 });
  doc.circle(x + 188, 430, 5).fill(C.green);
});

// ─────────────────────────────────────────────────────────────
// 12  다음 목표
// ─────────────────────────────────────────────────────────────
newSlide(); footer(12);
label("Next Steps");
heading("구조는 완성됐습니다.\n설정만 바꾸면 실서비스입니다.");
[
  ["01", "실결제 전환",   "Toss 라이브 키 발급\nclientKey·secretKey 교체\n결제 E2E 테스트 통과\n프로덕션 배포",    C.coral],
  ["02", "알림 활성화",  "Discord Webhook URL 등록\nSMTP 계정 설정\n실발송 테스트 완료\n에러·정산 알림 연동",              C.blue],
  ["03", "CI/CD 구축",  "GitHub Actions 파이프라인\nDocker 자동 빌드·배포\n테스트 통과 후 자동 반영\n배포 알림 연동",      C.green],
  ["04", "기능 확장",   "쿠폰·부분환불 모듈\n학습 추천 엔진\nGrafana 모니터링 연동\n퀴즈·수료증 발급",                    C.yellow],
].forEach(([num, title, desc, color], i) => {
  const x = 42 + i * 200;
  doc.roundedRect(x, 148, 185, 345, 12).fillAndStroke(C.paper, C.line);
  doc.rect(x, 148, 5, 345).fill(color);
  doc.fillColor(color).font("KR-Bold").fontSize(11).text(num,   x + 18, 166);
  doc.fillColor(C.ink).font("KR-Bold").fontSize(15).text(title, x + 18, 188, { width: 155 });
  doc.fillColor(C.gray).font("KR").fontSize(11).text(desc,      x + 18, 222, { width: 155, lineGap: 6 });
});

// ─────────────────────────────────────────────────────────────
// 13  CLOSE
// ─────────────────────────────────────────────────────────────
newSlide(C.dark);
doc.circle(715, 72, 95).fill(C.coral);
doc.circle(735, 380, 55).fill(C.yellow);
doc.fillColor(C.coral).font("KR-Bold").fontSize(10)
   .text("THANK YOU", 42, 38, { characterSpacing: 1.5 });
doc.fillColor(C.paper).font("KR-Bold").fontSize(28)
   .text("운영 준비가 된\nP3입니다.", 42, 95, { width: 400, lineGap: 5 });
doc.fillColor("#B0B0B0").font("KR").fontSize(13)
   .text("결제·스케줄러·알림·Webhook·모니터링·보안을 갖춘\n실서비스 수준의 백엔드를 P3에서 완성했습니다.", 42, 215, { width: 440, lineGap: 6 });
doc.moveTo(42, 320).lineTo(320, 320).lineWidth(1).stroke("#444");
doc.fillColor("#888").font("KR").fontSize(10)
   .text("totalcode-devfocus.vercel.app  ·  13.125.181.228:3001", 42, 334);
doc.fillColor(C.coral).font("KR-Bold").fontSize(18).text("Questions?", 42, 365);

doc.end();
