# ✅ D1 Binding 설정 체크리스트

**목표**: Cloudflare Workers가 D1 데이터베이스에 접근할 수 있도록 설정  
**예상 소요 시간**: 5-10분  
**현재 문제**: `env.BEAUTYCAT_DB`가 undefined → 500 에러

---

## 📋 사전 준비물

- [ ] Cloudflare 계정 로그인
- [ ] beautycat 프로젝트 파일 접근 권한
- [ ] Wrangler CLI (옵션 - 배포 방법에 따라 다름)

---

## 🔍 1단계: 현재 상태 확인 (2분)

### Dashboard 확인
- [ ] **Cloudflare Dashboard** 접속
- [ ] **Workers & Pages** → **beautycat-api** 확인
- [ ] **D1** → **beautycat-db** 존재 확인
- [ ] **Settings** → **D1 Bindings** 탭에서 `BEAUTYCAT_DB` 확인

### API 테스트
- [ ] 브라우저에서 Health Check 테스트:
  ```
  https://beautycat-api.jansmakr.workers.dev/api/health
  ```
  **예상 결과**: 200 OK (정상)

- [ ] Users Table 조회 테스트:
  ```
  https://beautycat-api.jansmakr.workers.dev/api/tables/users?limit=10
  ```
  **현재 결과**: 500 에러 (정상 아님)

### 현재 상태 진단
- [ ] Health Check는 작동하지만 D1 조회는 실패하는가?
  - ✅ **예** → D1 Binding 문제 확정. 다음 단계로 진행
  - ❌ **아니오** → Workers 자체 문제일 수 있음

---

## 🔑 2단계: Database ID 확인 (1분)

### Cloudflare Dashboard에서 Database ID 찾기

1. **Cloudflare Dashboard** 접속
2. **Workers & Pages** 선택
3. 왼쪽 메뉴에서 **D1** 클릭
4. **beautycat-db** 클릭
5. 페이지 상단의 **Database ID** 복사

```
예시: 12345678-abcd-1234-efgh-123456789012
```

**Database ID 기록:**
```
____________________________________________
```

### 확인 사항
- [ ] Database ID가 UUID 형식인가? (8-4-4-4-12 자리)
- [ ] Database Name이 `beautycat-db`인가?
- [ ] Tables 탭에 10개 테이블이 있는가?

---

## 📝 3단계: wrangler.toml 파일 수정 (2분)

### 로컬 파일 수정 (Git Push 방식)

1. 프로젝트 폴더에서 `wrangler.toml` 파일 열기
2. 다음 두 곳에서 `YOUR_DATABASE_ID_HERE` 찾기:
   - 13번째 줄 (일반 설정)
   - 18번째 줄 (production 환경)

3. 복사한 Database ID로 교체:

```toml
# 변경 전
database_id = "YOUR_DATABASE_ID_HERE"

# 변경 후 (예시)
database_id = "12345678-abcd-1234-efgh-123456789012"
```

4. 파일 저장

### 수정 확인
- [ ] `database_id` 값이 UUID 형식으로 변경됨
- [ ] `binding = "BEAUTYCAT_DB"` (대문자) 확인
- [ ] `database_name = "beautycat-db"` (하이픈) 확인
- [ ] **두 곳 모두** 수정했는가? (일반 + production)

---

## 🚀 4단계: Workers 재배포 (3-5분)

### 🅰️ 방법 A: Wrangler CLI (권장)

```bash
# 1. Wrangler 설치 (아직 없다면)
npm install -g wrangler

# 2. Cloudflare 로그인
wrangler login

# 3. Workers 배포
wrangler deploy
```

**체크리스트:**
- [ ] Wrangler 설치 완료
- [ ] 로그인 성공
- [ ] 배포 성공 메시지 확인
- [ ] "Uploaded beautycat-api" 메시지 표시

---

### 🅱️ 방법 B: Dashboard 수동 배포

1. **Workers & Pages** → **beautycat-api**
2. 오른쪽 상단 **Edit code** 클릭
3. 왼쪽 파일 목록에서:
   - `wrangler.toml` 파일이 있으면 내용 업데이트
   - 없으면 **"+"** 버튼으로 새 파일 생성
4. Database ID가 수정된 wrangler.toml 내용 붙여넣기
5. **Save and Deploy** 클릭

**체크리스트:**
- [ ] wrangler.toml 파일 업로드 완료
- [ ] Save and Deploy 성공
- [ ] Deployments 탭에서 새 배포 확인

---

### 🅾️ 방법 C: Git Push 후 수동 배포

```bash
git add wrangler.toml
git commit -m "Add wrangler.toml with D1 binding configuration"
git push origin main
```

**주의**: Git Push는 Pages만 배포하므로, **방법 A 또는 B로 Workers도 별도 배포 필요**

