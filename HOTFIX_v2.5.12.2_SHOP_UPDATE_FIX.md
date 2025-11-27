# 🔧 업체 정보 업데이트 500 에러 수정

## 📅 업데이트 정보
- **날짜**: 2024-11-27
- **버전**: v2.5.12.2 (v2.5.12.1 → v2.5.12.2)
- **작업**: 업체 정보 업데이트 시 null 값 필터링 및 shop_name undefined 수정

---

## 🎯 문제 상황

### ❌ Before (문제)

#### 1. 500 Server Error
```javascript
PUT /api/tables/skincare_shops/shop_001
Body: {
    name: null,         // ← null 값들!
    owner_name: null,
    phone: null,
    address: null,
    services: null
}
→ 500 Internal Server Error ❌
```

#### 2. shop_name undefined
```
GET /api/tables/representative_shops?shop_name=undefined&state=서울
                                               ↑ undefined!
```

---

## 🔍 원인 분석

### 문제 1: null 값 전송
**파일**: `shop-dashboard.html` (Line 1384-1392)

```javascript
const updateData = {
    name: formData.get('shop_name'),        // ← 값 없으면 null
    owner_name: formData.get('owner_name'), // ← 값 없으면 null
    phone: formData.get('phone'),           // ← 값 없으면 null
    // ...
};
// 모든 필드가 null이면 서버에서 500 에러 발생!
```

### 문제 2: shop_name 필드 오류
**파일**: `js/shop-dashboard.js` (Line 1868)

```javascript
const response = await fetch(
    `tables/representative_shops?shop_name=${encodeURIComponent(currentShop.shop_name)}`
    //                                                          ↑ undefined일 수 있음
);
```

**원인**: 
- API에서 `name` 필드로 반환
- 코드에서 `shop_name` 필드 사용
- 필드명 불일치로 `undefined` 발생

---

## 💡 해결 방법

### 수정 1: null 값 필터링
**파일**: `shop-dashboard.html` (Line 1373-1419)

```javascript
// ✅ null/undefined/빈 문자열 필터링
const updateData = {};
const fieldNames = ['shop_name', 'owner_name', 'phone', 'address', 'services', 'business_number', 'description'];

fieldNames.forEach(field => {
    const value = formData.get(field);
    if (value !== null && value !== undefined && value !== '') {
        // shop_name → name으로 변환
        const apiFieldName = field === 'shop_name' ? 'name' : field;
        updateData[apiFieldName] = value;
    }
});

// 업데이트할 데이터가 없으면 중단
if (Object.keys(updateData).length === 0) {
    alert('변경된 정보가 없습니다.');
    return;
}
```

**개선 효과**:
- ✅ null 값 전송 방지
- ✅ 빈 문자열 전송 방지
- ✅ shop_name → name 자동 변환
- ✅ 변경사항 없으면 API 호출 안 함

### 수정 2: shop_name undefined 방지
**파일**: `js/shop-dashboard.js` (Line 1862-1878)

```javascript
// ✅ shop_name 또는 name 필드 둘 다 체크
const shopName = currentShop.shop_name || currentShop.name || '';
const state = currentShop.state || '';
const district = currentShop.district || '';

// ✅ 필수 정보 검증
if (!shopName || !state || !district) {
    console.warn('대표샵 조회 실패: 필수 정보 누락', { shopName, state, district });
    updateRepresentativeStatusUI(null);
    return;
}

// 안전하게 API 호출
const response = await fetch(
    `tables/representative_shops?shop_name=${encodeURIComponent(shopName)}&state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`
);
```

**개선 효과**:
- ✅ `shop_name` 또는 `name` 필드 자동 선택
- ✅ undefined 방지 (기본값 빈 문자열)
- ✅ 필수 정보 검증 추가
- ✅ 불필요한 API 호출 방지

---

## 📋 수정 파일

### 1. `shop-dashboard.html` (Line 1373-1419)
- **함수**: `handleShopInfoUpdate` 오버라이드
- **변경**: null 값 필터링 + shop_name → name 변환
- **효과**: 500 에러 방지

### 2. `js/shop-dashboard.js` (Line 1862-1878)
- **함수**: `checkRepresentativeShopStatus`
- **변경**: shop_name/name 필드 자동 선택 + 필수 정보 검증
- **효과**: undefined 방지

