const PDFDocument = require("/tmp/devfocus-pdf/node_modules/pdfkit");
const fs = require("node:fs");
const path = require("node:path");

const outPath = path.join(__dirname, "..", "제출물", "DevFocus_발표자료.pdf");
const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0, autoFirstPage: false });
doc.pipe(fs.createWriteStream(outPath));

const W = 841.89;
const H = 595.28;
const C = {
  coral: "#FF5A5F",
  coralSoft: "#FFF1F1",
  ink: "#1F1F1F",
  gray: "#667085",
  line: "#E7E7E7",
  paper: "#FFFFFF",
  cream: "#FFF9F5",
  green: "#00A86B",
  blue: "#4568DC",
  yellow: "#FFC857",
  dark: "#1F1F1F",
};

function newSlide(bg = C.paper) {
  doc.addPage({ size: [W, H], layout: "landscape", margin: 0 });
  doc.rect(0, 0, W, H).fill(bg);
}

function footer(n, dark = false) {
  doc.fillColor(dark ? "#AFAFAF" : "#888").font("Helvetica").fontSize(9).text("DEVFOCUS", 36, H - 24);
  doc.text(String(n).padStart(2, "0"), W - 70, H - 24, { width: 34, align: "right" });
}

function label(text, y = 44, dark = false) {
  doc.fillColor(C.coral).font("Helvetica-Bold").fontSize(10).text(text.toUpperCase(), 42, y, { characterSpacing: 2 });
}

function heading(text, y = 68, dark = false, size = 28, width = 520) {
  doc.fillColor(dark ? C.paper : C.ink).font("Helvetica-Bold").fontSize(size).text(text, 42, y, { width, lineGap: 2 });
}

function body(text, y = 170, dark = false, width = 520) {
  if (!text) return;
  doc.fillColor(dark ? "#D7D7D7" : C.gray).font("Helvetica").fontSize(14).text(text, 42, y, { width, lineGap: 4 });
}

function card(x, y, w, h, accent, title, text, dark = false) {
  doc.roundedRect(x, y, w, h, 14).fillAndStroke(dark ? "#202020" : C.paper, C.line);
  doc.rect(x, y, 6, h).fill(accent);
  doc.fillColor(dark ? C.paper : C.ink).font("Helvetica-Bold").fontSize(15).text(title, x + 18, y + 18, { width: w - 30 });
  doc.fillColor(dark ? "#D0D0D0" : C.gray).font("Helvetica").fontSize(11).text(text, x + 18, y + 48, { width: w - 30, height: h - 62, lineGap: 3, ellipsis: true });
}

function metric(x, y, value, text, color) {
  doc.fillColor(color).font("Helvetica-Bold").fontSize(28).text(value, x, y, { width: 150 });
  doc.fillColor(C.gray).font("Helvetica").fontSize(10.5).text(text, x, y + 36, { width: 155 });
}

// 1 cover
newSlide(C.dark);
doc.circle(735, 92, 118).fill(C.coral);
doc.circle(760, 418, 62).fill(C.yellow);
doc.fillColor(C.coral).font("Helvetica-Bold").fontSize(10).text("DEVFOCUS PITCH DECK", 42, 42, { characterSpacing: 2 });
doc.fillColor(C.paper).font("Helvetica-Bold").fontSize(34).text("개발자 학습의\n모든 순간을 잇다.", 42, 95, { width: 430, lineGap: 3 });
doc.fillColor("#D0D0D0").font("Helvetica").fontSize(15).text("강의 탐색부터 결제, 완강, 강사 운영과 모니터링까지 하나의 제품 경험으로 연결한 개발자 학습 플랫폼", 42, 230, { width: 470, lineGap: 4 });
doc.fillColor("#AFAFAF").fontSize(10).text("P1 · P2 · P3  |  2026.06.15", 42, 530);

// 2 overview
newSlide(); footer(2);
label("Overview");
heading("이 프로젝트는\n무엇을 해결하나요?");
body("학생, 강사, 관리자 모두가 같은 데이터 위에서 움직이는 개발자 학습 플랫폼입니다.");
card(42, 250, 245, 145, C.coral, "학생", "강의 탐색, 결제, 진도 저장, 수강평을 한 흐름으로 연결합니다.");
card(298, 250, 245, 145, C.blue, "강사", "강의와 레슨을 직접 관리하고 수강생과 매출을 확인합니다.");
card(554, 250, 245, 145, C.green, "관리자", "회원, 결제, 환불, Webhook, 배치, 로그를 운영 콘솔에서 봅니다.");

