# wrangler.toml 설정 가이드

## 🚨 긴급: D1 Binding이 작동하지 않는 이유

Cloudflare Workers에서 D1 Database를 사용하려면 **wrangler.toml** 파일이 필수입니다.

Dashboard에서 Binding을 설정해도, `wrangler.toml` 파일이 없으면 Workers 런타임에서 `env.BEAUTYCAT_DB`가 `undefined`가 됩니다.

---

## 📋 즉시 수행할 작업

### 1단계: Database ID 확인

1. **Cloudflare Dashboard** 접속
2. **Workers & Pages** → **D1** → **beautycat-db** 클릭
3. **Database ID** 복사 (예: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### 2단계: wrangler.toml 수정

프로젝트에 생성된 `wrangler.toml` 파일을 열고:

```toml
database_id = "YOUR_DATABASE_ID_HERE"
```

이 부분을 **실제 Database ID**로 변경:

```toml
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

두 곳 모두 수정해야 합니다 (일반 설정 + production 환경).

### 3단계: Git에 Push

```bash
git add wrangler.toml
git commit -m "Add wrangler.toml with D1 binding"
git push
```

### 4단계: Workers 재배포

#### 방법 A: Wrangler CLI 사용 (권장)

```bash
# Wrangler 설치 (아직 없다면)
npm install -g wrangler

# Cloudflare 로그인
wrangler login

# Workers 배포
wrangler deploy
```

#### 방법 B: Dashboard에서 수동 배포

1. **Cloudflare Dashboard**
2. **Workers & Pages** → **beautycat-api**
3. **Deployments** 탭
4. **Quick edit** 클릭
5. 왼쪽 파일 목록에서 `wrangler.toml` 파일 확인
6. **Save and Deploy** 클릭

---

## ✅ 검증

배포 후 다음 URL 테스트:

```
https://beautycat-api.jansmakr.workers.dev/api/tables/users?limit=10
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

## 🔍 wrangler.toml이 왜 필요한가?

### Dashboard Binding만으로는 부족한 이유:

1. **Dashboard Binding**: UI에서 설정한 환경 변수
2. **wrangler.toml**: Workers 코드의 "설정 파일"
3. **문제**: Cloudflare는 wrangler.toml을 우선시하며, 이 파일이 없으면 Dashboard 설정을 무시할 수 있음

### wrangler.toml의 역할:

```toml
[[d1_databases]]
binding = "BEAUTYCAT_DB"          # JavaScript에서 env.BEAUTYCAT_DB로 접근
database_name = "beautycat-db"    # D1 데이터베이스 이름
database_id = "xxx-xxx-xxx"       # 고유 식별자
```

이 설정이 있어야 Workers 런타임이:
- `env.BEAUTYCAT_DB` 객체를 생성
- `.prepare()` 메서드를 사용할 수 있게 함

---

## 📌 다음 단계

wrangler.toml 설정 후:

1. ✅ **D1 Binding 작동 확인**
2. ✅ **데이터베이스 초기화** (PRODUCTION_QUICK_START.md 참고)
3. ✅ **로그인 테스트** (admin@beautycat.kr)
4. ✅ **프론트엔드 연동 확인**

---

## 🚀 완료 시점 판단

다음 API 호출이 **500 에러 없이** 성공하면 완료:

```bash
curl https://beautycat-api.jansmakr.workers.dev/api/tables/users?limit=10
```

---

**작성일:** 2024-11-01
**긴급도:** 🔴 최우선 해결 필요
