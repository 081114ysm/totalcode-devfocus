const pptxgen = require("/tmp/devfocus-ppt/node_modules/pptxgenjs");
const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "DevFocus Team";
pptx.subject = "DevFocus P1-P3 project presentation";
pptx.title = "DevFocus 개발자 학습 플랫폼";
pptx.company = "DevFocus";
pptx.lang = "ko-KR";
pptx.theme = {
  headFontFace: "Malgun Gothic",
  bodyFontFace: "Malgun Gothic",
  lang: "ko-KR"
};
pptx.defineSlideMaster({
  title: "MASTER",
  background: { color: "F7F7F8" },
  objects: [
    { rect: { x: 0, y: 0, w: 13.333, h: 0.12, fill: { color: "FF385C" }, line: { color: "FF385C" } } },
    { text: { text: "DEVFOCUS", options: { x: 0.5, y: 7.08, w: 2, h: 0.2, fontFace: "Arial", fontSize: 9, bold: true, color: "FF385C", margin: 0 } } },
    { text: { text: "2026.06.15", options: { x: 11.8, y: 7.08, w: 1, h: 0.2, fontSize: 8, color: "777777", align: "right", margin: 0 } } }
  ],
  slideNumber: { x: 12.85, y: 7.08, w: 0.25, h: 0.2, fontSize: 8, color: "777777", align: "right" }
});

const C = { pink:"FF385C", dark:"191919", gray:"6B7280", light:"F1F2F4", white:"FFFFFF", green:"16A34A", blue:"2563EB", amber:"F59E0B" };
function slide(title, subtitle) {
  const s = pptx.addSlide("MASTER");
  s.addText(title, { x:0.55,y:0.38,w:12.1,h:0.55,fontSize:27,bold:true,color:C.dark,margin:0,breakLine:false });
  if (subtitle) s.addText(subtitle, { x:0.58,y:0.98,w:11.8,h:0.35,fontSize:11,color:C.gray,margin:0 });
  return s;
}
function pill(s, text, x, y, color=C.pink, w=1.5) { s.addText(text,{x,y,w,h:0.35,fontSize:10,bold:true,align:"center",valign:"mid",color:C.white,fill:{color},line:{color},radius:0.15,margin:0.03}); }
function card(s, title, body, x, y, w, h, accent=C.pink) {
  s.addShape(pptx.ShapeType.roundRect,{x,y,w,h,rectRadius:0.08,fill:{color:C.white},line:{color:"E5E7EB",width:1},shadow:{type:"outer",color:"D1D5DB",opacity:0.18,blur:1,angle:45,distance:1}});
  s.addShape(pptx.ShapeType.rect,{x,y,w:0.08,h,fill:{color:accent},line:{color:accent}});
  s.addText(title,{x:x+0.25,y:y+0.22,w:w-0.45,h:0.35,fontSize:15,bold:true,color:C.dark,margin:0});
  s.addText(body,{x:x+0.25,y:y+0.72,w:w-0.45,h:h-0.88,fontSize:10.5,color:C.gray,breakLine:false,margin:0.02,fit:"shrink",valign:"top"});
}
function bullets(s, items, x, y, w, h, size=15) {
  const runs=[]; items.forEach((t,i)=>runs.push({text:t,options:{bullet:{indent:size},breakLine:i<items.length-1,hanging:size*0.3}}));
  s.addText(runs,{x,y,w,h,fontSize:size,color:C.dark,breakLine:false,margin:0.05,paraSpaceAfterPt:12,fit:"shrink"});
}

let s = pptx.addSlide();
s.background={color:C.dark};
s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:0.18,h:7.5,fill:{color:C.pink},line:{color:C.pink}});
s.addText("DEVFOCUS",{x:0.75,y:0.75,w:3,h:0.4,fontFace:"Arial",fontSize:16,bold:true,color:C.pink,margin:0,charSpacing:4});
s.addText("개발자를 위한\n통합 학습 플랫폼",{x:0.75,y:1.55,w:7.4,h:1.55,fontSize:38,bold:true,color:C.white,margin:0,breakLine:false});
s.addText("P1 · P2 · P3 요구사항 구현 및 운영 개선",{x:0.8,y:3.35,w:6.5,h:0.4,fontSize:17,color:"C9CDD3",margin:0});
s.addText("Next.js 16  |  Express 5  |  MySQL 8  |  Toss Payments",{x:0.8,y:4.05,w:7,h:0.35,fontSize:12,color:"8F96A3",margin:0});
pill(s,"학생",8.8,1.7,C.blue,1.2); pill(s,"강사",10.15,1.7,C.green,1.2); pill(s,"관리자",11.5,1.7,C.pink,1.2);
s.addShape(pptx.ShapeType.roundRect,{x:8.8,y:2.45,w:3.9,h:2.45,fill:{color:"252525"},line:{color:"414141"},radius:0.08});
s.addText("배우기 → 결제 → 학습 → 완강",{x:9.15,y:2.85,w:3.2,h:0.6,fontSize:19,bold:true,color:C.white,align:"center",margin:0});
s.addText("강의 운영과 관측성까지\n하나의 서비스로 연결",{x:9.25,y:3.65,w:3,h:0.7,fontSize:13,color:"B9BEC7",align:"center",margin:0.02});
s.addText("2026.06.15",{x:0.8,y:6.65,w:2,h:0.3,fontSize:10,color:"8F96A3",margin:0});

