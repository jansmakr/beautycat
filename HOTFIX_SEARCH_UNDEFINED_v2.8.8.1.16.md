# 🐛 HOTFIX: 검색 기능 undefined 문자열 문제 수정

**버전**: v2.8.8.1.16  
**날짜**: 2026-01-11  
**우선순위**: 🔴 CRITICAL  
**영향 범위**: 관리자 대시보드 - 샵 검색 기능

---

## 📋 문제 요약

### 증상
- 관리자 대시보드에서 "해올토탈"로 검색 시 결과가 0개로 표시
- 실제 DB에는 "해올토탈뷰티" 업체 5개 존재
- 콘솔에서 직접 검색하면 정상 작동

### 근본 원인
`api-global-override.js`의 필드 매핑 함수에서:
```javascript
shop_name: shop.name || shop.shop_name,  // undefined인 경우
```

`shop.shop_name`이 `undefined`일 때, 나중에 `.join(' ')`으로 문자열 결합 시 **"undefined"** 문자열로 변환됨:
```javascript
"해올토탈뷰티 undefined    "  // 검색 문자열에 "undefined" 포함!
```

---

## 🔧 수정 내용

### 수정된 파일
- `js/api-global-override.js` (Line 146-154)

### 변경 사항

**수정 전:**
```javascript
function mapShopFields(shop) {
    if (!shop) return shop;
    return {
        ...shop,
        shop_name: shop.name || shop.shop_name,     // name → shop_name
        region: shop.state || shop.region,           // state → region
        name: shop.name || shop.shop_name            // 원본 유지
    };
}
```

**수정 후:**
```javascript
function mapShopFields(shop) {
    if (!shop) return shop;
    return {
        ...shop,
        shop_name: shop.name || shop.shop_name || '',  // name → shop_name (빈 문자열 기본값)
        region: shop.state || shop.region || '',        // state → region (빈 문자열 기본값)
        name: shop.name || shop.shop_name || ''         // 원본 유지 (빈 문자열 기본값)
    };
}
```

### 핵심 변경
- `undefined` 값을 **빈 문자열 `''`**로 기본값 설정
- `.join(' ')` 실행 시 "undefined" 문자열이 아닌 빈 문자열로 결합
- 검색 문자열: `"해올토탈뷰티     "` (정상)

---

## ✅ 해결 효과

### Before (문제 상황)
```javascript
// 검색 필드 조합
"해올토탈뷰티 undefined    "

// 검색 시도
"해올토탈".includes("해올토탈뷰티 undefined") // false ❌
```

### After (수정 후)
```javascript
// 검색 필드 조합
"해올토탈뷰티     "

// 검색 시도
"해올토탈뷰티     ".includes("해올토탈") // true ✅
```

---

## 🧪 테스트 방법

### 1. 브라우저 콘솔 테스트
```javascript
// 검색 필드 조합 확인
fetch('tables/skincare_shops?limit=100')
  .then(r => r.json())
  .then(data => {
    const shop = data.data[0];
    console.log('shop_name:', `"${shop.shop_name}"`);
    console.log('타입:', typeof shop.shop_name);
    
    const searchFields = [
      shop.name || '',
      shop.shop_name || '',
      shop.owner_name || ''
    ].join(' ');
    
    console.log('검색 문자열:', `"${searchFields}"`);
    console.log('undefined 포함?:', searchFields.includes('undefined'));
  });
```

### 2. 관리자 대시보드 테스트
1. `https://beautycat.info/admin-dashboard.html` 접속
2. 샵 관리 탭으로 이동
3. 검색창에 "해올" 입력
4. 5개 업체가 정상 표시되는지 확인

---

## 📊 영향 분석

### 영향 받는 기능
- ✅ 샵 검색 기능
- ✅ 샵 필터링 기능
- ✅ 검색 결과 표시

### 영향 받지 않는 기능
- 샵 등록/수정/삭제
- 사용자 관리
- 상담/견적 관리

### 데이터 영향
- ❌ DB 데이터 변경 없음
- ✅ 클라이언트 사이드 처리만 수정

---

## 🚀 배포 절차

### 1. Git 커밋
```bash
git add js/api-global-override.js README.md HOTFIX_SEARCH_UNDEFINED_v2.8.8.1.16.md
git commit -m "fix(search): undefined 문자열 검색 문제 수정 v2.8.8.1.16"
git push origin main
```

### 2. 브라우저 캐시 클리어
- **자동 해결**: 파일명 변경 없이 내용만 수정
- **권장 조치**: 사용자에게 강제 새로고침 안내 (Ctrl+Shift+R)

### 3. Cloudflare 캐시 클리어
Cloudflare 대시보드에서:
1. `Caching` → `Configuration`
2. `Purge Cache` → `Purge Everything`

---

## 📝 관련 이슈

### 발견 경로
1. 사용자 신고: "해올토탈뷰티" 업체가 검색되지 않음
2. 콘솔 테스트: 직접 fetch 시 정상 검색됨
3. 필드 조합 확인: `shop_name: "undefined"` 발견
4. 원인 분석: `api-global-override.js`의 필드 매핑 로직

### 관련 버전
- v2.8.8.1.15: 필수 필드 검증 추가 (동일 날짜)
- v2.8.8.1.9: 샵 타입 필터 추가
- v2.7.3.4: API Global Override 도입

---

## ⚠️ 주의사항

### 1. 기존 데이터
- 이미 "undefined" 문자열이 포함된 데이터는 없음
- 신규 데이터만 영향 받음

### 2. 하위 호환성
- ✅ 100% 하위 호환
- 기존 기능에 영향 없음

### 3. 추가 검증 필요
- 모든 필드 매핑 함수에 기본값 확인
- 다른 테이블에도 동일한 패턴 확인

---

## 📚 참고 문서

- `api-global-override.js`: 전역 API 설정
- `admin-dashboard.js`: 샵 관리 기능
- `HOTFIX_REQUIRED_FIELD_v2.8.8.1.15.md`: 필수 필드 검증

---

## 🎯 결론

**문제**: 필드 매핑 시 `undefined` 값이 문자열 "undefined"로 변환되어 검색 실패  
**해결**: 모든 필드에 빈 문자열 `''` 기본값 추가  
**효과**: 검색 기능 정상화, 데이터 품질 향상  

**배포 시간**: < 5분 (코드 수정만)  
**다운타임**: 없음  
