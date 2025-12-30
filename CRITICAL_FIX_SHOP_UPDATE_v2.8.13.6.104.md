# 🔧 CRITICAL FIX v2.8.13.6.104 - 샵 정보 수정 500 오류 해결

**배포일:** 2025-01-30  
**심각도:** 🔴 CRITICAL  
**영향:** 샵 정보 수정 500 오류

---

## 🚨 **문제 상황**

### 증상
```javascript
✅ UI: "샵 정보가 성공적으로 수정되었습니다."
❌ 실제: PUT 500 Internal Server Error
❌ 원인: PATCH 자동 변환 + 배열 필드 전송 오류
```

### 콘솔 로그
```javascript
🔄 PATCH 감지: tables/skincare_shops/cf_xxx → GET + PUT로 변환
📦 병합된 데이터: {...}
❌ PUT https://beautycat.kr/tables/skincare_shops/cf_xxx 500 (Internal Server Error)
```

---

## 🔍 **원인 분석**

### 1. PATCH 자동 변환 문제
**admin-dashboard.html (Line 1904-1969)**에 PATCH 자동 변환 코드가 있음:

```javascript
// ❌ 문제 코드
window.fetch = async function(url, options = {}) {
    if (options.method === 'PATCH') {
        // GET으로 기존 데이터 가져오기
        const existingData = await fetch(url).then(r => r.json());
        
        // PATCH 데이터와 병합
        const mergedData = {
            ...existingData,  // ⚠️ 모든 필드 포함 (시스템 필드 포함)
            ...patchData
        };
        
        // PUT으로 전송
        return fetch(url, { method: 'PUT', body: JSON.stringify(mergedData) });
    }
};
```

**문제점:**
- 시스템 필드(`created_at`, `gs_project_id` 등)까지 병합
- 불필요한 필드 전송으로 500 오류 발생

### 2. 배열 필드 전송 문제
```javascript
// ❌ Before
representative_treatments: selectedTreatments,  // 배열 전송
// ['여드름 관리', '미백 관리']

// ✅ After
representative_treatments: selectedTreatments.join(','),  // 문자열 변환
// '여드름 관리,미백 관리'
```

DB는 `TEXT` 타입이므로 **문자열**로 전송해야 함.

---

## ✅ **수정 내용**

### 1. PATCH 자동 변환 비활성화
**파일:** `admin-dashboard.html`

```javascript
// ❌ Before (Line 1904-1969)
<script>
console.log('🔥 HOTFIX: PATCH 요청을 GET + PUT으로 자동 변환');
window.fetch = async function(url, options = {}) {
    if (options.method === 'PATCH') {
        // ... 복잡한 변환 로직 ...
    }
};
console.log('✅ PATCH 자동 변환 활성화 완료');
</script>

// ✅ After
<script>
console.log('✅ PATCH 자동 변환 비활성화 (직접 PUT 사용)');
</script>
```

**이유:** `saveShopChanges()`에서 이미 **직접 PUT**을 사용하므로 자동 변환 불필요

### 2. 필드 기본값 및 배열→문자열 변환
**파일:** `js/admin-dashboard.js` (Line 2664-2677)

```javascript
// ✅ After
const updatedData = {
    name: document.getElementById('edit-shop-name').value || '',
    owner_name: document.getElementById('edit-owner-name').value || '',
    phone: document.getElementById('edit-phone').value || '',
    email: document.getElementById('edit-email').value || '',
    business_number: document.getElementById('edit-business-number').value || '',
    state: document.getElementById('edit-state').value || '',
    district: document.getElementById('edit-district').value || '',
    town: document.getElementById('edit-town')?.value || '',
    address: document.getElementById('edit-address').value || '',
    representative_treatments: selectedTreatments.join(','),  // ✅ 배열→문자열
    price_range: document.getElementById('edit-price-range').value || '',
    description: document.getElementById('edit-description').value || ''
};
```

**변경 사항:**
- 모든 필드에 `|| ''` 기본값 추가
- `representative_treatments`: **배열 → 문자열** 변환

### 3. 버전 업데이트
**파일:** `admin-dashboard.html`

