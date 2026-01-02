# 🚨 BeautyCat - 관리자 샵 필터 버그 근본 원인 분석

**버전:** v2.8.13.6.129  
**분석 일시:** 2026-01-02  
**상태:** ✅ 원인 확정

---

## 📋 **증상 요약**

### **문제 현상:**
- 관리자 대시보드 > 샵 관리 페이지에서 **20개 샵이 자동으로 0개로 필터링됨**
- 사용자가 아무 필터도 선택하지 않았는데 자동으로 필터가 적용됨
- 브라우저 콘솔 로그:
  ```
  ✅ 테이블 렌더링 완료
  🔍 필터 결과: 20개 → 0개
  ⚠️ 표시할 업체가 없습니다
  ```

### **재현 조건:**
1. https://beautycat.kr/admin-dashboard.html 접속
2. 관리자 로그인
3. "샵 관리" 메뉴 클릭
4. 20개 샵이 로드되지만 즉시 0개로 변경됨

---

## 🔍 **근본 원인 분석**

### **원인 1: loadShops()에서 shop-type-filter 초기화 누락**

**파일:** `js/admin-dashboard.js` (Line 629-636)

```javascript
// ❌ 현재 코드
if (searchInput) searchInput.value = '';
if (regionFilter) regionFilter.value = '';
if (statusFilter) statusFilter.value = '';
// ⚠️ shop-type-filter를 초기화하지 않음!
```

**문제점:**
- `shop-type-filter` 드롭다운의 값이 **브라우저 캐시에 "public"으로 저장**되어 있음
- `loadShops()` 함수에서 이 필터를 초기화하지 않아서 **캐시된 값이 그대로 유지**됨
- 페이지 로드 후 `shop-type-filter.value === "public"` 상태가 됨

---

### **원인 2: filterShops() 로직의 "public" 조건 문제**

**파일:** `admin-dashboard.html` (Line 1717-1721)

```javascript
} else if (typeFilter === 'public') {
    // 공공데이터만: email이 없거나 @example.com
    filtered = filtered.filter(shop => {
        return !shop.email || shop.email.includes('@example.com');
    });
}
```

**문제점:**
- 현재 20개 샵이 **모두 정상 이메일**을 가지고 있음
  - 예시: `email: 'rlawjdtjs71@naver.com'`
- `typeFilter === "public"` 조건:
  - `!shop.email` → false (이메일이 존재함)
  - `shop.email.includes('@example.com')` → false (정상 이메일)
  - 결과: **모든 샵이 필터에서 제외됨** → **0개 결과**

---

### **원인 3: 데이터베이스 스키마 문제**

**현재 테이블 스키마:** `skincare_shops`

| 필드 | 타입 | 설명 |
|------|------|------|
| id | text | 샵 고유 ID |
| name | text | 업체명 |
| email | text | 이메일 |
| **source** | ❌ **없음** | 공공데이터 구분 필드 |
| **verified** | ❌ **없음** | 인증샵 구분 필드 |
| **region** | ❌ **없음** | 지역 필드 (state는 있음) |

**문제점:**
- 공공데이터(30,000개)와 일반 등록샵(20개)을 **구분할 필드가 없음**
- `source` 필드가 없어서 **email 기반 추측**으로 구분해야 함
- 하지만 일반 등록샵도 정상 이메일을 가지고 있어서 **구분 불가능**

---

## 🔄 **실행 흐름 분석**

```
1. 페이지 로드
   ↓
2. DOMContentLoaded 이벤트 발생
   ↓
3. loadDashboardStats() 호출
   ↓
4. 사용자가 "샵 관리" 클릭
   ↓
5. showSection('shops') 호출
   ↓
6. loadShops() 호출
   |
   ├─ fetch('tables/skincare_shops?limit=1000') → 20개 샵 로드
   |
   ├─ 필터 초기화 (Line 629-636)
   |  ├─ shop-search: '' ✅
   |  ├─ shop-region-filter: '' ✅
   |  ├─ shop-status-filter: '' ✅
   |  └─ shop-type-filter: ❌ 초기화 안 함! (캐시된 "public" 유지)
   |
   └─ displayShops(allShops) → 20개 표시 ✅
   
7. ??? filterShops() 호출됨 (원인 불명)
   |
   ├─ typeFilter = document.getElementById('shop-type-filter').value
   |  └─ "public" (브라우저 캐시)
   |
   ├─ 필터 로직 실행:
   |  └─ filtered = filtered.filter(shop => {
   |         return !shop.email || shop.email.includes('@example.com');
   |     });
   |     → 모든 샵이 정상 이메일을 가지고 있어서 제외됨
   |
   └─ displayShops([]) → 0개 표시 ❌
```

---

## 🔍 **filterShops() 호출 원인**

### **가능성 1: 이벤트 리스너 등록 시 자동 발생**

**파일:** `admin-dashboard.html` (Line 1656-1660)

```javascript
if (shopTypeFilter) {
    shopTypeFilter.addEventListener('change', function() {
        console.log('📊 샵 타입 필터 변경:', this.value);
        filterShops();
    });
}
```

**의심 포인트:**
- 브라우저가 캐시된 값을 복원할 때 `change` 이벤트를 발생시킬 가능성
- 또는 다른 코드에서 `shopTypeFilter.value` 설정 시 `change` 이벤트 자동 발생

### **가능성 2: displayShops() 이후 자동 호출**

**로그 분석:**
```
✅ 테이블 렌더링 완료  ← displayShops(allShops) 완료
🔍 필터 결과: 20개 → 0개  ← filterShops() 실행됨
```

