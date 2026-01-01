# 🔧 DB 마이그레이션 간단 가이드

**날짜**: 2025-12-31  
**대상**: BeautyCat v2.8.13.6.125 배포

---

## 🎯 목표

`reviews` 테이블에 `quote_id` 컬럼을 추가하기 위해 DB 마이그레이션을 실행합니다.

---

## ✅ 방법 1: 자동 배포 스크립트 사용 (가장 쉬움!) ⭐

배포 스크립트(`push-v2.8.13.6.125-FINAL.bat`)에 이미 DB 마이그레이션이 **자동으로 포함**되어 있습니다!

### 실행 방법

```batch
cd /d D:\beautycat
push-v2.8.13.6.125-FINAL.bat
```

**이게 전부입니다!** 스크립트가 자동으로:
1. DB 마이그레이션 실행
2. Git 커밋
3. GitHub 푸시

를 모두 처리합니다.

---

## ⚙️ 방법 2: Wrangler 명령어 직접 실행 (수동)

Wrangler가 설치되어 있다면 직접 실행할 수 있습니다.

### 1단계: Wrangler 설치 확인

```batch
wrangler --version
```

**출력 예시**:
```
⛅️ wrangler 3.78.0
```

### 2단계: 로그인 (처음 한 번만)

```batch
wrangler login
```

브라우저가 열리고 Cloudflare 계정으로 로그인하면 됩니다.

### 3단계: DB 마이그레이션 실행

```batch
wrangler d1 execute beautycat-db --remote --file=migrations/0003_add_quote_id_to_reviews.sql
```

**성공 메시지**:
```
🌀 Executing on remote database beautycat-db (XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
🚣 Executed 1 command in 0.XXXXms
```

---

## 🌐 방법 3: Cloudflare 대시보드 사용 (UI로 직접 실행)

Wrangler 없이도 Cloudflare 웹사이트에서 직접 실행할 수 있습니다!

### 1단계: Cloudflare 대시보드 접속

1. https://dash.cloudflare.com 접속
2. 로그인
3. **Workers & Pages** 클릭
4. **D1** 클릭
5. **beautycat-db** 클릭

### 2단계: SQL 쿼리 실행

1. **Console** 탭 클릭
2. 아래 SQL 쿼리를 복사해서 붙여넣기:

```sql
-- reviews 테이블에 quote_id 컬럼 추가
-- SQLite는 ALTER TABLE ADD COLUMN만 지원하므로, FOREIGN KEY는 재생성 필요

-- 1. quote_id 컬럼 추가
ALTER TABLE reviews ADD COLUMN quote_id TEXT;

-- 2. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_reviews_quote ON reviews(quote_id);
```

3. **Execute** 버튼 클릭

### 3단계: 확인

성공 메시지가 표시되면 완료!

```
✅ Query executed successfully
```

---

## 🔍 마이그레이션 확인 방법

### Cloudflare 대시보드에서 확인

1. D1 > beautycat-db > Console
2. 아래 쿼리 실행:

```sql
PRAGMA table_info(reviews);
```

**결과에서 `quote_id TEXT` 컬럼이 보이면 성공!**

### Wrangler로 확인

```batch
wrangler d1 execute beautycat-db --remote --command="PRAGMA table_info(reviews);"
```

---

## ❓ Wrangler가 없는 경우

### Wrangler 설치 방법

```batch
npm install -g wrangler
```

**Node.js가 없다면**:
1. https://nodejs.org 에서 Node.js 설치
2. 다시 위 명령어 실행

### 또는 Cloudflare 대시보드 사용 (방법 3)

Wrangler 없이도 웹 UI로 쉽게 실행할 수 있습니다!

---

## 🎯 권장 방법 정리

| 상황 | 권장 방법 |
|------|-----------|
| Wrangler 설치됨 | **방법 1** (자동 배포 스크립트) |
| Wrangler 없음 | **방법 3** (Cloudflare 대시보드) |
| 수동 제어 원함 | **방법 2** (Wrangler 명령어) |

---

## 🚨 주의사항

### 1. 마이그레이션은 한 번만 실행하세요!

이미 실행했다면 다시 실행하지 마세요. (에러 발생 가능)

### 2. 프로덕션 DB에 실행됩니다!

`--remote` 옵션은 **실제 운영 DB**에 적용됩니다.

### 3. SQLite의 한계

SQLite는 FOREIGN KEY를 나중에 추가할 수 없습니다.
- 현재: `quote_id` 컬럼만 추가
- FOREIGN KEY는 다음 마이그레이션에서 테이블 재생성 시 추가

---

## ✅ 성공 확인

마이그레이션이 성공하면:

1. **Cloudflare 대시보드**에서 `reviews` 테이블에 `quote_id` 컬럼 표시
2. **배포 후** 리뷰 작성 시 `quote_id`가 자동으로 저장됨
3. **에러 없이** 리뷰 시스템 정상 작동

---

## 🆘 문제 발생 시

### "Table reviews already exists" 에러

→ 이미 마이그레이션이 실행되었습니다. 무시하고 다음 단계로 진행하세요.

### "Column quote_id already exists" 에러

→ 이미 `quote_id` 컬럼이 추가되었습니다. 성공입니다!

### "Authentication error" 에러

→ `wrangler login` 명령어로 다시 로그인하세요.

### Wrangler 명령어를 찾을 수 없음

→ **방법 3** (Cloudflare 대시보드)을 사용하세요!

---

## 📞 추가 도움이 필요하면

1. **Cloudflare 대시보드** 사용 (가장 쉬움!)
2. Wrangler 설치 후 자동 스크립트 실행
3. 문서 참고: INTEGRATION_TEST_v2.8.13.6.123.md

---

**간단 요약**:
```
자동 스크립트 실행만 하면 끝!
↓
push-v2.8.13.6.125-FINAL.bat
```

마이그레이션은 자동으로 처리됩니다! 🎉