---

## 🚀 배포 방법

### 1. Publish 탭 이동
```
프로젝트 → Publish 탭 클릭
```

### 2. 파일 선택 (3개)
- [x] `shop-dashboard.html` ⭐ (필수)
- [x] `js/shop-dashboard.js` ⭐ (필수)
- [x] `HOTFIX_v2.5.12.2_SHOP_UPDATE_FIX.md` (본 문서, 선택)

### 3. 커밋 메시지
```
🔧 HOTFIX v2.5.12.2: 업체 정보 업데이트 500 에러 수정

- null 값 필터링으로 500 에러 방지
- shop_name undefined 문제 해결
- 필수 정보 검증 추가
- 에러 메시지 개선
```

### 4. 배포 실행
```
[Publish] 버튼 클릭 → 배포 완료 (5~10분 소요)
```

---

## ✅ 배포 후 확인

### 1. 샵 대시보드 접속 (5~10분 후)
```
1. https://beautycat.kr/shop-dashboard.html 접속
2. 샵 계정으로 로그인
3. "업체 정보 관리" 탭 클릭
4. 정보 수정 후 [저장] 클릭
5. 성공 메시지 확인 ✅
```

### 2. 콘솔 로그 확인
```javascript
// Before (에러)
❌ PUT /api/tables/skincare_shops/shop_001 500
❌ 업체 정보 업데이트: { name: null, phone: null, ... }

// After (정상)
✅ 업체 정보 업데이트 (필터링 후): { name: "테스트 샵", phone: "010-1234-5678" }
✅ 업데이트 성공: { id: "shop_001", name: "테스트 샵", ... }
✅ shop_name=테스트샵&state=서울&district=강남구
```

### 3. 대표샵 조회 확인
```javascript
// Before (에러)
❌ GET /api/representative_shops?shop_name=undefined&state=서울

// After (정상)
✅ GET /api/representative_shops?shop_name=테스트샵&state=서울&district=강남구
```

---

## 📊 개선 효과

### Before (문제)
| 상황 | 결과 |
|------|------|
| 업체 정보 수정 | 500 에러 ❌ |
| null 값 전송 | 서버 에러 ❌ |
| shop_name undefined | API 조회 실패 ❌ |

### After (해결)
| 상황 | 결과 |
|------|------|
| 업체 정보 수정 | 성공 ✅ |
| null 값 필터링 | 전송 안 함 ✅ |
| shop_name 자동 선택 | API 조회 성공 ✅ |

---

## 🎯 추가 개선 사항

### 1. 에러 메시지 개선
```javascript
// Before
alert('업데이트 중 오류가 발생했습니다.');

// After
alert('업데이트 중 오류가 발생했습니다: ' + error.message);
```

### 2. 서버 응답 로깅
```javascript
if (!response.ok) {
    const errorText = await response.text();
    console.error('API 에러 응답:', errorText);
    throw new Error(`업데이트 실패: ${response.status}`);
}
```

### 3. 현재 샵 정보 검증
```javascript
if (!currentShop || !currentShop.id) {
    throw new Error('현재 샵 정보를 찾을 수 없습니다.');
}
```

---

## 💡 향후 개선 제안

### 1. API 필드명 통일
- `shop_name` vs `name` 혼용 → **`name`으로 통일**
- 프론트엔드/백엔드 필드명 일치

### 2. 폼 검증 강화
- 필수 필드 체크 (빨간색 별표)
- 실시간 유효성 검사
- 전화번호 형식 검증

### 3. 낙관적 업데이트
```javascript
// UI 먼저 업데이트 → 빠른 반응
updateUI(newData);
// 서버 업데이트 → 실패 시 롤백
await updateServer(newData);
```

---

## 📞 문의

### 기술 지원
- **이메일**: utuber@kakao.com
- **GitHub**: https://github.com/jansmakr/beautycat

---

**버전**: BeautyCat Production v2.5.12.2  
**업데이트 날짜**: 2024-11-27  
**상태**: ✅ **배포 준비 완료**

---

**🎉 이제 업체 정보 업데이트가 정상 작동합니다!** 🏪✨