s=slide("01. 프로젝트 개요","개발 학습의 분산된 경험을 하나의 흐름으로 통합");
card(s,"학습자 문제","강의 탐색, 결제, 영상 시청, 진도와 질문이 서로 분리되어 학습 맥락이 끊김",0.6,1.55,3.85,2.05,C.blue);
card(s,"강사 문제","강의·레슨 관리뿐 아니라 수강생과 매출, 학습률을 함께 확인하기 어려움",4.75,1.55,3.85,2.05,C.green);
card(s,"운영 문제","인증, 결제, 알림, 배치, 장애 로그와 모니터링이 각각 별도 관리됨",8.9,1.55,3.85,2.05,C.pink);
s.addText("목표",{x:0.65,y:4.15,w:1,h:0.35,fontSize:13,bold:true,color:C.pink,margin:0});
s.addText("학생의 학습 몰입과 강사의 운영 효율, 관리자의 서비스 안정성을 동시에 높이는 강의 플랫폼",{x:0.65,y:4.65,w:12,h:0.65,fontSize:24,bold:true,color:C.dark,align:"center",margin:0.05});

s=slide("02. P1 · P2 · P3 요구사항 충족","기능 구현에서 운영 가능한 구조까지 단계적으로 확장");
card(s,"P1 학생 서비스","• 모바일 반응형 UI\n• 강의·레슨·진도 CRUD\n• 집중 타이머·Q&A·스니펫\n• MySQL 영구 저장",0.6,1.45,3.85,4.7,C.blue);
card(s,"P2 인증·권한","• JWT 로그인\n• student / instructor / admin\n• 강의 소유권 검증\n• 관리자 회원·강의 관리",4.75,1.45,3.85,4.7,C.green);
card(s,"P3 운영","• 이메일·Discord·Webhook\n• Scheduler·정산·결제 만료\n• 로그·Health·Metrics\n• 보안·성능·Docker·결제",8.9,1.45,3.85,4.7,C.pink);

s=slide("03. 시스템 아키텍처","역할별 UI와 운영 기능을 API 및 MySQL 중심으로 구성");
const boxes=[
  ["Next.js 16","모바일 UI\n결제위젯\n학습 플레이어",0.7,2.0,C.blue],
  ["Express 5","REST API\nJWT/RBAC\nValidation",4.65,2.0,C.green],
  ["MySQL 8","강의·진도\n결제·정산\n운영 로그",8.6,2.0,C.amber]
];
boxes.forEach(([t,b,x,y,c])=>card(s,t,b,x,y,3.1,2.3,c));
s.addShape(pptx.ShapeType.chevron,{x:3.95,y:2.65,w:0.5,h:0.75,fill:{color:"B8BDC7"},line:{color:"B8BDC7"}});
s.addShape(pptx.ShapeType.chevron,{x:7.9,y:2.65,w:0.5,h:0.75,fill:{color:"B8BDC7"},line:{color:"B8BDC7"}});
pill(s,"Toss Payments",1.1,5.15,C.pink,2.1); pill(s,"SMTP",3.5,5.15,C.blue,1.4); pill(s,"Discord",5.2,5.15,"5865F2",1.6); pill(s,"Webhook",7.1,5.15,C.green,1.6); pill(s,"Scheduler",9.0,5.15,C.amber,1.8); pill(s,"Docker",11.1,5.15,"475569",1.3);

