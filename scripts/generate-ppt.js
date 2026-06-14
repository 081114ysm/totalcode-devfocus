const pptxgen = require("/tmp/devfocus-ppt/node_modules/pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "DevFocus Team";
pptx.subject = "DevFocus P1-P3 pitch deck";
pptx.title = "DevFocus - 개발자 학습의 모든 순간";
pptx.company = "DevFocus";
pptx.lang = "ko-KR";
pptx.theme = { headFontFace: "Malgun Gothic", bodyFontFace: "Malgun Gothic", lang: "ko-KR" };

const C = {
  coral: "FF5A5F",
  coralSoft: "FFF0F0",
  ink: "222222",
  gray: "6B7280",
  line: "E8E8E8",
  paper: "FFFFFF",
  cream: "FFF9F5",
  green: "00A86B",
  blue: "4568DC",
  yellow: "FFC857",
};

function base({ dark = false, number } = {}) {
  const slide = pptx.addSlide();
  slide.background = { color: dark ? C.ink : C.paper };
  slide.addText("DEVFOCUS", { x: 0.58, y: 0.38, w: 2.1, h: 0.24, fontSize: 10, bold: true, color: dark ? C.paper : C.coral, charSpacing: 2.2, margin: 0 });
  if (number) slide.addText(number, { x: 12.2, y: 0.38, w: 0.55, h: 0.24, fontSize: 9, color: dark ? "A3A3A3" : C.gray, align: "right", margin: 0 });
  return slide;
}

function title(slide, eyebrow, heading, body, options = {}) {
  const dark = options.dark || false;
  slide.addText(eyebrow.toUpperCase(), { x: 0.72, y: options.y || 1.05, w: 4, h: 0.25, fontSize: 10, bold: true, color: C.coral, charSpacing: 2.4, margin: 0 });
  slide.addText(heading, { x: 0.7, y: (options.y || 1.05) + 0.45, w: options.w || 8.8, h: options.h || 1.35, fontSize: options.size || 37, bold: true, color: dark ? C.paper : C.ink, breakLine: false, margin: 0, fit: "shrink" });
  if (body) slide.addText(body, { x: 0.73, y: (options.y || 1.05) + 2.0, w: options.bodyW || 7.5, h: 0.8, fontSize: 15, color: dark ? "CFCFCF" : C.gray, breakLine: false, margin: 0, fit: "shrink", breakLineOnOverflow: false });
}

function metric(slide, value, label, x, y, color = C.coral) {
  slide.addText(value, { x, y, w: 2.8, h: 0.75, fontSize: 34, bold: true, color, margin: 0, fit: "shrink" });
  slide.addText(label, { x, y: y + 0.82, w: 2.8, h: 0.5, fontSize: 12, color: C.gray, margin: 0, fit: "shrink" });
}

function card(slide, heading, body, x, y, w, h, accent = C.coral) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: C.paper }, line: { color: C.line, width: 1 } });
  slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.3, y: y + 0.3, w: 0.25, h: 0.25, fill: { color: accent }, line: { color: accent } });
  slide.addText(heading, { x: x + 0.3, y: y + 0.82, w: w - 0.6, h: 0.45, fontSize: 17, bold: true, color: C.ink, margin: 0, fit: "shrink" });
  slide.addText(body, { x: x + 0.3, y: y + 1.45, w: w - 0.6, h: h - 1.75, fontSize: 11.5, color: C.gray, breakLine: false, margin: 0, fit: "shrink" });
}

// 01 Cover
let s = base({ dark: true });
s.addShape(pptx.ShapeType.ellipse, { x: 9.15, y: -0.7, w: 5.3, h: 5.3, fill: { color: C.coral }, line: { color: C.coral }, transparency: 4 });
s.addShape(pptx.ShapeType.ellipse, { x: 10.55, y: 4.5, w: 2.2, h: 2.2, fill: { color: C.yellow }, line: { color: C.yellow } });
title(s, "DevFocus pitch deck", "개발자 학습의\n모든 순간을 잇다.", "강의 탐색부터 결제, 완강, 강사 운영과 모니터링까지\n하나의 제품 경험으로 연결한 개발자 학습 플랫폼", { dark: true, y: 1.2, w: 7.5, h: 2.0, size: 43 });
s.addText("P1 · P2 · P3  |  2026.06.15", { x: 0.73, y: 6.45, w: 4, h: 0.3, fontSize: 11, color: "AFAFAF", margin: 0 });