// 3 problem
newSlide(); footer(3);
label("Problem");
heading("학습은 여전히\n너무 많은 곳에 흩어져 있습니다.");
body("강의는 한 곳에서 보고, 질문과 기록은 다른 곳에서 관리합니다.");
metric(52, 285, "5+", "학습자가 오가는 도구", C.coral);
metric(290, 285, "0", "연결된 학습 맥락", C.ink);
metric(528, 285, "높음", "중도 이탈 가능성", C.blue);

// 4 solution
newSlide(); footer(4);
label("Solution");
heading("한 번의 로그인으로\n배움이 끝까지 이어집니다.");
body("DevFocus는 학습 흐름과 운영 흐름을 하나의 서비스로 묶습니다.");
card(42, 250, 180, 150, C.coral, "탐색", "나에게 맞는 강의");
card(238, 250, 180, 150, C.cream, "결제", "검증된 주문 흐름");
card(434, 250, 180, 150, C.blue, "학습", "이어보기와 자동 저장");
card(630, 250, 168, 150, C.coral, "성장", "완강률과 학습 기록", true);

// 5 product
newSlide(); footer(5);
label("Product");
heading("학생에게는 단순하게.\n기능은 충분하게.");
card(42, 220, 245, 225, C.coral, "이어보기", "마지막 학습 위치를 기억하고 다음 레슨으로 자연스럽게 연결합니다.");
card(298, 220, 245, 225, C.blue, "자동 진도 저장", "30초 단위 저장과 90% 완강 기준으로 실제 학습 상태를 반영합니다.");
card(554, 220, 245, 225, C.green, "집중과 질문", "집중 타이머, Q&A, 코드 스니펫으로 학습 전후의 행동까지 지원합니다.");

// 6 roles
newSlide(); footer(6);
label("Roles");
heading("학생, 강사, 관리자가\n같은 데이터를 봅니다.");
body("역할은 다르지만 서비스 상태와 학습 결과는 하나의 데이터 흐름으로 연결됩니다.");
card(42, 250, 245, 150, C.coral, "학생", "강의 탐색 · 결제 · 진도 · 수강평 · 집중 기록");
card(298, 250, 245, 150, C.blue, "강사", "강의와 레슨 CRUD · 수강생 · 매출 · 정산");
card(554, 250, 245, 150, C.green, "관리자", "회원과 권한 · 결제 · 환불 · 로그 · 배치");

// 7 business
newSlide(); footer(7);
label("Business model");
heading("좋은 강의가 판매될수록\n플랫폼도 함께 성장합니다.");
body("강의 결제 수익을 기반으로 강사 정산과 플랫폼 수수료를 투명하게 계산합니다.");
metric(52, 285, "Toss", "실결제 승인·취소 API", C.coral);
metric(290, 285, "100%", "서버 기준 금액 재검증", C.blue);
metric(528, 285, "자동", "월별 강사 정산 계산", C.green);

// 8 stages
newSlide(); footer(8);
label("Three stages");
heading("과제 요구사항을\n운영 가능한 제품으로 확장했습니다.");
card(42, 250, 245, 155, C.coral, "P1 · 서비스", "모바일 프론트엔드, 백엔드 API와 CRUD, MySQL 영구 저장");
card(298, 250, 245, 155, C.blue, "P2 · 신뢰", "JWT 인증, 역할 기반 권한, 리소스 소유권 검증");
card(554, 250, 245, 155, C.green, "P3 · 운영", "알림, Scheduler, Webhook, 로그, Health, Metrics, 결제");

