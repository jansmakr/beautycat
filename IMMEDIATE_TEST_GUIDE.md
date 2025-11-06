# 🚀 BeautyCat 즉시 테스트 가이드

## 📋 변경사항 요약

### ✅ 수정된 파일:

1. **login.html**
   - Service Worker 즉시 제거 코드 추가 (최상단)
   - Fetch 오버라이드 개선 (상대/절대 경로 처리)

2. **sw.js**
   - 이미 완전 비활성화됨 (확인 완료)

3. **README.md**
   - 현재 상태 업데이트

4. **SERVICE_WORKER_PROBLEM_ANALYSIS.md**
   - 완전 분석 보고서 생성

---

## 🎯 테스트 옵션 2가지

### 옵션 1: 로컬 테스트 (즉시 - 30초) ⭐ 추천

**단계:**

1. **브라우저에서 login.html 열기**
   ```
   파일 탐색기에서 login.html 더블클릭
   또는
   브라우저 주소창에 file:///경로/login.html
   ```

2. **F12 개발자 도구 열기**

3. **Console 탭에서 확인**
   ```
   예상 로그:
   ✅ Service Worker 제거됨: https://beautycat-v2.pages.dev/
   ✅ Fetch 오버라이드 설치 완료
   ```

4. **Network 탭에서 확인**
   - 필터: "tables" 입력
   - 로그인 시도
   - 요청 URL 확인:
     ```
     ✅ 올바른: https://beautycat-api.jansmakr.workers.dev/api/tables/users
     ❌ 잘못된: https://beautycat-v2.pages.dev/tables/users
     ```

5. **테스트 로그인**
   ```
   이메일: admin@beautycat.kr
   비밀번호: beautycat2024!
   ```

**예상 결과:**
- ✅ Console에 API 경로 변환 로그 출력
- ✅ 로그인 성공 → admin-dashboard.html 리다이렉트
- ✅ Network에 200 OK 응답

---

### 옵션 2: 온라인 테스트 (5분 후)

**단계:**

1. **GitHub에 Push**
   ```bash
   # 로컬에서 이미 수정된 파일들:
   # - login.html (SW 제거 + fetch 오버라이드 개선)
   # - README.md (상태 업데이트)
   # - SERVICE_WORKER_PROBLEM_ANALYSIS.md (새 파일)
   # - IMMEDIATE_TEST_GUIDE.md (새 파일)
   
   git add .
   git commit -m "Fix: Service Worker 간섭 문제 해결 - SW 제거 + fetch 오버라이드 개선"
   git push origin main
   ```

2. **Cloudflare Pages 배포 대기**
   ```
   https://dash.cloudflare.com/
   → Pages → beautycat-v2 → Deployments
   → "Building" → "Success" (약 2-3분)
   ```

3. **브라우저 캐시 완전 삭제**
   ```
   F12 → Application 탭 → Storage → Clear site data
   또는
   Ctrl + Shift + Delete → 전체 삭제
   ```

4. **온라인 사이트 접속**
   ```
   https://beautycat-v2.pages.dev/login.html
   ```

5. **강제 새로고침**
   ```
   Ctrl + Shift + R (Windows)
   Cmd + Shift + R (Mac)
   ```

6. **F12 Console 확인**
   ```
   예상 로그:
   ✅ Service Worker 제거됨
   ✅ Fetch 오버라이드 설치 완료
   ```

7. **테스트 로그인**
   ```
   이메일: admin@beautycat.kr
   비밀번호: beautycat2024!
   ```

**예상 결과:**
- ✅ Service Worker 제거됨
- ✅ API 요청이 Workers API로 전송됨
- ✅ 로그인 성공

---

## 🔍 문제 발생 시 디버깅

### 1. Service Worker가 여전히 등록되어 있는 경우

**확인:**
```javascript
// F12 → Console
navigator.serviceWorker.getRegistrations().then(regs => {
    console.log('등록된 SW:', regs);
});
```

**해결:**
```
F12 → Application → Service Workers → Unregister
또는
F12 → Application → Storage → Clear site data
```

---

### 2. API 요청이 여전히 Pages로 가는 경우

**확인:**
```
F12 → Network → 필터: "tables"
로그인 버튼 클릭
요청 URL 확인
```

**해결:**
```javascript
// F12 → Console에서 직접 테스트
fetch('tables/users?limit=1')
    .then(r => r.json())
    .then(d => console.log('API 응답:', d));

// 예상 로그:
// 🔄 [상대경로] API 변환: tables/users?limit=1 → https://beautycat-api.jansmakr.workers.dev/api/tables/users?limit=1
```

**로그가 출력되지 않으면:**
- 페이지 강제 새로고침 (Ctrl + Shift + R)
- 캐시 완전 삭제
- 브라우저 재시작