// 02 Project Overview
s = base({ number: "02" });
title(s, "Overview", "이 프로젝트는\n무엇을 해결하나요?", "DevFocus는 학생, 강사, 관리자 모두가 같은 데이터 위에서 움직이는 개발자 학습 플랫폼입니다.", { w: 7.7, h: 1.6 });
card(s, "학생", "강의 탐색부터 결제, 학습, 진도 저장, 수강평까지 한 번에 연결합니다.", 0.75, 3.25, 3.65, 2.35, C.coral);
card(s, "강사", "강의와 레슨을 직접 관리하고, 수강생과 매출, 학습률을 확인합니다.", 4.82, 3.25, 3.65, 2.35, C.blue);
card(s, "관리자", "회원, 권한, 결제, 환불, Webhook, 배치, 로그를 운영 콘솔에서 봅니다.", 8.9, 3.25, 3.65, 2.35, C.green);

// 03 Problem
s = base({ number: "03" });
title(s, "Problem", "학습은 여전히\n너무 많은 곳에 흩어져 있습니다.", "강의는 한 곳에서 보고, 질문과 기록은 다른 곳에서 관리합니다.", { w: 7.6, h: 1.55 });
metric(s, "5+", "학습자가 오가는 도구", 0.75, 4.45);
metric(s, "0", "연결된 학습 맥락", 4.0, 4.45, C.ink);
metric(s, "높음", "중도 이탈 가능성", 7.25, 4.45, C.blue);
s.addShape(pptx.ShapeType.roundRect, { x: 10.25, y: 1.2, w: 2.15, h: 4.9, fill: { color: C.coralSoft }, line: { color: C.coralSoft }, rectRadius: 0.08 });
s.addText("강의\n\n결제\n\n질문\n\n진도\n\n집중", { x: 10.75, y: 1.75, w: 1.15, h: 3.9, fontSize: 17, bold: true, color: C.coral, align: "center", margin: 0, breakLine: false });

// 04 Solution
s = base({ number: "04" });
title(s, "Solution", "한 번의 로그인으로\n배움이 끝까지 이어집니다.", "DevFocus는 학습 흐름과 운영 흐름을 하나의 서비스로 묶습니다.", { w: 7.4, h: 1.55 });
const solution = [["탐색", "나에게 맞는 강의"], ["결제", "검증된 주문 흐름"], ["학습", "이어보기와 자동 저장"], ["성장", "완강률과 학습 기록"]];
solution.forEach(([a, b], i) => {
  const x = 0.75 + i * 3.08;
  s.addShape(pptx.ShapeType.roundRect, { x, y: 4.45, w: 2.65, h: 1.35, fill: { color: i === 3 ? C.coral : C.cream }, line: { color: i === 3 ? C.coral : "F3E8DF" }, rectRadius: 0.08 });
  s.addText(a, { x: x + 0.25, y: 4.72, w: 0.75, h: 0.32, fontSize: 13, bold: true, color: i === 3 ? C.paper : C.coral, margin: 0 });
  s.addText(b, { x: x + 0.25, y: 5.15, w: 2.15, h: 0.35, fontSize: 11, color: i === 3 ? C.paper : C.gray, margin: 0, fit: "shrink" });
});

// 05 Product
s = base({ number: "05" });
title(s, "Product", "학생에게는 단순하게.\n기능은 충분하게.", null, { w: 6.5, h: 1.5 });
card(s, "이어보기", "마지막 학습 위치를 기억하고 다음 레슨으로 자연스럽게 연결합니다.", 0.75, 3.25, 3.65, 2.45, C.coral);
card(s, "자동 진도 저장", "30초 단위 저장과 90% 완강 기준으로 실제 학습 상태를 반영합니다.", 4.82, 3.25, 3.65, 2.45, C.blue);
card(s, "집중과 질문", "집중 타이머, Q&A, 코드 스니펫으로 학습 전후의 행동까지 지원합니다.", 8.9, 3.25, 3.65, 2.45, C.green);

