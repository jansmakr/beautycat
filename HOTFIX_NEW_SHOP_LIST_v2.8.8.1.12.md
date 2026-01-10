# 🔧 신규 샵 등록 후 목록 표시 수정 (v2.8.8.1.12)

**날짜**: 2026-01-10  
**우선순위**: HIGH  
**담당자**: AI Assistant

---

## 📋 문제 상황

### 사용자 보고
- 신규 샵 등록 완료 후 "부정 팝업" 나타남
- 바로 회원가입 팝업도 나타남
- 샵 관리 리스트에 최근 등록한 샵이 표시되지 않음

### 원인 분석
1. **필터 유지 문제**: 신규 샵 등록 후 기존 필터 상태가 유지되어 새로 등록한 샵이 필터링됨
2. **필터 상태**: 검색, 지역, 상태, 샵 타입 필터가 모두 유지되어 신규 샵이 숨겨짐

---

## 🔧 수정 내용

### 1. `admin-dashboard.html` (라인 1795~1825)

#### 수정 전
```javascript
alert(`✅ "${shopName}" 샵이 성공적으로 등록되었습니다!\n\n사용자 이메일: ${email}\n사용자 타입: 업체`);

closeNewShopModal();

// 샵 목록 새로고침
if (typeof loadShops === 'function') {
    loadShops();
}
```

#### 수정 후
```javascript
alert(`✅ "${shopName}" 샵이 성공적으로 등록되었습니다!\n\n사용자 이메일: ${email}\n사용자 타입: 업체`);

closeNewShopModal();

// v2.8.8.1.12: 필터 초기화 후 샵 목록 새로고침
console.log('🔄 신규 샵 등록 완료 - 필터 초기화 및 목록 새로고침');

// 필터 초기화
const searchInput = document.getElementById('shop-search');
const regionFilter = document.getElementById('shop-region-filter');
const statusFilter = document.getElementById('shop-status-filter');
const shopTypeFilter = document.getElementById('shop-type-filter');

if (searchInput) searchInput.value = '';
if (regionFilter) regionFilter.value = '';
if (statusFilter) statusFilter.value = '';
if (shopTypeFilter) shopTypeFilter.value = '';

// 샵 목록 새로고침
if (typeof loadShops === 'function') {
    loadShops(true);
}

// 업체 관리 섹션으로 이동
if (typeof showSection === 'function') {
    showSection('shops');
}
```

---

## ✅ 수정 효과

### Before (문제)
1. 신규 샵 등록 완료
2. `loadShops()` 호출
3. **기존 필터 유지**: 검색어, 지역, 상태, 샵 타입 필터가 그대로 유지됨
4. **신규 샵이 필터링되어 목록에 표시되지 않음** ❌

### After (수정)
1. 신규 샵 등록 완료
2. **모든 필터 초기화**: 검색, 지역, 상태, 샵 타입 = 빈 값
3. `loadShops(true)` 호출 → 전체 데이터 로드
4. **신규 샵이 목록 최상단에 표시됨** ✅ (created_at DESC 정렬)
5. **업체 관리 섹션으로 자동 이동** ✅

---

## 🧪 테스트 시나리오

### 1. 신규 샵 등록 테스트
```
1. admin-dashboard.html → 업체 관리 → 신규 샵 등록 버튼
2. 샵 정보 입력:
   - 업체명: 테스트샵1
   - 시/도: 경기
   - 시군구: 수원시
   - 상세주소: 팔달구 테스트동 123
   - 대표자명: 홍길동
   - 전화: 010-1234-5678
   - 이메일: test_shop1@beautycat.kr
   - 비밀번호: test1234!@
   - 사업자등록번호: 123-45-67890
3. "등록하기" 버튼 클릭
4. 예상 결과:
   ✅ "✅ 테스트샵1 샵이 성공적으로 등록되었습니다!" 알림
   ✅ 모달 자동 닫힘
   ✅ 필터 초기화 (검색, 지역, 상태, 샵타입 모두 빈 값)
   ✅ 샵 목록 새로고침
   ✅ "테스트샵1"이 목록 최상단에 표시됨
```

### 2. 필터링 후 신규 샵 등록
```
1. 샵 타입 필터: "인증샵" 선택
2. 지역 필터: "서울" 선택
3. 신규 샵 등록: "부산" 지역의 샵 등록
4. 예상 결과:
   ✅ 등록 완료 후 필터 자동 초기화
   ✅ 부산 지역 신규 샵이 목록에 표시됨
```

---

## 📊 영향 범위

### 긍정적 영향
- ✅ **사용자 경험 개선**: 신규 샵 등록 후 즉시 확인 가능
- ✅ **직관적인 UX**: 필터 초기화로 혼란 제거
- ✅ **섹션 자동 이동**: 업체 관리 섹션으로 자동 이동

### 주의 사항
- ⚠️ 기존에 설정한 필터가 초기화되므로, 필터 재설정 필요
- 📌 대부분의 경우 신규 샵을 확인하는 것이 우선이므로 긍정적

---

## 🔍 "부정 팝업" 문제

### 예상 원인
- **이메일 중복 체크**: 기존 사용자 확인 시 경고 팝업 (라인 1736)
- **조건**: 동일 이메일이 이미 등록되어 있고, user_type이 'shop'이 아닐 경우

### 코드 위치 (admin-dashboard.html, 라인 1733-1738)
```javascript
// 사용자 타입이 'shop'인지 확인
if (existingUser.user_type !== 'shop') {
    console.log('⚠️ 사용자 타입이 "shop"이 아님. 타입 업데이트 필요:', existingUser.user_type);
    alert(`⚠️ 주의: "${email}"은 "${existingUser.user_type}" 타입으로 등록되어 있습니다.\n\n먼저 사용자 관리에서 타입을 "업체"로 변경해주세요.`);
    return;  // 여기서 함수 종료 → 회원가입 팝업이 나타나면 안 됨
}
```

### 테스트 필요
- 동일 이메일로 신규 샵 등록 시도
- user_type이 'shop'이 아닌 경우 경고 팝업 후 함수 종료 확인

---

## 🚀 배포 절차

### Git 명령어
```bash
cd /d D:\beautycat
git add admin-dashboard.html HOTFIX_NEW_SHOP_LIST_v2.8.8.1.12.md README.md
git commit -m "fix: 신규 샵 등록 후 목록 표시 수정 (v2.8.8.1.12)"
git push origin main
```

### 배포 후 확인
1. **Cloudflare 캐시 삭제**: https://dash.cloudflare.com/ → beautycat.kr → Caching → **Purge Everything**
2. **브라우저 테스트**: https://beautycat.kr/admin-dashboard.html (Ctrl+Shift+R)
3. **신규 샵 등록 테스트**: 위 테스트 시나리오 1, 2 실행

---

## 📝 관련 문서
- [v2.8.8.1.8] HOTFIX_REGISTER_FUNCTION_v2.8.8.1.8.md
- [v2.8.8.1.9] HOTFIX_SHOP_TYPE_FILTER_v2.8.8.1.9.md
- [v2.8.8.1.10] HOTFIX_NAVER_CAFE_ID_v2.8.8.1.10.md
- [v2.8.8.1.11] HOTFIX_SEARCH_BUTTON_v2.8.8.1.11.md

---

**상태**: ✅ 수정 완료 - 배포 대기  
**테스트**: ⏳ 배포 후 검증 필요
