# 🔥 HOTFIX: API Global Override 누락 수정 v2.8.8.1.20

**날짜**: 2026-01-11  
**우선순위**: 🔴 **CRITICAL**  
**영향 범위**: 관리자 대시보드 샵 검색  

---

## 📋 **문제 요약**

### ❌ **현상:**
- 콘솔에서 `fetch('tables/skincare_shops')` 실행 시: **해올토탈뷰티 6개 검색됨** ✅
- 대시보드에서 "해올" 검색 시: **4개만 표시됨** ❌
- "해올토탈" 검색 시: **0개 표시됨** ❌

### 🔍 **근본 원인:**
`admin-dashboard.js`의 `loadShops()` 함수가 **`fetch()`를 직접 사용**하고 있어서, **`api-global-override.js`의 필드 매핑이 적용되지 않음**

```javascript
// ❌ Before: 직접 fetch() 사용
const response = await fetch('tables/skincare_shops?limit=10000');

// ✅ After: getTableData() 사용 (API Global Override 적용)
const result = await getTableData('skincare_shops', { limit: 10000 });
```

---

## 🔧 **수정 내용**

### 1️⃣ **js/admin-dashboard.js (Line 936-946)**

#### ❌ **Before:**
```javascript
const response = await fetch(apiUrl);
if (!response.ok) {
    throw new Error(`업체 목록 로딩 실패: ${response.status}`);
}

const result = await response.json();
const data = result.data || [];
```

#### ✅ **After:**
```javascript
// ✅ API Global Override 사용 (필드 매핑 적용)
const result = await getTableData('skincare_shops', { limit: 10000, sort: '-created_at' });
const data = result.data || [];
```

### 2️⃣ **admin-dashboard.html (Line 1557)**
```diff
- <script src="js/admin-dashboard.js?v=2.8.8.1.13"></script>
+ <script src="js/admin-dashboard.js?v=2.8.8.1.20"></script>
```

### 3️⃣ **버전 업데이트**
```diff
- console.log('🎯 Admin Dashboard v2.8.13.6.151 초기화');
+ console.log('🎯 Admin Dashboard v2.8.8.1.20 초기화');
```

---

## 🎯 **예상 효과**

### ✅ **Before (문제 상황):**
| 검색어 | 콘솔 결과 | 대시보드 결과 | 문제 |
|--------|-----------|---------------|------|
| 해올 | 6개 | 4개 | ❌ 2개 누락 |
| 해올토탈 | 6개 | 0개 | ❌ 전체 누락 |

### ✅ **After (수정 후):**
| 검색어 | 콘솔 결과 | 대시보드 결과 | 상태 |
|--------|-----------|---------------|------|
| 해올 | 6개 | 6개 | ✅ 정상 |
| 해올토탈 | 6개 | 6개 | ✅ 정상 |
| 해올토탈뷰티 | 6개 | 6개 | ✅ 정상 |

---

## 🧪 **테스트 방법**

### 1️⃣ **배포 후 테스트:**
```bash
# 1. Git 푸시
cd /d D:\beautycat
git add js/admin-dashboard.js
git add admin-dashboard.html
git add HOTFIX_API_FETCH_OVERRIDE_v2.8.8.1.20.md
git commit -m "fix: API Global Override 적용 누락 수정 v2.8.8.1.20"
git push origin main

# 2. 5분 대기 (Cloudflare 자동 배포)

# 3. Cloudflare 캐시 무효화
Cloudflare 대시보드 → Caching → Purge Everything

# 4. 브라우저 강제 새로고침
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### 2️⃣ **검색 테스트:**
```
a) 관리자 대시보드 접속
b) 샵 입점 관리 → 검색창에 "해올" 입력
   → 예상 결과: 6개 표시 ✅
   
c) 검색창에 "해올토탈" 입력
   → 예상 결과: 6개 표시 ✅
   
d) 검색창에 "해올토탈뷰티" 입력
   → 예상 결과: 6개 표시 ✅
```

### 3️⃣ **브라우저 콘솔 확인:**
```javascript
// F12 → Console에서 실행
fetch('tables/skincare_shops?limit=10000')
  .then(r => r.json())
  .then(result => {
    const haeol = result.data.filter(s => !s.deleted && s.name?.includes('해올'));
    console.log('✅ 해올 샵 수:', haeol.length);
  });
```

**예상 출력:**
```
✅ 해올 샵 수: 6
```

---

## 📊 **영향 분석**

### ✅ **수정 범위:**
- **파일:** `js/admin-dashboard.js` (1개 함수)
- **함수:** `loadShops()`
- **변경:** `fetch()` → `getTableData()`

### ✅ **영향 없음:**
- 다른 관리자 기능 (사용자 관리, 통계 등)
- 고객 대시보드
- 샵 대시보드
- 메인 페이지

### ✅ **다운타임:**
- **0분** (코드만 변경, DB 변경 없음)

---

## 🔍 **왜 이런 문제가 발생했나?**

### **원인 분석:**
1. **`api-global-override.js`는 존재**하고 제대로 로드됨 ✅
2. **필드 매핑 로직도 정상** ✅
3. **하지만 `admin-dashboard.js`가 직접 `fetch()` 사용** ❌

→ **결과:** `api-global-override.js`를 우회해서 API를 호출하게 됨!

### **검색 문자열 분석:**
```javascript
// 콘솔에서 직접 fetch() 사용 시:
검색 문자열: "해올토탈뷰티 김태 김포 01057902437 taerang0428@naver.com"
'해올' 포함: true ✅
'해올토탈' 포함: true ✅

// 대시보드에서 loadShops() 사용 시:
// API Global Override 미적용 → shop_name 필드 매핑 안 됨 ❌
```

---

## 🎯 **결론**

**`fetch()` → `getTableData()` 변경으로:**
- ✅ API Global Override 정상 적용
- ✅ 필드 매핑 (name → shop_name) 정상 작동
- ✅ 검색 로직 정상화
- ✅ 모든 해올토탈뷰티 샵 검색 가능

---

## 📝 **관련 문서**

- `HOTFIX_SEARCH_EMPTY_FIELDS_v2.8.8.1.17.md` - 빈 필드 필터링 수정
- `HOTFIX_SEARCH_UNDEFINED_v2.8.8.1.16.md` - undefined 문자열 수정
- `HOTFIX_DISTRICT_FILTER_v2.8.8.1.18.md` - 시/구/군 필터 추가
- `ROOT_CAUSE_ANALYSIS_v2.8.8.1.md` - 근본 원인 분석

---

**작성자**: BeautyCat Dev Team  
**마지막 업데이트**: 2026-01-11
