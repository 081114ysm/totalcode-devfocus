# DevFocus 문서 인덱스

DevFocus — 개발자 학습 플랫폼 (Express 5 + MySQL 8 + Next.js 16)

---

## 문서 목록

### 루트
| 파일 | 설명 |
|------|------|
| [requirements.md](./requirements.md) | P1 기능 요구사항 |

### API 명세 (`api/`)
| 파일 | 설명 |
|------|------|
| [api/overview.md](./api/overview.md) | 기본 정보, 인증 헤더, 공통 에러, 역할, 엔드포인트 요약 |
| [api/auth-users.md](./api/auth-users.md) | 회원가입, 로그인, 내 정보 |
| [api/courses.md](./api/courses.md) | 강의 목록/상세/수강/좋아요/댓글 |
| [api/learning.md](./api/learning.md) | 진도, 집중타이머, 코드스니펫 |
| [api/qna.md](./api/qna.md) | Q&A 질문/답변 |
| [api/payments.md](./api/payments.md) | 결제, 정산 조회 |
| [api/instructor.md](./api/instructor.md) | 강사 전용 (강의/레슨 CRUD) |
| [api/admin.md](./api/admin.md) | 관리자 전용, 정산 관리, Health Check |

### DB 스키마 (`erd/`)
| 파일 | 설명 |
|------|------|
| [erd/overview.md](./erd/overview.md) | ER 다이어그램, 관계 요약, 인덱스, 설계 원칙 |
| [erd/tables-p1.md](./erd/tables-p1.md) | P1 테이블 11개 상세 명세 |
| [erd/tables-p2p3.md](./erd/tables-p2p3.md) | P2/P3 신규 테이블 (payments, settlements, job_logs) |
| [erd/migration.md](./erd/migration.md) | 마이그레이션 절차 |

### P2 — 인증/권한 (`p2/`)
| 파일 | 설명 |
|------|------|
| [p2/requirements.md](./p2/requirements.md) | P2 요구사항 요약 |
| [p2/roles.md](./p2/roles.md) | 역할 정의, 권한 매트릭스, 소유권 검증 |
| [p2/auth-spec.md](./p2/auth-spec.md) | JWT 토큰 구조, 인증 명세 |
| [p2/api.md](./p2/api.md) | AUTH/ADMIN/INSTRUCTOR API 처리 흐름 |
| [p2/middleware.md](./p2/middleware.md) | 미들웨어, Rate Limiting, 보안 요구사항 |
| [p2/db.md](./p2/db.md) | DB 변경사항, 환경변수, 관리자 계정 설정 |

### P3 — 운영 (`p3/`)
| 파일 | 설명 |
|------|------|
| [p3/requirements.md](./p3/requirements.md) | P3 요구사항 (보안, 로그, 이메일, Discord, 결제, 정산) |
| [p3/runbook.md](./p3/runbook.md) | 배포, 마이그레이션, 장애 대응 |

---

## 빠른 시작

```bash
cd backend && cp ../.env.example .env
npm install
mysql -u root -p devfocus < src/config/schema.sql
mysql -u root -p devfocus < src/config/schema_p2_p3.sql
npm run create-admin
node src/app.js
```