**체크리스트:**
- [ ] Git Push 성공
- [ ] Workers 재배포 (방법 A 또는 B) 완료

---

## ✅ 5단계: 검증 (2분)

### API 테스트

#### 테스트 1: Health Check
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

- [ ] Health Check 성공 (200 OK)

---

#### 테스트 2: Users Table 조회
```bash
curl https://beautycat-api.jansmakr.workers.dev/api/tables/users?limit=10
```

**예상 응답 (성공):**
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

**실패 시 응답 (아직 안 고쳐짐):**
```json
{
  "error": "Database operation failed",
  "message": "Cannot read properties of undefined (reading 'prepare')"
}
```

- [ ] Users Table 조회 성공 (200 OK)
- [ ] 응답에 `data`, `total`, `schema` 필드 포함

---

#### 테스트 3: 브라우저 테스트 (권장)

1. `d1-binding-test.html` 파일을 브라우저에서 열기
2. **"🚀 전체 테스트 시작"** 버튼 클릭
3. 4개 테스트 모두 ✅ 성공 확인

- [ ] d1-binding-test.html 테스트 모두 통과
- [ ] "🎉 모든 테스트 통과!" 메시지 표시

---

## 🎯 성공 기준

### 모든 항목이 체크되어야 합니다:

- [ ] ✅ Health Check 200 OK
- [ ] ✅ Users Table 조회 200 OK
- [ ] ✅ 응답에 빈 배열(`data: []`) 포함
- [ ] ✅ 응답에 `schema` 객체 포함
- [ ] ✅ 500 에러 발생하지 않음

---

## 🔧 문제 해결 (실패 시)

### 여전히 500 에러가 발생하면?

#### 1. 브라우저 캐시 삭제
- [ ] Ctrl+Shift+R (Windows/Linux)
- [ ] Cmd+Shift+R (Mac)
- [ ] 1-2분 대기 후 재테스트

#### 2. wrangler.toml 재확인
```bash
cat wrangler.toml
```

확인 사항:
- [ ] `binding = "BEAUTYCAT_DB"` (대문자!)
- [ ] `database_name = "beautycat-db"` (하이픈!)
- [ ] `database_id = "실제UUID"` (YOUR_DATABASE_ID_HERE 아님!)
- [ ] 두 곳 모두 수정됨 (일반 + production)

#### 3. Dashboard Binding 재확인
- [ ] Workers & Pages → beautycat-api
- [ ] Settings → Variables and Secrets
- [ ] D1 Bindings 탭에서:
  - Variable name: `BEAUTYCAT_DB`
  - D1 database: `beautycat-db`

#### 4. Workers 로그 확인
- [ ] Workers & Pages → beautycat-api
- [ ] Logs → Real-time logs
- [ ] API 요청 시도 후 에러 메시지 확인

#### 5. D1 직접 테스트
- [ ] Workers & Pages → D1 → beautycat-db
- [ ] Console 탭에서 쿼리 실행:
  ```sql
  SELECT * FROM users LIMIT 1;
  ```
- [ ] 정상 실행 확인 (에러 없이 빈 결과 또는 데이터 반환)

#### 6. 강제 재배포
- [ ] Dashboard에서 기존 배포 Rollback
- [ ] 다시 최신 버전으로 Promote
- [ ] 1-2분 대기 후 재테스트

---

## 📊 완료 후 다음 단계

### ✅ D1 Binding 설정 완료 시

1. **데이터베이스 초기화**
   - [ ] PRODUCTION_QUICK_START.md 가이드 열기
   - [ ] Cloudflare D1 Console에서 SQL 실행
   - [ ] 관리자 계정 생성 (admin@beautycat.kr)
   - [ ] 테스트 샵 3개 추가

2. **로그인 테스트**
   - [ ] https://beautycat-v2.pages.dev/login.html 접속
   - [ ] admin@beautycat.kr / beautycat2024! 로그인
   - [ ] 관리자 대시보드 정상 표시 확인

3. **프론트엔드 연동 확인**
   - [ ] 사용자 목록 조회 작동
   - [ ] 샵 목록 조회 작동
   - [ ] 상담 신청 기능 작동

4. **베타 테스트 준비**
   - [ ] BEAUTYCAT_BETA_LAUNCH_FINAL_CHECKLIST.md 확인
   - [ ] 강남구 피부샵 모집 계획 실행

---

## 📞 지원

문제가 계속되면 다음 정보 수집:

1. Workers API Health Check 결과 스크린샷
2. Users Table 조회 결과 (에러 메시지)
3. wrangler.toml 파일 내용 (Database ID는 가려서)
4. Workers Real-time logs 스크린샷
5. 브라우저 콘솔 에러 메시지

---

**작성일**: 2024-11-01  
**문서 버전**: 1.0  
**예상 완료 시간**: 5-10분  
**난이도**: ⭐⭐☆☆☆ (쉬움)
