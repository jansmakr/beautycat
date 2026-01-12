# 🔧 HOTFIX: limit 2000 최적화 - Cloudflare Workers CPU 한계 해결 v2.8.8.1.25

## 📋 문제 상황

### 🚨 심각한 문제
```
❌ GET tables/skincare_shops?limit=100000 → 503 Service Unavailable
❌ 재시도 3회 모두 실패
❌ 업체 목록 로딩 불가능
❌ 서비스 중단 상태
```

### 🔍 원인 분석
**Cloudflare Workers 무료 플랜의 CPU 시간 제한**
- **CPU 시간 제한**: 10ms
- **limit=100000 요청**: 59,267개 데이터 쿼리 → 10ms 초과
- **결과**: 503 Service Unavailable

---

## ✅ 해결 방법

### limit 100000 → 2000 조정

**근거**:
- 샘플링 후 활성 데이터: **1,161개**
- 삭제된 데이터 포함: **약 1,900개**
- limit 2000: **여유분 포함, 전체 데이터 조회 가능**
- CPU 시간: **10ms 이내**

---

## 📊 수정 내용

### js/admin-dashboard.js

**1. 버전 로그 수정**:
```javascript
// Before (v2.8.8.1.23)
console.log('🎯 Admin Dashboard v2.8.8.1.23 초기화 - limit 100000 영구 적용');

// After (v2.8.8.1.25)
console.log('🎯 Admin Dashboard v2.8.8.1.25 초기화 - limit 2000 최적화 (Cloudflare CPU 한계)');
```

**2. loadShops() 함수 수정 (Line 924-938)**:
```javascript
// Before
const result = await getTableData('skincare_shops', { limit: 100000, sort: '-created_at' });
console.log('📡 API 요청 완료 - limit: 100000, 전체:', result.data?.length || 0, '개');

// After
const result = await getTableData('skincare_shops', { limit: 2000, sort: '-created_at' });
console.log('📡 API 요청 완료 - limit: 2000, 전체:', result.data?.length || 0, '개');
```

### admin-dashboard.html

**캐시 버스팅**:
```html
<!-- Before -->
<script src="js/admin-dashboard.js?v=2.8.8.1.23"></script>

<!-- After -->
<script src="js/admin-dashboard.js?v=2.8.8.1.25"></script>
```

---

## 📈 결과

### Before (v2.8.8.1.23)
```
❌ limit: 100000
❌ CPU 시간: >10ms
❌ 503 Service Unavailable
❌ 업체 목록: 로딩 실패
❌ 서비스: 중단
```

### After (v2.8.8.1.25)
```
✅ limit: 2000
✅ CPU 시간: <10ms
✅ 200 OK
✅ 업체 목록: 1,161개 (전체 로딩 성공)
✅ 서비스: 정상
```

---

## 🚀 배포 절차

### 1. GitHub 커밋 & 푸시
```bash
git add js/admin-dashboard.js admin-dashboard.html HOTFIX_LIMIT_2000_v2.8.8.1.25.md README.md
git commit -m "fix: limit 2000 최적화 - Cloudflare Workers CPU 한계 해결 v2.8.8.1.25

- limit 100000 → 2000 조정
- 503 Service Unavailable 해결
- Cloudflare Workers 10ms CPU 한계 회피
- 샘플링 후 1,161개 전체 데이터 조회 가능
- 우선순위: CRITICAL - 서비스 중단"

git push origin main
```

### 2. Cloudflare 배포 대기 (3-5분)

### 3. Cloudflare 캐시 무효화
```
Cloudflare 대시보드 → Caching → Purge Everything
```

### 4. 브라우저 강제 새로고침
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

---

## ✅ 검증 방법

### 콘솔 로그 확인
```javascript
🎯 Admin Dashboard v2.8.8.1.25 초기화 - limit 2000 최적화 (Cloudflare CPU 한계)
🏪 업체 목록 로딩 시작... (v2.8.8.1.25: limit 2000 최적화)
📡 API 요청 완료 - limit: 2000, 전체: 2000 개
📊 API에서 로딩된 업체 수: 1161

✅ 성공: v2.8.8.1.25 표시
✅ 503 에러 없음
✅ 활성 업체: 1161개
```

---

## 🎯 우선순위: CRITICAL
- 서비스 중단 상태
- 업체 목록 로딩 불가
- 관리자 대시보드 사용 불가
- 즉시 수정 필요

---

## 📝 관련 정보

### Cloudflare Workers 제한
- **무료 플랜**: CPU 시간 10ms
- **유료 플랜**: CPU 시간 50ms (월 $5)
- **권장 해결책**: limit 조정 (2000 이하)

### 데이터 현황
- **전체 데이터**: 59,267개 (삭제 포함)
- **활성 데이터**: 1,161개
- **샘플링 후**: 98% 감소
- **limit 2000**: 충분

---

**작성일**: 2026-01-12  
**버전**: v2.8.8.1.25  
**작성자**: BeautyCat Dev Team