s=slide("04. 학생 수강 경험","결제 이후 완강까지 끊기지 않는 학습 흐름");
const steps=["강의 탐색","결제/무료 등록","이어보기","자동 진도 저장","90% 완강","수강평"];
steps.forEach((t,i)=>{const x=0.55+i*2.12;s.addShape(pptx.ShapeType.ellipse,{x,y:2.0,w:1.45,h:1.45,fill:{color:i===5?C.pink:C.dark},line:{color:i===5?C.pink:C.dark}});s.addText(String(i+1),{x:x+0.5,y:2.32,w:0.45,h:0.35,fontSize:18,bold:true,color:C.white,align:"center",margin:0});s.addText(t,{x:x-0.2,y:3.7,w:1.85,h:0.45,fontSize:12,bold:true,align:"center",color:C.dark,margin:0});if(i<5)s.addShape(pptx.ShapeType.chevron,{x:x+1.55,y:2.43,w:0.35,h:0.55,fill:{color:"C8CDD5"},line:{color:"C8CDD5"}})});
bullets(s,["30초 자동 저장과 페이지 이탈 시 저장","이전·다음 레슨 및 커리큘럼 완료 체크","내 강의 진행률과 마지막 위치 기반 이어보기","수강생만 작성 가능한 평점·리뷰"],1.0,4.65,11.4,1.5,14);

s=slide("05. 실결제 흐름","브라우저 결과를 신뢰하지 않고 서버에서 주문을 재검증");
const flow=[["1","주문 생성","DB 가격·수강 여부 확인"],["2","결제위젯","카드/간편결제 선택"],["3","성공 Redirect","paymentKey·orderId·amount"],["4","서버 승인","토스 승인 API + 금액 대조"],["5","수강 등록","트랜잭션·영수증·메일"]];
flow.forEach((f,i)=>{const x=0.55+i*2.52;s.addShape(pptx.ShapeType.roundRect,{x,y:1.75,w:2.1,h:2.25,fill:{color:C.white},line:{color:i===3?C.pink:"D1D5DB",width:i===3?2:1},radius:0.08});s.addText(f[0],{x:x+0.75,y:1.98,w:0.6,h:0.55,fontSize:23,bold:true,color:i===3?C.pink:C.dark,align:"center",margin:0});s.addText(f[1],{x:x+0.18,y:2.72,w:1.75,h:0.35,fontSize:14,bold:true,align:"center",margin:0});s.addText(f[2],{x:x+0.18,y:3.2,w:1.75,h:0.5,fontSize:9.5,color:C.gray,align:"center",margin:0.02,fit:"shrink"});});
s.addText("운영 조건",{x:0.65,y:4.6,w:1.2,h:0.35,fontSize:14,bold:true,color:C.pink,margin:0});
bullets(s,["토스페이먼츠 가맹점 키와 운영 도메인 등록 필요","Client Key만 브라우저 노출, Secret Key는 백엔드 secret store","관리자 환불은 토스 취소 API와 결제 상태를 함께 갱신"],0.8,5.05,11.8,1.2,13);

s=slide("06. 강사 기능","콘텐츠 CRUD를 넘어 데이터 기반 강의 운영 지원");
card(s,"강의 관리","강의 생성·수정·삭제\n가격·난이도·카테고리 설정\n레슨 순서·영상·길이 관리",0.65,1.5,3.8,2.4,C.green);
card(s,"운영 분석","강의 수\n전체 수강생\n누적 매출\n학습 활동 인원",4.75,1.5,3.8,2.4,C.blue);
card(s,"정산","월별 총 매출\n플랫폼 수수료\n순정산액\n지급 상태",8.85,1.5,3.8,2.4,C.amber);
s.addText("개선 효과",{x:0.65,y:4.45,w:1.5,h:0.4,fontSize:15,bold:true,color:C.pink,margin:0});
bullets(s,["강의별 수강 인원·매출·평균 학습률을 한 화면에서 확인","리소스 소유권을 API에서 검사해 다른 강사의 강의 수정 차단","결제 완료 데이터 기반 월별 정산 자동 계산"],0.9,4.95,11.6,1.35,14);

s=slide("07. 관리자와 모니터링","서비스 운영에 필요한 회원·결제·장애 상태를 통합");
card(s,"운영 콘솔","회원 역할 변경\n전체 강의 관리\n결제 조회·환불\n정산 지급 처리",0.65,1.45,3.8,3.6,C.pink);
card(s,"관측성","JSON 구조화 로그\nRequest ID·응답 시간\n/health DB 상태\n관리자 /metrics",4.75,1.45,3.8,3.6,C.blue);
card(s,"배치·외부 연동","결제 만료\n90일 데이터 정리\n월 정산·주간 리포트\nWebhook 처리 이력",8.85,1.45,3.8,3.6,C.green);
s.addText("운영자는 job_logs와 webhook_events에서 최근 성공·실패 원인을 확인할 수 있습니다.",{x:1.0,y:5.65,w:11.3,h:0.55,fontSize:17,bold:true,color:C.dark,align:"center",margin:0});

