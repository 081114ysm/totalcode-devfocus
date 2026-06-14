# P2 미들웨어 명세 — DevFocus

## 1. 미들웨어 파이프라인

```
Request
  └─ helmet()              ← 보안 헤더
  └─ cors()                ← CORS origin 제한
  └─ express.json()        ← 바디 파싱 (limit: 1mb)
  └─ requestLogger         ← HTTP 요청 로그 (Winston)
  └─ rateLimit()           ← Rate Limiting
  └─ authMiddleware        ← JWT 검증 → req.user 주입
  └─ requireRole(...)      ← 역할 검증
  └─ Controller
  └─ errorHandler          ← 글로벌 에러 핸들러
```

---

## 2. authMiddleware (JWT 인증)

**파일**: `src/middleware/auth.js`

```
Authorization 헤더에서 Bearer {token} 추출
  → 헤더 없음: 401 { "error": "토큰 없음" }
  → jwt.verify 실패 (만료/위변조): 401 { "error": "토큰 오류" }
  → 검증 성공: req.user = { id, role } 주입 후 next()
```

**구현 요점**
- `req.headers.authorization?.split(" ")[1]`으로 토큰 추출
- `JWT_SECRET`은 환경변수에서만 읽음 (하드코딩 금지)
- 선택적 인증이 필요한 라우트는 `optionalAuth` 패턴 사용 (강의 상세 등)

---

## 3. requireRole(...roles) (역할 검증)

**파일**: `src/middleware/auth.js`

```
authMiddleware 통과 이후 실행
  → req.user 없음: 401 { "error": "인증 필요" }
  → req.user.role이 허용 역할 목록에 없음: 403 { "error": "권한 없음" }
  → 허용 역할이면: next()
```

**사용 예시**
```js
// admin 전용
router.use(authMiddleware, requireRole("admin"));

// instructor 또는 admin
router.use(authMiddleware, requireRole("instructor", "admin"));
```

---

## 4. 소유권 검증 (checkCourseOwnership)

별도 미들웨어가 아닌 컨트롤러 내에서 직접 검증한다.

```js
const [rows] = await db.query(
  "SELECT id FROM courses WHERE id = ? AND instructor_id = ?",
  [courseId, req.user.id]
);
if (!rows[0]) return res.status(403).json({ error: "권한 없음" });
```

admin은 소유권 검증 없이 모든 강의에 접근 가능 (admin 라우트 분리로 처리).

---

## 5. validateRegister / validateLogin (입력 검증)

**파일**: `src/middleware/validate.js`

| 미들웨어 | 검증 항목 |
|----------|----------|
| `validateRegister` | 이메일 형식, 비밀번호 4자 이상, 닉네임 2자 이상 |
| `validateLogin` | 이메일 형식, 비밀번호 존재 여부 |
| `validateQuestion` | 제목 2자 이상, 내용 필수 |
| `validateAnswer` | questionId 필수, 내용 필수 |
| `validateProgress` | lessonId 필수, watchedSeconds 0 이상 |
| `validateNickname` | 닉네임 2자 이상 |

검증 실패 시 응답 형식:
```json
{ "error": "첫 번째 에러 메시지", "errors": ["에러1", "에러2"] }
```

---

## 6. requestLogger (HTTP 요청 로그)

**파일**: `src/middleware/requestLogger.js`

`res.on("finish")` 이벤트로 응답 완료 후 로그 기록.

```json
{
  "level": "info",
  "message": "HTTP",
  "method": "POST",
  "url": "/api/auth/login",
  "status": 200,
  "responseTime": "23ms"
}
```

---

## 7. rateLimiter (Rate Limiting)

**파일**: `src/middleware/rateLimiter.js`

| 대상 | 제한 | 미들웨어 |
|------|------|---------|
| `/api/auth/*` | 15분 / 20회 | `authLimiter` |
| `/api/*` 전체 | 15분 / 200회 | `apiLimiter` |

초과 시 응답:
```json
{ "error": "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }
```

`standardHeaders: true` — `RateLimit-*` 헤더 자동 포함.

---

## 8. 보안 요구사항

### OWASP Top 10 대응

| 항목 | 위협 | 대응 |
|------|------|------|
| A01 | Broken Access Control | `requireRole` 미들웨어, `instructor_id` 소유권 검증 |
| A02 | Cryptographic Failures | `JWT_SECRET` 환경변수 분리, bcrypt saltRounds=10 |
| A03 | Injection | mysql2 prepared statement (`?` 파라미터), 입력값 `trim()` |
| A05 | Security Misconfiguration | Helmet 보안 헤더, CORS origin 제한 |
| A07 | Auth Failures | Rate Limiting (인증 API: 15분/20회), 토큰 만료 7일 |

### Helmet 적용 헤더

| 헤더 | 목적 |
|------|------|
| `X-Content-Type-Options: nosniff` | MIME 스니핑 방어 |
| `X-Frame-Options: DENY` | Clickjacking 방어 |
| `Strict-Transport-Security` | HTTPS 강제 (HSTS) |
| `Content-Security-Policy` | XSS 방어 |

### 바디 크기 제한

```js
express.json({ limit: "1mb" })
```

대용량 페이로드 DoS 공격 방어.