```html
<!-- Before -->
<script src="js/admin-dashboard.js?v=2.8.13.6.103"></script>

<!-- After -->
<script src="js/admin-dashboard.js?v=2.8.13.6.104"></script>
```

---

## 🧪 **테스트 시나리오**

### 1. 샵 정보 수정
```
샵 입점 관리 → [수정] 버튼 클릭
→ 업체명 변경: "미료쿠 업체" → "미료쿠 업체 수정"
→ 전화번호 변경: "정보 없음" → "010-1234-5678"
→ [저장] 클릭
```

### 2. 예상 콘솔 로그
```javascript
// ✅ 성공 케이스
💾 샵 정보 저장 시작: cf_xxx
📤 전송 데이터: {name: "미료쿠 업체 수정", phone: "010-1234-5678", ...}
📤 전송 URL: tables/skincare_shops/cf_xxx
📤 전송 Method: PUT
📤 전송 필드 수: 12
📡 응답 상태: 200
✅ 샵 정보 업데이트 완료: {...}
✅ 업데이트된 필드 확인:
  - name: "미료쿠 업체 수정"  ← 변경됨!
  - phone: "010-1234-5678"    ← 변경됨!
  - updated_at: 1738234567890
🔄 샵 목록 새로고침 시작...
✅ 샵 목록 새로고침 완료
```

---

## 🚀 **배포 프로세스**

### Git 명령어
```bash
cd /d/beautycat
git add admin-dashboard.html js/admin-dashboard.js CRITICAL_FIX_SHOP_UPDATE_v2.8.13.6.104.md
git commit -m "🔧 CRITICAL FIX v2.8.13.6.104 - 샵 수정 500 오류 해결

- 제거: PATCH 자동 변환 (불필요한 필드 병합 방지)
- 수정: representative_treatments 배열→문자열 변환
- 추가: 모든 필드 기본값 설정
- 해결: PUT 500 Internal Server Error"
git push origin main
```

### 배포 후 확인
1. **캐시 완전 삭제**
   - `Ctrl + Shift + Delete` → 전체 삭제

2. **관리자 대시보드 접속**
   - https://beautycat.kr/admin-dashboard.html
   - `Ctrl + Shift + R`

3. **버전 확인**
   - F12 → Console
   - `admin-dashboard.js?v=2.8.13.6.104` 확인
   - `✅ PATCH 자동 변환 비활성화` 로그 확인

4. **샵 수정 테스트**
   - 샵 입점 관리 → 수정 → 저장
   - ✅ 응답 상태: 200
   - ✅ 변경사항 목록 반영

---

## 📊 **예상 결과**

### Before (v2.8.13.6.103)
```javascript
🔄 PATCH 감지: tables/skincare_shops/cf_xxx → GET + PUT로 변환
📦 병합된 데이터: {id, created_at, gs_project_id, ...}  ← 시스템 필드 포함
❌ PUT 500 (Internal Server Error)
```

### After (v2.8.13.6.104)
```javascript
✅ PATCH 자동 변환 비활성화 (직접 PUT 사용)
📤 전송 데이터: {name, owner_name, phone, ...}  ← 필수 필드만
📡 응답 상태: 200
✅ 샵 정보 업데이트 완료
```

---

## 📝 **배포 히스토리**

### v2.8.13.6.104 (01/30) - **샵 수정 500 해결** 🔴
- PATCH 자동 변환 제거
- 배열→문자열 변환
- 필드 기본값 설정

### v2.8.13.6.103 (01/30) - 디버깅 로그 추가
- 요청/응답 상세 로그
- ⚠️ 500 오류 발견

### v2.8.13.6.101 (01/30) - 샵 수정 복구
- 중복 코드 제거
- ⚠️ 실제 업데이트 안 됨

---

## ✅ **최종 체크리스트**

- [x] PATCH 자동 변환 제거
- [x] 배열→문자열 변환
- [x] 필드 기본값 설정
- [x] 버전 업데이트
- [x] 문서 작성
- [ ] **Git 푸시 실행** ⭐
- [ ] **배포 후 테스트** ⭐
- [ ] **샵 수정 성공 확인** ⭐

---

**지금 바로 배포하고 샵 수정을 테스트하세요!** 🚀