// 06 Roles
s = base({ number: "06" });
title(s, "One platform, three roles", "학생, 강사, 관리자가\n같은 데이터를 봅니다.", "역할은 다르지만 서비스 상태와 학습 결과는 하나의 데이터 흐름으로 연결됩니다.", { w: 7.6, h: 1.55 });
card(s, "학생", "강의 탐색 · 결제\n진도 · 수강평\n집중 기록", 0.75, 4.15, 3.65, 2.0, C.coral);
card(s, "강사", "강의와 레슨 CRUD\n수강생 · 매출\n학습률 · 정산", 4.82, 4.15, 3.65, 2.0, C.blue);
card(s, "관리자", "회원과 권한\n결제 · 환불\n로그 · 배치 · Webhook", 8.9, 4.15, 3.65, 2.0, C.green);

// 07 Revenue
s = base({ number: "07" });
title(s, "Business model", "좋은 강의가 판매될수록\n플랫폼도 함께 성장합니다.", "강의 결제 수익을 기반으로 강사 정산과 플랫폼 수수료를 투명하게 계산합니다.", { w: 8.1, h: 1.55 });
metric(s, "Toss", "실결제 승인·취소 API", 0.75, 4.4);
metric(s, "100%", "서버 기준 금액 재검증", 4.15, 4.4, C.blue);
metric(s, "자동", "월별 강사 정산 계산", 7.55, 4.4, C.green);
s.addText("주문 생성  →  결제위젯  →  서버 승인  →  수강 등록  →  정산", { x: 0.75, y: 6.2, w: 11.7, h: 0.4, fontSize: 14, bold: true, color: C.ink, align: "center", margin: 0 });

// 08 Requirements
s = base({ number: "08" });
title(s, "Built in three stages", "과제 요구사항을\n운영 가능한 제품으로 확장했습니다.", null, { w: 7.5, h: 1.55 });
card(s, "P1 · 서비스", "모바일 프론트엔드\n백엔드 API와 CRUD\nMySQL 영구 저장", 0.75, 3.35, 3.65, 2.55, C.coral);
card(s, "P2 · 신뢰", "JWT 인증\n역할 기반 권한\n리소스 소유권 검증", 4.82, 3.35, 3.65, 2.55, C.blue);
card(s, "P3 · 운영", "알림 · Scheduler · Webhook\n로그 · Health · Metrics\n보안 · 성능 · 결제", 8.9, 3.35, 3.65, 2.55, C.green);

// 09 Architecture
s = base({ number: "09", dark: true });
title(s, "Technology", "빠르게 만들고,\n명확하게 운영합니다.", "단순한 3계층 구조 위에 결제와 알림, 관측성을 연결했습니다.", { dark: true, w: 6.8, h: 1.5 });
const tech = [["Next.js 16", "반응형 UI"], ["Express 5", "REST API"], ["MySQL 8", "영구 데이터"], ["Toss", "결제 승인"], ["Docker", "실행 환경"]];
tech.forEach(([a, b], i) => { const x = 0.75 + i * 2.46; s.addText(a, { x, y: 4.5, w: 2.05, h: 0.4, fontSize: 16, bold: true, color: i === 3 ? C.coral : C.paper, align: "center", margin: 0 }); s.addText(b, { x, y: 5.05, w: 2.05, h: 0.3, fontSize: 10, color: "AFAFAF", align: "center", margin: 0 }); if (i < 4) s.addText("→", { x: x + 2.05, y: 4.55, w: 0.4, h: 0.3, fontSize: 15, color: "666666", align: "center", margin: 0 }); });

// 10 Operations
s = base({ number: "10" });
title(s, "Operations", "문제가 생긴 뒤가 아니라\n생기는 순간을 봅니다.", "운영자는 요청, 배치, Webhook, DB 상태를 한 흐름에서 추적할 수 있습니다.", { w: 7.7, h: 1.55 });
metric(s, "JSON", "구조화 요청 로그", 0.75, 4.25);
metric(s, "/health", "API와 DB 상태 확인", 4.0, 4.25, C.green);
metric(s, "/metrics", "운영 지표와 실패 이력", 7.25, 4.25, C.blue);
metric(s, "HMAC", "Webhook 무결성 검증", 10.1, 4.25, C.ink);

