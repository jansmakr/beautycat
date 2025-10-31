# 🚀 API 배포 및 설정 가이드

> Cloudflare Workers API를 배포하고 프론트엔드와 연결하는 가이드

---

## ⚠️ 현재 상태

현재 프로젝트는 **프론트엔드만 준비된 상태**입니다.

```
✅ 프론트엔드 (HTML/CSS/JS) - 준비 완료
❌ 백엔드 API - 아직 배포되지 않음
```

**백엔드 API를 배포하기 전까지는 다음 기능들이 작동하지 않습니다:**
- 로그인/회원가입
- 상담 신청
- 견적서 작성/관리
- 관리자 대시보드 데이터

---

## 📋 목차

1. [API 배포 전 확인사항](#-api-배포-전-확인사항)
2. [Cloudflare Workers API 배포](#-cloudflare-workers-api-배포)
3. [프론트엔드 API URL 업데이트](#-프론트엔드-api-url-업데이트)
4. [연결 테스트](#-연결-테스트)
5. [트러블슈팅](#-트러블슈팅)

---

## ✅ API 배포 전 확인사항

### 1. Cloudflare 계정 준비

```
1. Cloudflare 계정 생성/로그인
   → https://dash.cloudflare.com/

2. Workers 플랜 확인
   → Free 플랜: 하루 10만 요청 (충분함)
   → Paid 플랜: 무제한
```

### 2. API 파일 확인

프로젝트에 다음 파일이 있는지 확인:
```
✅ cloudflare-workers-v3-full-crud.js (API 코드)
✅ CLOUDFLARE_WORKERS_V3_API_GUIDE.md (상세 가이드)
```

---

## 🚀 Cloudflare Workers API 배포

### 단계 1: Cloudflare Dashboard 접속

```
1. https://dash.cloudflare.com/ 접속
2. 왼쪽 메뉴에서 "Workers & Pages" 클릭
3. "Create Application" 버튼 클릭
4. "Create Worker" 선택
```

### 단계 2: Worker 생성

```
1. Worker 이름 입력: beautycat-api
2. "Deploy" 클릭
3. 생성된 Worker 클릭
```

### 단계 3: 코드 복사/붙여넣기

```
1. "Edit Code" 버튼 클릭
2. 기존 코드 전체 삭제
3. cloudflare-workers-v3-full-crud.js 파일 내용 복사
4. 붙여넣기
5. 우측 상단 "Save and Deploy" 클릭
```

### 단계 4: API URL 확인

배포 완료 후 다음과 같은 URL이 생성됩니다:

```
https://beautycat-api.[YOUR-SUBDOMAIN].workers.dev
```

예시:
```
https://beautycat-api.jansmakr.workers.dev
https://beautycat-api.myname123.workers.dev
```

**이 URL을 복사해두세요!** 📋

---

## 🔧 프론트엔드 API URL 업데이트

배포된 API URL로 프론트엔드 파일들을 업데이트해야 합니다.

### 방법 1: 자동 일괄 변경 (추천)

**VSCode 사용 시:**

```
1. Ctrl+Shift+H (또는 Cmd+Shift+H) - 파일 전체 검색/바꾸기
2. 찾기: https://beautycat-api.jansmakr.workers.dev
3. 바꾸기: https://beautycat-api.[YOUR-SUBDOMAIN].workers.dev
4. "모두 바꾸기" 클릭
```

### 방법 2: 수동 변경

다음 **7개 파일**을 직접 수정:

#### 1. shop-dashboard-v2.html
```javascript
// 줄 143 부근
const API_BASE = 'https://beautycat-api.[YOUR-SUBDOMAIN].workers.dev/api';
```

#### 2. consultation-detail.html
```javascript
// 줄 199 부근
const API_BASE = 'https://beautycat-api.[YOUR-SUBDOMAIN].workers.dev/api';
```

#### 3. quote-management.html
```javascript
// 줄 258 부근
const API_BASE = 'https://beautycat-api.[YOUR-SUBDOMAIN].workers.dev/api';
```

#### 4. customer-dashboard-v2.html
```javascript
// 줄 206 부근
const API_BASE = 'https://beautycat-api.[YOUR-SUBDOMAIN].workers.dev/api';
```

#### 5. consultation-request.html
```javascript
// 줄 304 부근
const API_BASE = 'https://beautycat-api.[YOUR-SUBDOMAIN].workers.dev/api';
```

#### 6. my-quotes.html
```javascript
// 줄 249 부근
const API_BASE = 'https://beautycat-api.[YOUR-SUBDOMAIN].workers.dev/api';
```

#### 7. js/cloudflare-api.js
```javascript
// 줄 10 부근
const CLOUDFLARE_API = {
    baseUrl: 'https://beautycat-api.[YOUR-SUBDOMAIN].workers.dev/api',
    fallbackUrl: 'https://api.beautycat.kr/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};
```

#### 8. index.html (DNS prefetch)
```html
<!-- 줄 208 부근 -->
<link rel="dns-prefetch" href="//beautycat-api.[YOUR-SUBDOMAIN].workers.dev">
```

---

## 🧪 연결 테스트

### 1. API 헬스체크

브라우저에서 다음 URL 접속:
```
https://beautycat-api.[YOUR-SUBDOMAIN].workers.dev/api/health
```

**정상 응답:**
```json
{
  "status": "healthy",
  "message": "BeautyCat API v3 is running",
  "timestamp": 1234567890,
  "version": "3.0.0"
}
```

### 2. 프론트엔드 테스트

```
1. index.html 열기
2. F12 - 개발자 도구 열기
3. Console 탭 확인

정상 로그:
💚 Cloudflare API 헬스체크 성공: {...}
🎉 Cloudflare API 브릿지 준비 완료!

오류 시:
ℹ️ API 서버가 아직 배포되지 않았습니다.
```

### 3. 로그인 테스트

```
1. login-clean.html 페이지 접속
2. 테스트 계정으로 로그인:
   - 이메일: shop@beautycat.kr
   - 비밀번호: shop123
3. 로그인 성공하면 대시보드로 이동
```

**테스트 계정 전체 목록**: `USER_ACCOUNTS_INFO.md` 참고

---

## 🔍 트러블슈팅

### 문제 1: API URL 404 오류

```
❌ GET https://beautycat-api.jansmakr.workers.dev/api/health 404
```

**원인**: API가 배포되지 않았거나, URL이 잘못됨

**해결**:
```
1. Cloudflare Dashboard에서 Worker 배포 확인
2. Worker URL 정확히 확인
3. 프론트엔드 파일 7개 모두 URL 업데이트
4. 브라우저 캐시 삭제 (Ctrl+Shift+R)
```

### 문제 2: CORS 오류

```
❌ Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS
```

**원인**: Cloudflare Workers 코드에 CORS 헤더가 없음

**해결**: `cloudflare-workers-v3-full-crud.js` 파일에 CORS 헤더가 포함되어 있는지 확인
```javascript
// 이미 포함되어 있어야 함
headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    ...
}
```

### 문제 3: 데이터가 저장되지 않음

```
❌ Workers 재시작 시 데이터 손실
```

**원인**: 현재 API는 메모리 기반 (프로토타입용)

**해결**: Cloudflare D1 데이터베이스 연동 필요
```
1. Cloudflare Dashboard → D1
2. Create Database
3. Workers 코드를 D1 연동으로 마이그레이션
   (별도 가이드 필요)
```

### 문제 4: 로그인 안 됨

```
❌ 로그인 버튼 클릭 후 반응 없음
```

**해결**:
```
1. F12 - Console 탭에서 오류 확인
2. Network 탭에서 API 요청 확인
3. API_BASE URL이 올바른지 확인
4. 테스트 계정 정보가 정확한지 확인
```

---

## 📊 배포 체크리스트

### ✅ 백엔드 배포

- [ ] Cloudflare 계정 생성
- [ ] Worker 생성 및 코드 배포
- [ ] API URL 확인 및 복사
- [ ] 헬스체크 URL 접속 테스트

### ✅ 프론트엔드 업데이트

- [ ] 7개 HTML 파일 API_BASE 업데이트
- [ ] js/cloudflare-api.js URL 업데이트
- [ ] index.html DNS prefetch 업데이트
- [ ] GitHub에 변경사항 커밋/푸시

### ✅ 테스트

- [ ] 브라우저 캐시 삭제
- [ ] API 헬스체크 성공 확인
- [ ] 로그인 테스트
- [ ] 상담 신청 테스트
- [ ] 견적서 작성 테스트

---

## 🎯 다음 단계

API 배포 완료 후:

1. ✅ **Cloudflare Pages 배포** (프론트엔드)
   - GitHub 연동
   - 자동 배포 설정

2. ✅ **커스텀 도메인 연결** (선택사항)
   - 웹사이트: beautycat.kr
   - API: api.beautycat.kr

3. ⏳ **Cloudflare D1 연동** (프로덕션용)
   - 영구 데이터 저장
   - 고급 쿼리 기능

4. ⏳ **인증 강화**
   - JWT 토큰
   - 세션 관리

---

## 💡 팁

### VSCode에서 API URL 한 번에 찾기

```
1. Ctrl+Shift+F (전체 검색)
2. 검색어: beautycat-api.jansmakr.workers.dev
3. 모든 파일에서 찾기
4. 하나씩 또는 일괄 변경
```

### Git으로 변경사항 추적

```bash
# API URL 변경 후
git status

# 변경된 파일 확인
git diff

# 커밋
git add .
git commit -m "Update API URLs to production endpoint"
git push origin main
```

---

## 📚 관련 문서

- **CLOUDFLARE_WORKERS_V3_API_GUIDE.md** - 완전한 API 사용 가이드
- **USER_ACCOUNTS_INFO.md** - 테스트 계정 정보
- **README.md** - 프로젝트 전체 가이드

---

## 🆘 도움이 필요하신가요?

- 📧 이메일: support@beautycat.kr (예시)
- 💬 GitHub Issues: 프로젝트 저장소
- 📖 Cloudflare Workers 문서: https://developers.cloudflare.com/workers/

---

**API 배포 후 완전한 플랫폼이 작동합니다!** 🎉

*Last Updated: 2025-10-30*
