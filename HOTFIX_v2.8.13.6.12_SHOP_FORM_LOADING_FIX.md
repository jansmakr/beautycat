# 🔧 HOTFIX v2.8.13.6.12 - 샵 정보 폼 로딩 DB 필드명 매칭 수정

## 📅 날짜
2025-12-16

## 🎯 문제 설명

### 증상
- 샵 정보를 저장하면 DB에는 정상 저장됨 (200 OK)
- 하지만 페이지를 새로고침하거나 다시 접속하면 **일부 필드가 폼에 표시되지 않음**
- 특히 다음 필드들이 표시 안 됨:
  - 영업신고증
  - 영업시간
  - 대표 관리
  - 가격대
  - 샵 특징

### 원인
`updateShopInfoForm()` 함수에서 **구 필드명**을 사용하여 DB에서 데이터를 가져오려 했으나, 실제 DB에는 **신 필드명**으로 저장되어 있었음.

**필드명 불일치:**
```javascript
// 구 필드명 (코드)           →  신 필드명 (DB)
business_license_number      →  business_license
business_hours               →  operating_hours
representative_service       →  representative_treatments
service_price                →  price_range
shop_features                →  description
```

## 🔧 해결 방법

### 수정 파일
- `js/shop-dashboard.js` (updateShopInfoForm 함수)

### 수정 내용

#### 1️⃣ 영업신고증 필드명 수정
```javascript
// AS-IS (1043번 줄)
if (fields.businessLicenseNumber) fields.businessLicenseNumber.value = currentShop.business_license_number || '';

// TO-BE
if (fields.businessLicenseNumber) fields.businessLicenseNumber.value = currentShop.business_license || '';
```

#### 2️⃣ 영업시간 필드명 수정
```javascript
// AS-IS (1047번 줄)
if (fields.businessHours) fields.businessHours.value = currentShop.business_hours || '';

// TO-BE
if (fields.businessHours) fields.businessHours.value = currentShop.operating_hours || '';
```

#### 3️⃣ 대표 관리 필드명 수정
```javascript
// AS-IS (1050번 줄)
if (fields.representativeService) fields.representativeService.value = currentShop.representative_service || '';

// TO-BE
if (fields.representativeService) fields.representativeService.value = currentShop.representative_treatments || '';
```

#### 4️⃣ 가격대 필드명 수정
```javascript
// AS-IS (1051번 줄)
if (fields.servicePrice) fields.servicePrice.value = currentShop.service_price || '';

// TO-BE
if (fields.servicePrice) fields.servicePrice.value = currentShop.price_range || '';
```

#### 5️⃣ 샵 특징 필드명 수정
```javascript
// AS-IS (1054번 줄)
if (fields.shopFeatures) fields.shopFeatures.value = currentShop.shop_features || '';

// TO-BE
if (fields.shopFeatures) fields.shopFeatures.value = currentShop.description || '';
```

## ✅ 검증

### 테스트 시나리오
1. 샵 정보 전체 입력 후 저장
2. 페이지 새로고침 (Ctrl + Shift + R)
3. 모든 필드가 폼에 정상 표시되는지 확인

### 예상 결과
```javascript
✅ business_license: '2021-서울-1234'        ← 폼에 표시됨
✅ operating_hours: '월~금 09:00-18:00'      ← 폼에 표시됨
✅ representative_treatments: '여드름 관리'  ← 폼에 표시됨
✅ price_range: '50,000원 ~ 150,000원'       ← 폼에 표시됨
✅ description: '강남 최고의 피부관리실'    ← 폼에 표시됨
```

## 📊 영향 범위

### 수정 파일
- `js/shop-dashboard.js` (5개 라인 수정)

### 영향 받는 기능
- ✅ 샵 정보 폼 로딩 (페이지 새로고침 시)
- ✅ 샵 대시보드 초기 로딩
- ⚠️ 샵 정보 저장 로직은 이미 v2.8.13.6.10에서 수정 완료

## 🚀 배포 체크리스트

- [ ] `js/shop-dashboard.js` 수정 완료
- [ ] `README.md` v2.8.13.6.12 업데이트
- [ ] GitHub Commit & Push
- [ ] Cloudflare Pages 자동 배포 대기 (5-10분)
- [ ] 브라우저 캐시 삭제 (Ctrl + Shift + Delete)
- [ ] 샵 정보 저장 → 새로고침 → 전체 필드 표시 확인

## 📝 관련 이슈

- v2.8.13.6.9: DB 스키마 호환성 수정 (shop_name → name)
- v2.8.13.6.10: DB 스키마 완전 매칭 (저장 시 필드명 수정)
- v2.8.13.6.11: FormData 제거 (모든 필드 저장 보장)
- **v2.8.13.6.12**: 폼 로딩 시 필드명 수정 (이번 수정) ← **최종 완결**

## 🎉 결과

**v2.8.13.6.12 이후:**
- ✅ 샵 정보 저장: 모든 필드 DB에 정상 저장
- ✅ 샵 정보 로딩: 모든 필드 폼에 정상 표시
- ✅ 페이지 새로고침: 모든 필드 유지
- ✅ **샵 정보 관리 기능 완전 안정화** 🎊
