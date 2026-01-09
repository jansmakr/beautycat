# 🔧 HOTFIX: shop_name 컬럼 오류 수정 (v2.8.8.1.6)

## 📅 날짜
2026-01-09 04:30 KST

## 🔴 문제
```
POST https://beautycat.kr/tables/skincare_shops 500 (Internal Server Error)
❌ 샵 등록 실패: {"error":"Database operation failed","message":"D1_ERROR: table skincare_shops has no column named shop_name: SQLITE_ERROR"}
```

**원인**: `skincare_shops` 테이블에 `shop_name` 컬럼이 존재하지 않음

## ✅ 해결
**파일**: `admin-dashboard.html`
**위치**: Line 1857-1872 (`handleNewShopSubmit` 함수)

### 수정 내용
```javascript
// ❌ Before (Line 1859 제거)
body: JSON.stringify({
    name: shopName,
    shop_name: shopName,  // ❌ 존재하지 않는 컬럼!
    owner_name: ownerName,
    ...
})

// ✅ After
body: JSON.stringify({
    name: shopName,  // ✅ 실제 DB 컬럼명
    owner_name: ownerName,
    state: state,
    district: district,
    address: address,
    phone: phone,
    email: email,
    business_number: businessNumber,
    license_number: licenseNumber,
    naver_cafe_id: naverId,
    status: 'active',
    is_active: true,
    verified: true
})
```

## 📊 skincare_shops 테이블 스키마
```
✅ 실제 컬럼:
- name (업체명)
- owner_name (대표자명)
- state (시/도)
- district (구/군)
- address (상세 주소)
- phone (전화번호)
- email (이메일)
- business_number (사업자등록번호)
- license_number (영업신고번호)
- naver_cafe_id (네이버 카페 아이디)
- status (상태)
- is_active (활성 여부)
- verified (인증 여부)

❌ 존재하지 않는 컬럼:
- shop_name (제거됨)
```

## 🎯 영향
- 신규 샵 등록 시 500 에러 해결
- 이메일 중복 체크 + 샵 등록 정상 작동

## 🚀 배포
```bash
cd /d D:\beautycat && git add admin-dashboard.html HOTFIX_SHOP_NAME_COLUMN_v2.8.8.1.6.md && git commit -m "fix: shop_name 컬럼 오류 수정 (v2.8.8.1.6)" && git push origin main
```

## ✅ 테스트
1. Cloudflare 캐시 삭제
2. Admin Dashboard → 업체 관리 → 신규 샵 등록
3. 미료쿠 정보 입력 (taerang0428@naver.com)
4. 등록하기 → 성공! ✅
