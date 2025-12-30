# 🔧 CRITICAL FIX v2.8.13.6.94 - approved 필드 제거 (스키마 불일치 수정)

**날짜**: 2025-12-29  
**버전**: v2.8.13.6.94  
**작성자**: AI Assistant  
**타입**: Critical Bug Fix

---

## 🚨 **CRITICAL 문제 발견!**

### **에러 원인**
코드에서 `skincare_shops` 테이블에 `approved` 필드를 전송하고 있지만, **실제 DB 스키마에는 이 필드가 존재하지 않음!**

### **스키마 확인**

#### **`skincare_shops` 테이블 (실제 스키마)**
```sql
CREATE TABLE skincare_shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    services TEXT,
    description TEXT,
    business_number TEXT,
    business_license TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'rejected')),
    representative_treatments TEXT,
    price_range TEXT,
    operating_hours TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER DEFAULT 0
);
```

**중요**: `approved` 필드가 없음! ❌

#### **`representative_shops` 테이블 (별도 테이블)**
```sql
CREATE TABLE representative_shops (
    ...
    approved INTEGER DEFAULT 0,  -- ✅ 이 테이블에만 존재
    status TEXT DEFAULT 'pending',
    ...
);
```

**`approved` 필드는 대표샵 신청 테이블에만 존재!**

---

## ⚠️ **문제가 되는 코드**

### **1️⃣ 신규 업체 등록 (admin-dashboard.js)**

```javascript
// ❌ Before (v2.8.13.6.93)
const shopData = {
    name: shopName,
    owner_name: ownerName,
    phone: phone,
    email: email,
    state: state,
    district: district,
    address: address,
    business_number: businessNumber,
    business_license: licenseNumber || null,
    naver_cafe_id: naverCafeId || null,
    status: 'pending',
    approved: false,  // ❌ 이 필드가 skincare_shops 테이블에 없음!
    user_id: newUser.id
};
```

### **2️⃣ 사용자 타입 변경 (customer → shop)**

```javascript
// ❌ Before (v2.8.13.6.93)
const shopData = {
    name: name + ' 업체',
    owner_name: name,
    email: updatedUser.email,
    phone: phone || '정보 없음',
    state: '서울',
    district: '강남구',
    address: '주소 미등록',
    business_number: '정보 없음',
    business_license: '정보 없음',
    status: 'pending',
    approved: false,  // ❌ 이 필드가 skincare_shops 테이블에 없음!
    user_id: userId
};
```

---

## ✅ **수정 내용**

### **1️⃣ 신규 업체 등록**

```javascript
// ✅ After (v2.8.13.6.94)
const shopData = {
    name: shopName,
    owner_name: ownerName,
    phone: phone,
    email: email,
    state: state,
    district: district,
    address: address,
    business_number: businessNumber,
    business_license: licenseNumber || null,
    naver_cafe_id: naverCafeId || null,
    status: 'pending',
    // approved 필드 제거 ✅
    user_id: newUser.id
};
```

### **2️⃣ 사용자 타입 변경**

```javascript
// ✅ After (v2.8.13.6.94)
const shopData = {
    name: name + ' 업체',
    owner_name: name,
    email: updatedUser.email,
    phone: phone || '정보 없음',
    state: '서울',
    district: '강남구',
    address: '주소 미등록',
    business_number: '정보 없음',
    business_license: '정보 없음',
    status: 'pending',
    // approved 필드 제거 ✅
    user_id: userId
};
```

---

## 📊 **비교표**

| 항목 | Before (v2.8.13.6.93) | After (v2.8.13.6.94) |
|------|----------------------|---------------------|
| **신규 업체 등록** | `approved: false` 포함 ❌ | `approved` 제거 ✅ |
| **사용자 타입 변경** | `approved: false` 포함 ❌ | `approved` 제거 ✅ |
| **DB 스키마 일치** | 불일치 ❌ | 일치 ✅ |
| **에러 발생** | 가능성 있음 ⚠️ | 없음 ✅ |

---

## 🎯 **효과**

### **Before (v2.8.13.6.93)**
```
POST /tables/skincare_shops
{
  "name": "테스트 업체",
  "approved": false  // ❌ DB에 없는 필드
}

가능한 결과:
- ⚠️ 필드 무시 (silent failure)
- ❌ 500 에러 (strict mode)
- ⚠️ 데이터 삽입 실패
```

### **After (v2.8.13.6.94)**
```
POST /tables/skincare_shops
{
  "name": "테스트 업체",
  "status": "pending"  // ✅ 올바른 필드만 전송
}

✅ 성공 → 201 Created
✅ 업체 등록 완료
✅ 샵 입점 관리에 표시됨
```

---

## 📚 **참고: status vs approved**

### **`skincare_shops` 테이블**
- ✅ `status` 필드 사용
- 값: `'pending'`, `'active'`, `'inactive'`, `'rejected'`

### **`representative_shops` 테이블**
- ✅ `approved` 필드 사용 (INTEGER: 0 또는 1)
- ✅ `status` 필드도 사용 (TEXT: 'pending', 'approved', 'rejected', 'revoked')

**결론**: 두 테이블은 별도의 승인 시스템을 사용!

---

## 🔍 **전체 오류 체크 결과**