// 11 Validation
s = base({ number: "11" });
title(s, "Validation", "기능은 만들었고,\n자동 검증으로 확인했습니다.", null, { w: 7.0, h: 1.5 });
const checks = [["Frontend build", "PASS"], ["Backend tests", "3 PASS"], ["Dependency audit", "0 issues"], ["PPT / Git bundle", "VERIFIED"]];
checks.forEach(([a, b], i) => { const y = 3.25 + i * 0.82; s.addText(a, { x: 0.8, y, w: 4.6, h: 0.38, fontSize: 15, color: C.gray, margin: 0 }); s.addShape(pptx.ShapeType.line, { x: 4.8, y: y + 0.18, w: 4.5, h: 0, line: { color: C.line, width: 1 } }); s.addText(b, { x: 9.75, y, w: 2.3, h: 0.38, fontSize: 15, bold: true, color: C.green, align: "right", margin: 0 }); });

// 12 Deployment
s = base({ number: "12" });
title(s, "Deployment", "준비 완료와 배포 완료는\n같은 말이 아닙니다.", "현재 코드는 배포 가능한 상태지만 공개 URL과 운영 인프라는 아직 연결되지 않았습니다.", { w: 8.0, h: 1.55 });
card(s, "준비됨", "Dockerfile · Compose\n환경변수 예제 · Runbook\nHealth · Metrics", 0.75, 4.15, 3.65, 2.0, C.green);
card(s, "현재", "공개 URL 없음\n운영 DB 없음\n실결제 운영 키 미연결", 4.82, 4.15, 3.65, 2.0, C.coral);
card(s, "배포 순서", "관리형 MySQL\nAPI · Frontend · TLS\nSecret · Toss 도메인", 8.9, 4.15, 3.65, 2.0, C.blue);

// 13 Roadmap
s = base({ number: "13" });
title(s, "Roadmap", "다음 목표는 기능 추가보다\n실제 운영의 완성입니다.", null, { w: 7.7, h: 1.55 });
const roadmap = [["01", "PUBLIC", "공개 배포와 결제 E2E"], ["02", "RELIABLE", "CI/CD, 백업, 알림 재시도"], ["03", "PERSONAL", "추천, 퀴즈, 수료증"], ["04", "SCALE", "쿠폰, 부분환불, 정산 고도화"]];
roadmap.forEach(([n, a, b], i) => { const x = 0.75 + i * 3.08; s.addText(n, { x, y: 3.6, w: 0.5, h: 0.3, fontSize: 11, bold: true, color: C.coral, margin: 0 }); s.addText(a, { x, y: 4.15, w: 2.55, h: 0.45, fontSize: 18, bold: true, color: C.ink, margin: 0 }); s.addText(b, { x, y: 4.85, w: 2.55, h: 0.75, fontSize: 11.5, color: C.gray, margin: 0, fit: "shrink" }); });

// 14 Close
s = base({ dark: true });
s.addShape(pptx.ShapeType.ellipse, { x: 8.4, y: 0.8, w: 3.4, h: 3.4, fill: { color: C.coral }, line: { color: C.coral } });
s.addShape(pptx.ShapeType.ellipse, { x: 10.5, y: 4.75, w: 1.5, h: 1.5, fill: { color: C.yellow }, line: { color: C.yellow } });
title(s, "Thank you", "배움이 멈추지 않도록.", "DevFocus는 개발자가 강의를 발견한 순간부터\n끝까지 완주하는 순간까지 함께합니다.", { dark: true, y: 1.55, w: 7.2, h: 1.1, size: 40 });
s.addText("Questions?", { x: 0.73, y: 5.9, w: 3, h: 0.45, fontSize: 21, bold: true, color: C.coral, margin: 0 });

pptx.writeFile({ fileName: "제출물/DevFocus_발표자료.pptx" });