---

### 3. CORS 에러 발생 시

**에러 메시지:**
```
Access to fetch at 'https://beautycat-api.jansmakr.workers.dev/...' 
from origin 'https://beautycat-v2.pages.dev' has been blocked by CORS policy
```

**확인:**
```bash
# Workers API에 직접 요청해보기
curl -X POST https://beautycat-api.jansmakr.workers.dev/api/tables/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","name":"Test"}'
```

**Workers API는 이미 CORS 설정되어 있음:**
```javascript
// cloudflare-workers-beautycat.js:35-41
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
};
```

**따라서 CORS 에러는 발생하지 않아야 함**

---

### 4. 500 Error 발생 시

**확인:**
```bash
# Workers API 직접 테스트
curl https://beautycat-api.jansmakr.workers.dev/api/tables/users?limit=10
```

**예상 응답:**
```json
{
  "data": [
    {
      "id": "admin_beautycat_001",
      "email": "admin@beautycat.kr",
      "name": "관리자",
      "user_type": "admin"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

**500 Error가 계속되면:**
- Workers API의 D1 Binding 재확인
- Cloudflare Dashboard → Workers → beautycat-api → Settings → Variables
- BEAUTYCAT_DB가 beautycat-db에 연결되어 있는지 확인

---

## 📊 성공 체크리스트

### ✅ 로그인 페이지 로드 시:
- [ ] Console에 "Service Worker 제거됨" 출력
- [ ] Console에 "Fetch 오버라이드 설치 완료" 출력
- [ ] Application 탭에서 Service Worker 0개

### ✅ 로그인 버튼 클릭 시:
- [ ] Console에 "🔄 [상대경로] API 변환: tables/users → ..." 출력
- [ ] Network 탭에서 Workers API로 요청 전송 확인
- [ ] Status: 200 OK

### ✅ 로그인 성공 시:
- [ ] "로그인 성공!" 메시지 출력
- [ ] admin-dashboard.html로 리다이렉트
- [ ] localStorage에 사용자 정보 저장

---

## 🎉 성공 후 다음 단계

### 1. 데이터베이스 초기화 (5분)

**PRODUCTION_QUICK_START.md 참고:**
```sql
-- 샵 3개 추가
INSERT INTO skincare_shops (id, name, state, district) VALUES 
('shop_001', '강남 피부관리실', '서울', '강남구'),
('shop_002', '홍대 스킨케어', '서울', '마포구'),
('shop_003', '분당 뷰티샵', '경기', '분당구');

-- 대표 샵 2개 추가
INSERT INTO representative_shops (id, shop_id, business_number) VALUES
('rep_001', 'shop_001', '123-45-67890'),
('rep_002', 'shop_002', '098-76-54321');

-- 공지사항 1개 추가
INSERT INTO announcements (id, title, content) VALUES
('ann_001', '베타 테스트 시작', '베타 테스터를 모집합니다!');
```

### 2. 관리자 대시보드 확인 (2분)

```
https://beautycat-v2.pages.dev/admin-dashboard.html

확인 사항:
- [ ] 사용자 목록 표시
- [ ] 샵 목록 표시
- [ ] 상담 목록 표시
- [ ] 통계 정보 표시
```

### 3. 베타 테스트 시작 (준비 완료!)

```
✅ D1 Database 연결 완료
✅ Workers API 정상 작동
✅ Service Worker 문제 해결
✅ 로그인 기능 정상
✅ 관리자 대시보드 정상

→ 실제 사용자 테스트 시작 가능!
```

---

## 💡 추가 팁

### 개발자 도구 단축키:
```
F12 - 개발자 도구 열기
Ctrl + Shift + R - 강제 새로고침
Ctrl + Shift + Delete - 캐시 삭제
Ctrl + Shift + J - Console 직접 열기
Ctrl + Shift + C - 요소 선택 도구
```

### 유용한 Console 명령어:
```javascript
// Service Worker 상태 확인
navigator.serviceWorker.getRegistrations().then(console.log);

// fetch 오버라이드 확인
console.log(window.fetch.toString());

// localStorage 확인
console.log(localStorage);

// API 직접 테스트
fetch('tables/users?limit=1').then(r => r.json()).then(console.log);
```

### Network 탭 필터:
```
tables - API 요청만 보기
method:POST - POST 요청만 보기
status-code:500 - 에러만 보기
larger-than:1k - 큰 응답만 보기
```

---

**작성일:** 2024.11.01  
**예상 소요 시간:**
- 로컬 테스트: 30초
- 온라인 테스트: 5분 (배포 대기 포함)

**다음 단계:** PRODUCTION_QUICK_START.md