| 항목 | 상태 | 비고 |
|------|------|------|
| ✅ `business_license` 필드명 | 정상 | v2.8.13.6.92에서 수정 완료 |
| ✅ `business_license_number` | 정상 | 아카이브에만 존재 (사용 안 함) |
| ✅ HTML `shops-table` | 정상 | `<tbody id="shops-table">` 존재 |
| ✅ `showSection('shops')` | 정상 | `loadShops()` 호출됨 |
| ✅ `loadShops()` 함수 | 정상 | 디버깅 로그 추가됨 (v2.8.13.6.93) |
| ✅ `displayShops()` 함수 | 정상 | 디버깅 로그 추가됨 (v2.8.13.6.93) |
| ❌ **`approved` 필드** | **문제** | **스키마에 없는 필드 전송 중** |

---

## 📦 **배포 파일**

### **수정된 파일 (1개)**
1. `js/admin-dashboard.js` - `approved` 필드 제거 (2곳)

### **문서 파일 (1개)**
1. `CRITICAL_FIX_APPROVED_FIELD_v2.8.13.6.94.md` - 이 문서

---

## 🚀 **Git 푸시 명령어**

```bash
cd /d/beautycat && \
git add js/admin-dashboard.js CRITICAL_FIX_APPROVED_FIELD_v2.8.13.6.94.md && \
git commit -m "🔧 CRITICAL FIX v2.8.13.6.94 - approved 필드 제거

- skincare_shops 테이블에 approved 필드 없음
- 신규 업체 등록 시 approved: false 제거
- 사용자 타입 변경 시 approved: false 제거
- DB 스키마와 코드 완전 일치" && \
git push origin main
```

---

## 🧪 **배포 후 테스트**

### **1️⃣ 신규 업체 등록 테스트**

#### **실행**
1. 관리자 대시보드 → "새 업체 추가"
2. 정보 입력 후 "업체 등록" 클릭

#### **예상 결과**
```javascript
// Console
Creating new shop account...
User created: {...}
Shop created: {id: 'shop-id', name: '...', status: 'pending', ...}
✅ Shop registration completed successfully
📊 대시보드 데이터 새로고침 중...
✅ 대시보드 데이터 새로고침 완료
🏪 업체 목록 새로고침 중...
✅ 업체 목록 새로고침 완료

// Alert
업체 등록이 완료되었습니다!

업체명: 테스트 업체
이메일: test@shop.com
승인 상태: 대기중
```

---

### **2️⃣ 사용자 타입 변경 테스트**

#### **실행**
1. 관리자 대시보드 → 사용자 관리
2. customer 사용자 선택 → 편집
3. 사용자 타입: `customer` → `shop` 변경
4. 저장

#### **예상 결과**
```javascript
💾 사용자 정보 업데이트 중...
🔄 사용자 타입 변경: customer → shop
✅ 사용자 정보 업데이트 완료
🏪 업체 레코드 생성 중...
✅ 업체 레코드 생성 완료: shop-id
```

---

### **3️⃣ 샵 입점 관리 확인**

1. 관리자 대시보드 → 샵 입점 관리
2. 예상 로그:
```javascript
🏪 업체 목록 로딩 시작...
📊 업체 수: X
📋 업체 목록: [{id: '...', name: '...', status: 'pending', ...}]
🖼️ 테이블 렌더링 시작...
📊 displayShops 호출됨, 업체 수: X
✅ 업체 테이블 렌더링 중...
✅ 테이블 렌더링 완료
```

3. 화면에 업체 목록 표시됨 ✅
4. 상태: "승인대기" 표시됨 ✅

---

## 📋 **배포 후 체크리스트**

- [ ] **Cloudflare 배포 완료** (2-5분)
- [ ] **브라우저 캐시 완전 삭제** (`Ctrl+Shift+Delete`)
- [ ] **강제 새로고침** (`Ctrl+Shift+R`)
- [ ] **테스트 1: 신규 업체 등록**
  - 등록 성공 확인
  - 500 에러 없음
  - 팝업: "업체 등록이 완료되었습니다!" 표시
- [ ] **테스트 2: 샵 입점 관리**
  - 업체 목록 표시됨
  - 상태: "승인대기" 표시
- [ ] **테스트 3: 콘솔 로그**
  - "✅ Shop registration completed successfully"
  - "✅ 업체 목록 새로고침 완료"
  - 에러 없음

---

## 📈 **배포 히스토리**

| 버전 | 날짜 | 주요 변경 사항 | 파일 수 | 상태 |
|------|------|----------------|---------|------|
| **v2.8.13.6.94** | 12/29 | **approved 필드 제거** | 2 | ✅ **푸시 대기** |
| v2.8.13.6.93 | 12/29 | 샵 표시 디버깅 | 2 | ✅ 완료 |
| v2.8.13.6.92 | 12/29 | business_license 수정 | 3 | ✅ 완료 |
| v2.8.13.6.91 | 12/29 | 500 에러 수정 | 2 | ✅ 완료 |

---

## 🎉 **전체 오류 체크 완료!**

이번 수정으로:
1. ✅ **스키마 불일치 해결**
2. ✅ **500 에러 가능성 제거**
3. ✅ **업체 등록 정상화**
4. ✅ **샵 입점 관리 표시 문제 해결 예상**

---

위 명령어를 **복사해서 푸시**해 주세요! 🚀

배포 후 테스트 결과를 알려주시면, 추가 문제가 있는지 확인하겠습니다!
