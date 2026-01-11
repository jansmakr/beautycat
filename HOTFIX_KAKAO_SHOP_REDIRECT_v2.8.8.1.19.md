# 🐛 HOTFIX: 카카오 로그인 업체 계정 리다이렉트 수정

**버전**: v2.8.8.1.19  
**날짜**: 2026-01-11  
**우선순위**: 🔴 HIGH  
**영향 범위**: 카카오 로그인 - 업체 계정 리다이렉트

---

## 📋 문제 요약

### 증상
- 미료쿠 계정을 `customer` → `shop`으로 변경
- 카카오 로그인 시 **shop-dashboard.html**로 이동해야 함
- 실제로는 **customer-dashboard.html**로 이동함 ❌

### 근본 원인
**파일**: `js/kakao-login.js` (Line 319)

```javascript
// DB에 저장된 user_type
user_type: 'shop'  // ✅ DB 값

// 코드에서 체크
if (userType === 'shop_owner') {  // ❌ 'shop_owner'로 체크!
    window.location.href = '/shop-dashboard.html';
} else {
    window.location.href = '/customer-dashboard.html';  // 여기로 이동
}
```

**문제**: DB에는 `'shop'`으로 저장되는데, 코드는 `'shop_owner'`를 체크함!

---

## 🔧 수정 내용

### 수정된 파일
- `js/kakao-login.js` (Line 318-323)

### Before
```javascript
// 기본 대시보드 이동 (사용자 타입에 따라 분기)
if (userType === 'shop_owner') {
    window.location.href = '/shop-dashboard.html';
} else {
    window.location.href = '/customer-dashboard.html';
}
```

### After
```javascript
// 기본 대시보드 이동 (사용자 타입에 따라 분기)
if (userType === 'shop' || userType === 'shop_owner') {
    window.location.href = '/shop-dashboard.html';
} else if (userType === 'admin') {
    window.location.href = '/admin-dashboard.html';
} else {
    window.location.href = '/customer-dashboard.html';
}
```

### 핵심 변경
- ✅ `'shop'` 타입 추가 (표준 DB 값)
- ✅ `'shop_owner'` 타입 유지 (하위 호환성)
- ✅ `'admin'` 타입 추가 (완전성)

---

## ✅ 해결 효과

### Before (문제 상황)
```
미료쿠 계정:
- user_type: 'shop'
- 카카오 로그인 → customer-dashboard.html ❌
```

### After (수정 후)
```
미료쿠 계정:
- user_type: 'shop'
- 카카오 로그인 → shop-dashboard.html ✅
```

---

## 🧪 테스트 시나리오

### 1️⃣ 미료쿠 계정 변경
1. **관리자 대시보드** 접속
2. **사용자 관리** → 미료쿠 검색
3. **편집** 버튼 클릭
4. **사용자 타입**: `customer` → `shop` 변경
5. **저장** 버튼 클릭
6. ✅ 업체 레코드 자동 생성

### 2️⃣ 카카오 로그인 테스트
1. **로그아웃**
2. **카카오 로그인** 버튼 클릭
3. 미료쿠 계정으로 로그인
4. ✅ **shop-dashboard.html**로 자동 이동!

### 3️⃣ 샵 관리 확인
1. **관리자 대시보드** 접속
2. **샵 입점 관리** 섹션 이동
3. **샵 타입**: `신규등록` 선택
4. **검색**: `미료쿠` 입력
5. ✅ 미료쿠 업체 표시됨!

---

## 📊 user_type 값 정리

| user_type | 설명 | 대시보드 |
|-----------|------|----------|
| `customer` | 일반 고객 | customer-dashboard.html |
| `shop` | 업체 (표준) | shop-dashboard.html ✅ |
| `shop_owner` | 업체 (레거시) | shop-dashboard.html ✅ |
| `admin` | 관리자 | admin-dashboard.html ✅ |

---

## 🔍 관련 파일 확인

### 다른 파일들도 확인 필요
```bash
# 'shop_owner' 사용하는 파일 검색
grep -r "shop_owner" js/
```

**확인된 파일**:
- ✅ `js/kakao-login.js` - 수정 완료
- ⚠️ `js/auth.js` - 확인 필요
- ⚠️ `js/naver-login.js` - 확인 필요

---

## 🚀 배포 명령어

```bash
cd /d D:\beautycat

git add js/kakao-login.js
git add HOTFIX_KAKAO_SHOP_REDIRECT_v2.8.8.1.19.md
git add README.md

git commit -m "fix: 카카오 로그인 업체 계정 리다이렉트 수정 v2.8.8.1.19"

git push origin main
```

---

## 🔧 배포 후 테스트

### 1️⃣ Cloudflare 캐시 Purge
- Cloudflare Dashboard → Caching → Purge Everything

### 2️⃣ 브라우저 강제 새로고침
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 3️⃣ 테스트
1. 로그아웃
2. 카카오 로그인 (미료쿠 계정)
3. ✅ shop-dashboard.html로 이동 확인

---

## ⚠️ 주의사항

### 1️⃣ 세션 정리
카카오 로그인 테스트 전:
```javascript
// 브라우저 콘솔에서 실행
localStorage.clear();
sessionStorage.clear();
```

### 2️⃣ user_type 표준화
**권장**: 모든 코드에서 `'shop'` 사용
- DB: `user_type: 'shop'`
- 코드: `userType === 'shop'`
- 레거시: `'shop_owner'`는 하위 호환성만

### 3️⃣ 다른 로그인 방식 확인
- 일반 로그인 (auth.js)
- 네이버 로그인 (naver-login.js)
- 모두 동일하게 수정 필요

---

## 📝 관련 이슈

### 발견 경로
1. 미료쿠 계정을 customer → shop으로 변경
2. 카카오 로그인 시 customer-dashboard로 이동
3. user_type 체크 로직 확인 → 'shop_owner' 발견

### 영향 받는 기능
- ✅ 카카오 로그인 리다이렉트
- ⚠️ 일반 로그인 리다이렉트 (확인 필요)
- ⚠️ 네이버 로그인 리다이렉트 (확인 필요)

---

## 🎯 결론

**문제**: DB `'shop'` vs 코드 `'shop_owner'` 불일치  
**해결**: 두 값 모두 체크하도록 수정  
**효과**: 업체 계정이 shop-dashboard로 정상 이동  

**배포 시간**: < 5분  
**다운타임**: 없음  

---

**작성자**: AI Agent  
**배포 상태**: 🟡 배포 대기 중
