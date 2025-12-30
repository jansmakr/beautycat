# 🔧 HOTFIX v2.8.13.6.106 - HTTP 405 오류 해결 (PUT → PATCH + 필수 필드만 병합)

**배포일:** 2025-01-30  
**심각도:** 🔴 CRITICAL  
**영향:** 샵 정보 수정 405 오류

---

## 🚨 **문제 상황**

### 증상
```javascript
❌ Failed to load resource: the server responded with a status of 405 ()
❌ Shop update error: Error: HTTP 405
```

**HTTP 405 = Method Not Allowed**

### 원인
서버가 **PUT 메서드를 지원하지 않음**

---

## ✅ **해결 방법**

### 1. PUT → PATCH로 변경
**파일:** `js/admin-dashboard.js`

```javascript
// ❌ Before: PUT 사용
const response = await fetch(`tables/skincare_shops/${shopId}`, {
    method: 'PUT',  // 서버가 지원하지 않음!
    ...
});

// ✅ After: PATCH 사용
const response = await fetch(`tables/skincare_shops/${shopId}`, {
    method: 'PATCH',  // 부분 업데이트
    ...
});
```

### 2. PATCH 자동 변환 개선 (필수 필드만 병합)
**파일:** `admin-dashboard.html`

```javascript
// ✅ 허용된 필드만 병합
const allowedFields = [
    'name', 'owner_name', 'phone', 'email', 'business_number',
    'state', 'district', 'town', 'address', 
    'representative_treatments', 'price_range', 'description',
    'status', 'services', 'operating_hours', 'business_license'
];

const mergedData = {};

// 기존 데이터에서 허용된 필드만 복사
for (const field of allowedFields) {
    if (existingData.hasOwnProperty(field)) {
        mergedData[field] = existingData[field];
    }
}

// PATCH 데이터로 덮어쓰기
for (const field of allowedFields) {
    if (patchData.hasOwnProperty(field)) {
        mergedData[field] = patchData[field];
    }
}
```

**효과:**
- ✅ 시스템 필드 제외 (`id`, `created_at`, `gs_project_id` 등)
- ✅ 필수 필드만 병합
- ✅ 500 오류 방지

---

## 🚀 **배포 프로세스**

### Git 명령어
```bash
cd /d/beautycat
git add admin-dashboard.html js/admin-dashboard.js HOTFIX_HTTP_405_v2.8.13.6.106.md
git commit -m "HOTFIX v2.8.13.6.106 - HTTP 405 fix: PUT to PATCH with field filtering"
git push origin main
```

### 배포 후 확인
1. **캐시 삭제** (F12 → Application → Clear site data)
2. **시크릿 모드** 접속
3. **샵 수정 테스트**

---

## 🧪 **테스트 시나리오**

```
샵 입점 관리 → [수정] 클릭
→ 업체명 변경: "미료쿠 업체" → "미료쿠 업체 수정"
→ [저장] 클릭
→ ✅ 성공 메시지 확인
→ ✅ 목록에서 변경 확인
```

### 예상 콘솔 로그
```javascript
🔄 PATCH 감지: tables/skincare_shops/cf_xxx → GET + PUT로 변환
📦 병합된 데이터 (필수 필드만): {name, owner_name, ...}
📡 응답 상태: 200  ← 성공!
✅ 샵 정보 업데이트 완료
```

---

## 📝 **배포 히스토리**

### v2.8.13.6.106 (01/30) - **HTTP 405 해결** 🔴
- PATCH 사용으로 변경
- 필수 필드만 병합 (시스템 필드 제외)

### v2.8.13.6.105 (01/30) - 구/군 드롭다운
- 견적 매칭 정확도 100%
- ⚠️ PUT 405 오류 발생

### v2.8.13.6.104 (01/30) - PATCH 제거
- ⚠️ PUT 405 오류 발생

---

## ✅ **최종 체크리스트**

- [x] PUT → PATCH 변경
- [x] 필수 필드만 병합
- [x] 시스템 필드 제외
- [x] 버전 업데이트 (v2.8.13.6.106)
- [x] 문서 작성
- [ ] **Git 푸시 실행** ⭐
- [ ] **배포 후 테스트** ⭐
- [ ] **샵 수정 성공 확인** ⭐

---

**지금 바로 배포하세요!** 🚀