// 9 technology
newSlide(C.dark); footer(9, true);
label("Technology", 44, true);
heading("빠르게 만들고,\n명확하게 운영합니다.", 68, true, 28, 530);
body("단순한 3계층 구조 위에 결제와 알림, 관측성을 연결했습니다.", 170, true, 520);
["Next.js", "Express", "MySQL", "Toss", "Docker"].forEach((t, i) => {
  const x = 54 + i * 150;
  doc.fillColor(i === 3 ? C.coral : C.paper).font("Helvetica-Bold").fontSize(16).text(t, x, 300, { width: 110, align: "center" });
  doc.fillColor("#AFAFAF").font("Helvetica").fontSize(10).text(["UI", "API", "DB", "결제", "실행"][i], x, 326, { width: 110, align: "center" });
  if (i < 4) doc.fillColor("#666").fontSize(18).text("→", x + 112, 304, { width: 18, align: "center" });
});

// 10 operations
newSlide(); footer(10);
label("Operations");
heading("문제가 생긴 뒤가 아니라\n생기는 순간을 봅니다.");
body("운영자는 요청, 배치, Webhook, DB 상태를 한 흐름에서 추적할 수 있습니다.");
metric(52, 285, "JSON", "구조화 요청 로그", C.coral);
metric(290, 285, "/health", "API와 DB 상태 확인", C.green);
metric(528, 285, "/metrics", "운영 지표와 실패 이력", C.blue);

// 11 validation
newSlide(); footer(11);
label("Validation");
heading("기능은 만들었고,\n자동 검증으로 확인했습니다.");
["Frontend build", "Backend tests", "Dependency audit", "PPT / Git bundle"].forEach((t, i) => {
  const y = 255 + i * 50;
  doc.fillColor(C.gray).font("Helvetica").fontSize(14).text(t, 54, y, { width: 260 });
  doc.moveTo(350, y + 10).lineTo(700, y + 10).stroke(C.line);
  doc.fillColor(C.green).font("Helvetica-Bold").fontSize(14).text(["PASS", "3 PASS", "0 issues", "VERIFIED"][i], 705, y, { width: 82, align: "right" });
});

// 12 deployment complete
newSlide(); footer(12);
label("Deployment");
heading("공개 배포와\n운영 전환을 완료했습니다.");
body("Vercel 자동 재배포와 AWS 백엔드, MySQL, 결제 연동, 모니터링 구성을 모두 연결한 상태로 발표합니다.");
card(42, 250, 245, 155, C.green, "Frontend", "Vercel Git 연동 · main push 자동 재배포");
card(298, 250, 245, 155, C.coral, "Backend", "AWS Docker 배포 · Health · Metrics · Scheduler");
card(554, 250, 245, 155, C.blue, "Payments", "Toss 승인·취소 · Webhook 검증 · 수강 등록");

// 13 roadmap
newSlide(); footer(13);
label("Roadmap");
heading("다음 목표는 기능 추가보다\n실제 운영의 완성입니다.");
[
  ["01", "PUBLIC", "공개 배포와 결제 E2E"],
  ["02", "RELIABLE", "CI/CD, 백업, 알림 재시도"],
  ["03", "PERSONAL", "추천, 퀴즈, 수료증"],
  ["04", "SCALE", "쿠폰, 부분환불, 정산 고도화"],
].forEach((row, i) => {
  const x = 42 + i * 190;
  doc.fillColor(C.coral).font("Helvetica-Bold").fontSize(10).text(row[0], x, 300);
  doc.fillColor(C.ink).font("Helvetica-Bold").fontSize(15).text(row[1], x, 324);
  doc.fillColor(C.gray).font("Helvetica").fontSize(11).text(row[2], x, 350, { width: 150 });
});

// 14 close
newSlide(C.dark);
doc.circle(736, 90, 110).fill(C.coral);
doc.circle(750, 415, 58).fill(C.yellow);
doc.fillColor(C.coral).font("Helvetica-Bold").fontSize(10).text("THANK YOU", 42, 42, { characterSpacing: 2 });
doc.fillColor(C.paper).font("Helvetica-Bold").fontSize(32).text("배움이 멈추지 않도록.", 42, 100, { width: 380 });
doc.fillColor("#D0D0D0").font("Helvetica").fontSize(15).text("DevFocus는 개발자가 강의를 발견한 순간부터 끝까지 완주하는 순간까지 함께합니다.", 42, 205, { width: 430, lineGap: 4 });
doc.fillColor(C.coral).font("Helvetica-Bold").fontSize(20).text("Questions?", 42, 510);

doc.end();