s=slide("08. 보안과 성능 개선","서버 경계 검증과 측정 가능한 운영 성능에 집중");
card(s,"보안","SQL 파라미터 바인딩\nJWT·RBAC·소유권 검증\nHelmet·Rate Limit\nWebhook HMAC\n운영 Secret 필수",0.65,1.45,5.85,4.75,C.pink);
card(s,"성능","MySQL Connection Pool\n검색·결제·배치 인덱스\nNext.js standalone·압축\nGoogle Font 빌드 의존 제거\n모바일 우선 렌더링",6.8,1.45,5.85,4.75,C.blue);

s=slide("09. 배포 구성과 현재 상태","배포 준비와 실제 공개 배포 완료 여부를 구분");
card(s,"준비 완료","Frontend·Backend Dockerfile\nMySQL 포함 Compose\n환경변수 예제\n운영 Runbook\nHealth·Metrics",0.7,1.5,3.75,3.85,C.green);
card(s,"현재 상태","공개 URL 없음\n운영 DB 없음\n로컬 주소만 정의\nDocker Hub 이미지 다운로드 정체\n공개 배포 미완료",4.8,1.5,3.75,3.85,C.pink);
card(s,"다음 단계","관리형 MySQL 배포\nAPI·Frontend 공개 배포\nSecret 등록\n토스 도메인/키 전환\nE2E 및 알림 검증",8.9,1.5,3.75,3.85,C.blue);
s.addText("배포 주소: 미배포  |  로컬: http://localhost:3000",{x:1.5,y:5.75,w:10.3,h:0.55,fontSize:19,bold:true,color:C.pink,align:"center",margin:0});

s=slide("10. 검증 결과","코드 품질과 의존성 보안은 자동화 명령으로 확인");
const checks=[["Frontend lint","PASS*",C.green],["Next.js build","PASS",C.green],["Backend tests","3 PASS",C.green],["JS syntax","PASS",C.green],["Frontend audit","0",C.green],["Backend audit","0",C.green]];
checks.forEach((c,i)=>{const col=i%3,row=Math.floor(i/3),x=0.8+col*4.15,y=1.55+row*2.05;s.addShape(pptx.ShapeType.roundRect,{x,y,w:3.65,h:1.55,fill:{color:C.white},line:{color:"E5E7EB"},radius:0.08});s.addText(c[0],{x:x+0.2,y:y+0.25,w:2.1,h:0.35,fontSize:13,bold:true,color:C.gray,margin:0});s.addText(c[1],{x:x+2.3,y:y+0.25,w:1.05,h:0.4,fontSize:18,bold:true,color:c[2],align:"right",margin:0});});
s.addText("* 기존 코드 스니펫 화면의 React Hook dependency 경고 2건은 잔존하며 수강 기능과 무관",{x:0.85,y:5.9,w:11.5,h:0.35,fontSize:10,color:C.gray,margin:0});

s=slide("11. 향후 개선 로드맵","기능 수를 늘리기보다 운영 안정성과 학습 효과를 고도화");
const roadmap=[["1단계","공개 배포","관리형 DB·API·Frontend\n도메인·TLS·Secret"],["2단계","운영 자동화","CI/CD·DB migration\n알림 재시도·백업"],["3단계","학습 고도화","자막·배속·노트\n퀴즈·수료증·추천"],["4단계","비즈니스","쿠폰·장바구니\n부분 환불·세금계산"]];
roadmap.forEach((r,i)=>{const x=0.65+i*3.12;card(s,`${r[0]}  ${r[1]}`,r[2],x,1.65,2.8,3.4,[C.pink,C.blue,C.green,C.amber][i]);});
s.addText("우선순위: 공개 배포와 결제 E2E 검증 → 운영 안정화 → 학습 기능 확장",{x:1.2,y:5.65,w:10.9,h:0.55,fontSize:18,bold:true,color:C.dark,align:"center",margin:0});

s=slide("12. 시연 순서","5분 데모 기준 핵심 사용자 흐름");
bullets(s,["학생 회원가입 및 로그인","강의 탐색 → 결제위젯 → 결제 승인","내 강의 이어보기 → 자동 진도 저장 → 완강 표시","강사 대시보드에서 강의·매출·수강 현황 확인","관리자 콘솔에서 회원·결제·환불·배치·Webhook 확인","/health와 구조화 로그로 운영 상태 확인"],1.0,1.45,11.3,4.4,18);
s.addShape(pptx.ShapeType.roundRect,{x:2.7,y:5.85,w:7.9,h:0.65,fill:{color:C.dark},line:{color:C.dark},radius:0.08});
s.addText("감사합니다 · Questions?",{x:2.9,y:6.02,w:7.5,h:0.3,fontSize:18,bold:true,color:C.white,align:"center",margin:0});

pptx.writeFile({ fileName: "제출물/DevFocus_발표자료.pptx" });
