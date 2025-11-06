# 🚨 BeautyCat 최종 배포 해결 방안

## 문제 상황 요약

### 현재 에러
```json
{
  "error": "Database operation failed",
  "message": "Cannot read properties of undefined (reading 'prepare')"
}
```

### 원인
- **Cloudflare Dashboard에는 D1 Binding이 올바르게 설정됨**: `BEAUTYCAT_DB` → `beautycat-db`
- **하지만 Workers 런타임에서 `env.BEAUTYCAT_DB`가 `undefined`**
- **핵심 문제**: `wrangler.toml` 설정 파일 누락

---

## 해결 방법 (3가지 옵션)

### 🚀 옵션 1: Wrangler CLI 배포 (권장 - 가장 확실함)

#### 1단계: Database ID 확인
1. Cloudflare Dashboard 접속
2. **Workers & Pages** → **D1** → **beautycat-db**
3. **Database ID** 복사 (예: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

#### 2단계: wrangler.toml 수정
프로젝트의 `wrangler.toml` 파일에서 다음 부분 수정:

```toml
# 이 부분을 찾아서
database_id = "YOUR_DATABASE_ID_HERE"

# 실제 Database ID로 변경
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**두 곳 모두** 수정해야 합니다:
- 일반 설정 (13번째 줄)
- production 환경 설정 (18번째 줄)

#### 3단계: Wrangler CLI로 배포

```bash
# Wrangler 설치 (아직 없다면)
npm install -g wrangler

# Cloudflare 로그인
wrangler login

# Workers 배포
wrangler deploy
```

#### 4단계: 테스트
```bash
curl https://beautycat-api.jansmakr.workers.dev/api/tables/users?limit=10
```

**예상 결과:**
```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 10,
  "table": "users",
  "schema": {...}
}
```

---

### 💻 옵션 2: Cloudflare Dashboard 수동 배포

#### 1단계: Database ID 확인 (옵션 1과 동일)

#### 2단계: wrangler.toml 업로드

1. **Workers & Pages** → **beautycat-api**
2. **Edit code** 클릭 (오른쪽 상단)
3. 왼쪽 파일 목록에서 **"+"** 버튼 클릭
4. **File name**: `wrangler.toml`
5. 다음 내용 복사 붙여넣기 (Database ID 수정 후):

```toml
name = "beautycat-api"
main = "cloudflare-workers-beautycat.js"
compatibility_date = "2024-10-31"

# D1 Database Binding
[[d1_databases]]
binding = "BEAUTYCAT_DB"
database_name = "beautycat-db"
database_id = "여기에_실제_DATABASE_ID_입력"

# 프로덕션 환경 설정
[env.production]
name = "beautycat-api"

[[env.production.d1_databases]]
binding = "BEAUTYCAT_DB"
database_name = "beautycat-db"
database_id = "여기에_실제_DATABASE_ID_입력"
```

6. **Save and Deploy** 클릭

#### 3단계: 배포 확인

1. **Deployments** 탭으로 이동
2. 최신 배포에 "Added D1 database binding BEAUTYCAT_DB" 메시지 확인
3. 1-2분 대기

#### 4단계: 테스트 (옵션 1과 동일)

---

### 🔄 옵션 3: GitHub → Cloudflare Pages 자동 배포

#### 1단계: Database ID 확인 (옵션 1과 동일)

#### 2단계: wrangler.toml 수정 (옵션 1과 동일)

#### 3단계: Git Push

```bash
git add wrangler.toml
git commit -m "Add wrangler.toml with D1 binding configuration"
git push origin main
```

#### 4단계: Cloudflare Pages 자동 배포 대기

1. **Workers & Pages** → **beautycat-v2**
2. **Deployments** 탭에서 새 배포 진행 상황 확인
3. 완료까지 2-3분 대기

#### 5단계: Workers 수동 배포 필요

**중요**: Pages는 frontend만 배포하므로, Workers는 별도 배포 필요
- **옵션 1** (Wrangler CLI) 또는
- **옵션 2** (Dashboard 수동 배포) 중 선택

---

## 검증 체크리스트

### ✅ 1단계: Health Check
```bash
curl https://beautycat-api.jansmakr.workers.dev/api/health
```

**예상 응답:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-01T...",
  "service": "beautycat-api"
}
```

### ✅ 2단계: Users Table 조회
```bash
curl https://beautycat-api.jansmakr.workers.dev/api/tables/users?limit=10
```