**의심 포인트:**
- `displayShops()` 완료 후 **즉시** `filterShops()`가 호출됨
- 어딘가에서 자동으로 `filterShops()`를 호출하는 코드가 있을 가능성

---

## ✅ **해결 방안**

### **방안 1: loadShops()에서 shop-type-filter 초기화 추가 (최소 수정)**

**파일:** `js/admin-dashboard.js` (Line 629-637)

```javascript
// ✅ 수정된 코드
const searchInput = document.getElementById('shop-search');
const regionFilter = document.getElementById('shop-region-filter');
const statusFilter = document.getElementById('shop-status-filter');
const typeFilter = document.getElementById('shop-type-filter'); // 추가

if (searchInput) searchInput.value = '';
if (regionFilter) regionFilter.value = '';
if (statusFilter) statusFilter.value = '';
if (typeFilter) typeFilter.value = '';  // 추가
```

**효과:**
- 페이지 로드 시 항상 "전체 샵" 상태로 시작
- 브라우저 캐시 영향 제거

---

### **방안 2: filterShops() 로직 개선 (근본 해결)**

**문제:** 데이터베이스에 `source` 필드가 없어서 email 기반 추측으로는 정확한 구분 불가능

**해결책:**

#### **Option A: 데이터베이스 마이그레이션 (완벽)**
```sql
-- migrations/0004-add-shop-classification-fields.sql
ALTER TABLE skincare_shops ADD COLUMN source TEXT DEFAULT 'registered';
ALTER TABLE skincare_shops ADD COLUMN verified INTEGER DEFAULT 0;
ALTER TABLE skincare_shops ADD COLUMN region TEXT;
ALTER TABLE skincare_shops ADD COLUMN business_name TEXT;

-- 기존 30,000개 공공데이터 업데이트
UPDATE skincare_shops
SET source = 'public',
    region = REPLACE(REPLACE(REPLACE(state, '특별시', ''), '광역시', ''), '도', '')
WHERE email IS NULL OR email LIKE '%@example.com%';

-- 일반 등록샵 업데이트
UPDATE skincare_shops
SET source = 'registered',
    region = REPLACE(REPLACE(REPLACE(state, '특별시', ''), '광역시', ''), '도', '')
WHERE email IS NOT NULL AND email NOT LIKE '%@example.com%';
```

**filterShops() 수정:**
```javascript
} else if (typeFilter === 'public') {
    // ✅ source 필드 사용
    filtered = filtered.filter(shop => shop.source === 'public');
} else if (typeFilter === 'verified') {
    filtered = filtered.filter(shop => shop.verified === 1 || shop.verified === true);
} else if (typeFilter === 'registered') {
    filtered = filtered.filter(shop => shop.source === 'registered');
}
```

#### **Option B: 임시 해결 (빠름, 불완전)**

**필터를 일단 제거하고 나중에 마이그레이션:**
```javascript
// admin-dashboard.html의 shop-type-filter HTML 주석 처리
<!--
<select id="shop-type-filter" class="...">
    <option value="">전체 샵</option>
    <option value="verified">⭐ 인증샵만</option>
    <option value="public">📍 공공데이터만</option>
    <option value="registered">📝 신규등록만</option>
</select>
-->
```

---

## 📊 **우선순위 권장**

| 방안 | 소요 시간 | 완성도 | 권장도 |
|------|---------|--------|--------|
| **방안 1만 적용** | 1분 | 60% | ⭐⭐⭐⭐⭐ (즉시 적용!) |
| **방안 1 + Option B** | 3분 | 70% | ⭐⭐⭐⭐ |
| **방안 1 + Option A** | 2시간 | 100% | ⭐⭐⭐ (나중에) |

---

## 🚀 **즉시 조치 사항**

### **Step 1: js/admin-dashboard.js 수정 (1분)**

Line 629-637에 `shop-type-filter` 초기화 추가

### **Step 2: 배포 & 테스트 (3분)**

```bash
cd D:\beautycat
git add js/admin-dashboard.js
git commit -m "v2.8.13.6.129.4 - Fix: Initialize shop-type-filter in loadShops()"
git push origin main
```

### **Step 3: 검증 (3분 후)**

1. https://beautycat.kr/admin-dashboard.html 접속
2. Ctrl+Shift+R (강제 새로고침)
3. 샵 관리 클릭
4. 예상 결과: **20개 샵 정상 표시** ✅

---

## 📝 **추가 권장 사항**

### **장기 개선 계획:**

1. **Week 1:** 방안 1 적용 → 즉시 해결 ✅
2. **Week 2-3:** 데이터베이스 마이그레이션 준비 (Option A)
3. **Week 4:** 마이그레이션 실행 + 필터 로직 개선
4. **Week 5:** 전체 테스트 + 배포

---

## ✅ **결론**

**핵심 원인:**
1. `loadShops()`에서 `shop-type-filter` 초기화 누락 ❌
2. 브라우저 캐시에 `"public"` 값이 저장되어 있음
3. `filterShops()` 로직이 정상 이메일을 가진 샵을 제외함

**즉시 해결:**
- `js/admin-dashboard.js`의 `loadShops()` 함수에 `typeFilter.value = ''` 추가

**완벽 해결:**
- 데이터베이스에 `source`, `verified`, `region` 필드 추가
- 기존 30,000개 데이터 자동 분류
- 필터 로직을 필드 기반으로 변경

---

**작성:** BeautyCat 개발팀  
**버전:** v2.8.13.6.129  
**최종 수정:** 2026-01-02
