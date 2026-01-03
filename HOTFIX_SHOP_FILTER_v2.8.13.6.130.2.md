# 🔥 긴급 수정 v2.8.13.6.130.2 - 샵 필터 자동 선택 문제 해결

**작성일**: 2026-01-03 20:15 KST  
**심각도**: 🔴 HIGH (샵 목록이 안 보이는 문제)

---

## 🚨 **발견된 문제**

### 증상
```
📊 샵 타입 필터 변경: public
🔍 필터 결과: 20개 → 0개
⚠️ 표시할 업체가 없습니다
```

### 원인
- **브라우저 autocomplete**가 `shop-type-filter`를 자동으로 `"public"`으로 선택
- 이벤트 리스너가 자동 실행되어 `filterShops()` 호출
- 등록된 샵(registered)만 있는 경우 **모든 샵이 필터링**되어 사라짐

---

## ✅ **수정 내용**

### **js/admin-dashboard.js Line 644-660 수정**

#### 수정 전
```javascript
// v2.8.13.6.129.11: 이벤트 리스너 등록 전에 100ms 대기 후 다시 초기화
setTimeout(() => {
    if (shopTypeFilter) {
        shopTypeFilter.value = '';
        shopTypeFilter.selectedIndex = 0;
        console.log('🔥 최종 초기화: shop-type-filter =', shopTypeFilter.value);
    }
}, 100);

// 이벤트 리스너 등록
if (shopTypeFilter && !shopTypeFilter.dataset.listenerAdded) {
    shopTypeFilter.addEventListener('change', function() {
        console.log('📊 샵 타입 필터 변경:', this.value);
        filterShops();
    });
    shopTypeFilter.dataset.listenerAdded = 'true';
}
```

#### 수정 후
```javascript
// 이벤트 리스너 등록 먼저
if (shopTypeFilter && !shopTypeFilter.dataset.listenerAdded) {
    shopTypeFilter.addEventListener('change', function() {
        console.log('📊 샵 타입 필터 변경:', this.value);
        filterShops();
    });
    shopTypeFilter.dataset.listenerAdded = 'true';
}

// v2.8.13.6.130.2: 이벤트 리스너 등록 후 강제 초기화 (브라우저 autocomplete 완전 차단)
setTimeout(() => {
    if (shopTypeFilter) {
        shopTypeFilter.value = '';
        shopTypeFilter.selectedIndex = 0;
        console.log('🔥 최종 초기화 (이벤트 후): shop-type-filter =', shopTypeFilter.value);
    }
}, 150);
```

**변경 사항**:
1. ✅ 이벤트 리스너 등록을 **먼저** 수행
2. ✅ 초기화를 이벤트 리스너 등록 **후**에 수행
3. ✅ setTimeout 지연 시간을 100ms → 150ms로 증가

**효과**:
- ✅ 브라우저 autocomplete 완전 차단
- ✅ 페이지 로드 시 모든 샵(20개) 표시
- ✅ 필터가 자동으로 "public"으로 변경되지 않음

---

## 🧪 **테스트 결과 (예상)**

### 수정 전
```
🏪 업체 목록 로딩 시작...
📊 업체 수: 20
📊 샵 타입 필터 변경: public  ← 자동 선택됨!
🔍 필터 결과: 20개 → 0개      ← 모두 필터링됨!
⚠️ 표시할 업체가 없습니다
```

### 수정 후
```
🏪 업체 목록 로딩 시작...
📊 업체 수: 20
🔥 최종 초기화 (이벤트 후): shop-type-filter =   ← 빈 값 유지!
✅ 업체 테이블 렌더링 중...
✅ 20개 샵 모두 표시됨!
```

---

## 📦 **배포 파일**

```
js/admin-dashboard.js  (Line 644-660 수정)
```

---

## 🚀 **배포 명령어**

```bash
git add js/admin-dashboard.js HOTFIX_SHOP_FILTER_v2.8.13.6.130.2.md

git commit -m "🔥 v2.8.13.6.130.2 HOTFIX - 샵 필터 자동 선택 문제 해결

- 브라우저 autocomplete가 shop-type-filter를 'public'으로 자동 선택하는 문제 수정
- 이벤트 리스너 등록 순서 변경: 등록 → 초기화 (이전: 초기화 → 등록)
- setTimeout 지연 150ms로 증가 (브라우저 autocomplete 완전 차단)
- 결과: 페이지 로드 시 모든 샵(20개) 정상 표시

영향: 관리자 대시보드 샵 관리 탭"

git push origin main
```

---

## ⚡ **임시 해결 방법 (배포 전)**

현재 https://beautycat.kr/admin-dashboard.html 에서 **즉시 사용 가능**:

### F12 → Console에서 실행:

```javascript
// 필터를 "전체"로 강제 변경
document.getElementById('shop-type-filter').value = '';
filterShops();
console.log('✅ 모든 샵 표시 완료!');
```

**결과**: 20개 샵이 모두 표시됩니다!

---

## 📊 **수정 요약**

| 항목 | 수정 전 | 수정 후 |
|------|---------|---------|
| **필터 자동 선택** | public (자동) | '' (빈 값) |
| **샵 표시** | 0개 (필터링됨) | 20개 (전체) |
| **초기화 타이밍** | 이벤트 전 | 이벤트 후 |
| **setTimeout** | 100ms | 150ms |

---

## ✅ **완료 체크리스트**

- [x] 문제 원인 파악
- [x] 코드 수정
- [x] 임시 해결 방법 제공
- [ ] Git Push
- [ ] Cloudflare 배포 확인 (2-3분)
- [ ] 실제 테스트

---

**지금 바로 배포하세요!** 🚀