**예상 응답:**
```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 10,
  "table": "users",
  "schema": {
    "fields": ["id", "email", "name", "user_type", "phone", "status", ...]
  }
}
```

### ✅ 3단계: 프론트엔드에서 API 호출 테스트

브라우저 콘솔에서:
```javascript
API.checkHealth().then(console.log);
API.get('users', {limit: 5}).then(console.log);
```

---

## 여전히 500 에러가 발생한다면?

### 디버깅 단계

#### 1. Dashboard에서 Binding 재확인
1. **Workers & Pages** → **beautycat-api**
2. **Settings** → **Variables and Secrets** → **D1 Bindings**
3. 확인:
   - **Variable name**: `BEAUTYCAT_DB`
   - **D1 database**: `beautycat-db`

#### 2. wrangler.toml 내용 확인
```bash
cat wrangler.toml
```

다음 항목 확인:
- `binding = "BEAUTYCAT_DB"` (대문자 확인!)
- `database_name = "beautycat-db"` (하이픈 확인!)
- `database_id = "실제ID"` (YOUR_DATABASE_ID_HERE가 아님!)

#### 3. Workers 로그 확인
1. **Workers & Pages** → **beautycat-api**
2. **Logs** → **Real-time logs**
3. API 요청 시도
4. 에러 메시지 확인

#### 4. D1 데이터베이스 확인
1. **Workers & Pages** → **D1** → **beautycat-db**
2. **Console** 탭에서 쿼리 테스트:
```sql
SELECT * FROM users LIMIT 1;
```

---

## 배포 완료 후 다음 단계

### 1. D1 데이터베이스 초기화

**PRODUCTION_QUICK_START.md** 참고:

```sql
-- 관리자 계정 생성
INSERT INTO users (id, email, name, password_hash, user_type, phone, status, created_at, updated_at)
VALUES (
    'admin_001',
    'admin@beautycat.kr',
    'BeautyCat 관리자',
    'hashed_beautycat2024',
    'admin',
    '070-7004-5902',
    'active',
    1730448000000,
    1730448000000
);

-- 테스트 샵 3개 추가
-- (PRODUCTION_QUICK_START.md 참고)
```

### 2. 로그인 테스트

**https://beautycat-v2.pages.dev/login.html**

- 이메일: `admin@beautycat.kr`
- 비밀번호: `beautycat2024!`

### 3. 관리자 대시보드 확인

로그인 성공 시 자동 이동:
**https://beautycat-v2.pages.dev/admin-dashboard.html**

### 4. 커스텀 도메인 연결 (선택사항)

#### beautycat.kr → Pages
1. **beautycat-v2** → **Custom domains**
2. **Set up a custom domain** 클릭
3. `beautycat.kr` 입력
4. DNS 레코드 추가 (Cloudflare DNS 사용 시 자동)

#### api.beautycat.kr → Workers
1. **beautycat-api** → **Settings** → **Domains & Routes**
2. **Add** 클릭
3. `api.beautycat.kr` 입력
4. DNS 레코드 추가

---

## 문제 해결 FAQ

### Q1: "Database ID를 어디서 찾나요?"
**A**: Cloudflare Dashboard → D1 → beautycat-db → 페이지 상단의 "Database ID" 복사

### Q2: "wrangler.toml 파일을 어디에 넣나요?"
**A**: 
- **옵션 1**: 로컬 프로젝트 루트 → Git Push
- **옵션 2**: Workers Dashboard → Edit code → 새 파일 생성

### Q3: "여전히 500 에러가 발생합니다"
**A**: 
1. 브라우저 캐시 삭제 (Ctrl+Shift+R)
2. 1-2분 대기 후 재시도
3. Workers 로그 확인
4. 이 문서의 "디버깅 단계" 참고

### Q4: "Dashboard Binding과 wrangler.toml 중 뭐가 우선인가요?"
**A**: **wrangler.toml이 우선**입니다. Dashboard 설정은 wrangler.toml이 없을 때만 작동합니다.

---

## 연락처

문제 해결이 안 되면 다음 정보와 함께 문의:
1. Workers API URL 테스트 결과
2. wrangler.toml 파일 내용 (Database ID 제외)
3. Workers 로그 스크린샷
4. 브라우저 콘솔 에러 메시지

---

**작성일**: 2024-11-01
**긴급도**: 🔴 최우선
**예상 소요 시간**: 5-10분
