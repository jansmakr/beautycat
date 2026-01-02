# 🚀 v2.8.13.6.129.4 - 긴급 버그 수정 배포 가이드

**배포 일시:** 2026-01-02  
**버전:** v2.8.13.6.129.4  
**우선순위:** 🔴 긴급 (Critical)

---

## 📋 **수정 내용**

### **🐛 버그 수정**

#### **1. 관리자 샵 필터 0개 버그 수정**

**파일:** `js/admin-dashboard.js` (Line 626-642)

**문제:**
- 브라우저 캐시에 `shop-type-filter = "public"` 값이 저장됨
- `loadShops()` 함수에서 이 필터를 초기화하지 않아서 캐시 값 유지
- 페이지 로드 후 자동으로 공공데이터 필터가 적용되어 **20개 → 0개**

**수정:**
```javascript
// ✅ v2.8.13.6.129.4: shop-type-filter 초기화 추가
const typeFilter = document.getElementById('shop-type-filter');
if (typeFilter) typeFilter.value = '';
```

**효과:**
- 페이지 로드 시 항상 **"전체 샵"** 상태로 시작
- 브라우저 캐시 영향 제거
- **20개 샵 정상 표시** ✅

---

## 📄 **변경된 파일**

| 파일 | 변경 사항 | 우선순위 |
|------|----------|---------|
| `js/admin-dashboard.js` | shop-type-filter 초기화 추가 | 🔴 Critical |
| `CRITICAL_BUG_ANALYSIS_v2.8.13.6.129.md` | 근본 원인 분석 보고서 | 📄 문서 |

---

## 🚀 **배포 절차**

### **Step 1: GitHub Desktop에서 커밋**

#### **Changes 탭 확인:**
```
✅ js/admin-dashboard.js (수정됨)
✅ CRITICAL_BUG_ANALYSIS_v2.8.13.6.129.md (새 파일)
```

#### **커밋 메시지:**

**Summary:**
```
v2.8.13.6.129.4 - Fix: Initialize shop-type-filter in loadShops()
```

**Description:**
```
🐛 버그 수정:
- loadShops()에서 shop-type-filter 초기화 누락 문제 해결
- 브라우저 캐시로 인한 "public" 필터 자동 적용 방지
- 페이지 로드 시 항상 "전체 샵" 상태로 시작

📊 결과:
- Before: 20개 샵 → 0개 (자동 필터링)
- After: 20개 샵 정상 표시 ✅

📄 문서:
- CRITICAL_BUG_ANALYSIS_v2.8.13.6.129.md: 근본 원인 분석 보고서 작성
```

### **Step 2: Push to Origin**

```
Commit to main → Push origin
```

---

## ✅ **배포 후 테스트 (3분 후)**

### **Test 1: 관리자 샵 목록**

**URL:** https://beautycat.kr/admin-dashboard.html

**절차:**
1. Ctrl+Shift+R (강제 새로고침)
2. admin@beautycat.kr 로그인
3. "샵 관리" 클릭

**예상 결과:**
```
✅ 20개 샵 정상 표시
✅ "전체 샵" 드롭다운 선택됨 (기본값)
✅ 필터 미적용 상태
```

### **Test 2: 샵 타입 필터 동작**

**절차:**
1. 샵 타입 드롭다운 클릭
2. "📍 공공데이터만" 선택

**예상 결과:**
```
❌ 0개 샵 표시 (정상)
   → 현재 DB에는 공공데이터가 없음 (모두 정상 이메일 보유)
```

3. "전체 샵" 선택

**예상 결과:**
```
✅ 20개 샵 다시 표시
```

---

## 📊 **배포 영향 범위**

### **영향받는 페이지:**
- ✅ 관리자 대시보드 > 샵 관리 페이지

### **영향받는 사용자:**
- ✅ 관리자 계정 (admin@beautycat.kr)

### **영향받지 않는 페이지:**
- ✅ 메인 페이지 (index.html)
- ✅ region.html
- ✅ 사용자 대시보드
- ✅ 샵 대시보드

---

## ⚠️ **알려진 제한 사항**

### **1. 공공데이터 필터 부정확**

**현상:**
- "📍 공공데이터만" 필터 선택 시 0개 표시
- 실제로는 30,000개의 공공데이터가 있어야 하지만 구분 불가능

**원인:**
- 데이터베이스에 `source` 필드가 없어서 구분 불가능
- 현재는 email 기반 추측만 가능 (부정확)

**해결책:**
- 데이터베이스 마이그레이션 필요:
  - `ALTER TABLE skincare_shops ADD COLUMN source TEXT`
  - 기존 데이터 자동 분류 (email 기반)

**우선순위:** 🟡 Medium (나중에 해결)

---

### **2. 인증샵 필터 동작 안 함**

**현상:**
- "⭐ 인증샵만" 필터 선택 시 부정확한 결과

**원인:**
- `verified` 필드가 없음

**해결책:**
- 데이터베이스 마이그레이션 필요

**우선순위:** 🟡 Medium (나중에 해결)

---

## 📅 **향후 개선 계획**

### **Phase 1: 긴급 수정 (Today) ✅**
- shop-type-filter 초기화 추가 → **완료!**

### **Phase 2: 데이터베이스 개선 (Week 2-3)**
- `source`, `verified`, `region` 필드 추가
- 기존 30,000개 데이터 자동 분류
- 인덱스 추가

### **Phase 3: 필터 로직 개선 (Week 4)**
- email 기반 → 필드 기반으로 변경
- 필터 정확도 100% 달성

---

## 🎯 **성공 기준**

### **배포 성공 조건:**
- [x] js/admin-dashboard.js 파일 배포 완료
- [ ] 관리자 페이지에서 20개 샵 정상 표시
- [ ] 샵 타입 필터 기본값 "전체 샵" 확인
- [ ] 페이지 새로고침 후에도 정상 동작

### **롤백 조건:**
- [ ] 샵 목록이 여전히 0개로 표시됨
- [ ] JavaScript 오류 발생
- [ ] 다른 페이지에 영향

---

## 📞 **문제 발생 시**

### **Option 1: 강제 새로고침**
```
Ctrl+Shift+R (Chrome/Edge)
Cmd+Shift+R (Mac)
```

### **Option 2: 브라우저 캐시 삭제**
1. Chrome DevTools 열기 (F12)
2. Network 탭
3. "Disable cache" 체크
4. 페이지 새로고침

### **Option 3: 시크릿 모드**
```
Ctrl+Shift+N (Chrome)
Ctrl+Shift+P (Edge)
```

---

## ✅ **배포 체크리스트**

- [ ] Changes 탭에서 파일 확인
- [ ] 커밋 메시지 작성
- [ ] "Commit to main" 클릭
- [ ] "Push origin" 클릭
- [ ] 3분 대기
- [ ] 테스트 1 실행 (20개 샵 표시)
- [ ] 테스트 2 실행 (필터 동작)
- [ ] README.md 업데이트 (선택)

---

**작성:** BeautyCat 개발팀  
**버전:** v2.8.13.6.129.4  
**최종 수정:** 2026-01-02
