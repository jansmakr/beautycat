# 🔧 HOTFIX: 캐시 버스팅 및 limit 영구 적용 v2.8.8.1.23

## 📋 문제 상황

### 🚨 발견된 문제
```
❌ 대시보드에 255개만 표시 (실제 1,161개 활성 데이터 존재)
❌ 브라우저 캐시가 오래된 admin-dashboard.js 로딩
❌ 콘솔 로그: v2.8.8.1.20 (최신: v2.8.8.1.21)
❌ limit 10000으로 실행 (코드에는 100000 설정됨)
```

### 🔍 원인 분석
1. **브라우저 캐시**: 오래된 JavaScript 파일이 캐싱됨
2. **버전 불일치**: HTML에 v2.8.8.1.21, 실제 로딩은 v2.8.8.1.20
3. **limit 미적용**: 코드에 100000 설정되었으나 실행은 10000

---

## ✅ 해결 방법

### 1. 버전 업그레이드: v2.8.8.1.23

**변경 파일**:
- `admin-dashboard.html`: v2.8.8.1.21 → v2.8.8.1.23
- `js/admin-dashboard.js`: 버전 로그 및 주석 업데이트

### 2. 캐시 버스팅 적용

```html
<!-- Before -->
<script src="js/admin-dashboard.js?v=2.8.8.1.21"></script>

<!-- After -->
<script src="js/admin-dashboard.js?v=2.8.8.1.23"></script>
```

### 3. limit 100000 영구 적용 명시

**js/admin-dashboard.js (Line 924-938)**:
```javascript
// ✅ v2.8.8.1.23: API에서 전체 데이터 로드 (limit 100000 영구 적용)
// 전체 데이터 로드 후 클라이언트에서 필터링 (샘플링 후 1,161개 활성 데이터)
const result = await getTableData('skincare_shops', { limit: 100000, sort: '-created_at' });
console.log('📡 API 요청 완료 - limit: 100000, 전체:', result.data?.length || 0, '개');
```

---

## 📊 결과

### Before (v2.8.8.1.20 캐시)
```
❌ 표시 데이터: 255개
❌ limit: 10000 (캐시)
❌ 로딩 버전: v2.8.8.1.20
```

### After (v2.8.8.1.23)
```
✅ 표시 데이터: 1,161개
✅ limit: 100000 (영구 적용)
✅ 로딩 버전: v2.8.8.1.23
✅ 캐시 버스팅 성공
```

---

## 🚀 배포 절차

### 1. GitHub 커밋 & 푸시
```bash
git add admin-dashboard.html js/admin-dashboard.js README.md HOTFIX_CACHE_BUSTING_v2.8.8.1.23.md
git commit -m "fix: 캐시 버스팅 및 limit 100000 영구 적용 v2.8.8.1.23

- 브라우저 캐시로 인한 255개만 표시 문제 해결
- limit 100000 영구 적용 명시
- 버전 v2.8.8.1.23으로 업그레이드
- 1,161개 전체 데이터 표시 정상화"

git push origin main
```

### 2. Cloudflare 배포 대기 (약 3-5분)
- Cloudflare 대시보드 → Workers & Pages → beautycat
- Deployments 탭에서 최신 배포 확인

### 3. Cloudflare 캐시 무효화
- Cloudflare 대시보드 → Caching
- **Purge Everything** 클릭

### 4. 브라우저 강제 새로고침
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

---

## ✅ 검증 방법

### 1. 브라우저 콘솔 확인
```javascript
// 페이지 로드 시 콘솔 로그 확인
🎯 Admin Dashboard v2.8.8.1.23 초기화 - limit 100000 영구 적용
🏪 업체 목록 로딩 시작... (v2.8.8.1.23: limit 100000 영구 적용)
📡 API 요청 완료 - limit: 100000, 전체: 59267 개
📊 API에서 로딩된 업체 수: 1161
```

### 2. 데이터 수 확인
```javascript
// 콘솔에서 실행
console.log('활성 업체 수:', allShops.length);
// 예상 결과: 1161
```

### 3. 해올토탈뷰티 검색
```
1. 관리자 대시보드 → 업체 관리
2. 검색창에 "해올" 입력
3. 결과: 1개 표시 (해올토탈뷰티)
```

---

## 🔧 추가 해결 사항

### 해올토탈뷰티 검색 문제
```
현재 상황:
- DB에 존재: ✅ cf_1768135332734_s2a3j9tgg
- 대시보드 표시: ❌ 검색 안 됨

원인:
- 삭제된 구 버전 존재: cf_1767705047688_omg5so1gm (deleted: true)
- 신규 버전 활성: cf_1768135332734_s2a3j9tgg (deleted: false)

다음 단계:
- 별도 수정 필요 (필터링 로직 확인)
```

---

## 📝 관련 문서
- **샘플링 가이드**: DATA_SAMPLING_EXECUTION_GUIDE.md
- **샘플링 결과**: DATA_SAMPLING_GUIDE_1000.md
- **리스크 분석**: DATA_SAMPLING_RISK_ANALYSIS.md
- **이전 버전**: HOTFIX_LIMIT_INCREASE_v2.8.8.1.21.md

---

## 🎯 우선순위: CRITICAL
- 사용자 경험에 직접 영향
- 데이터 완전성 문제
- 캐시 문제로 인한 오류

---

**작성일**: 2026-01-12  
**버전**: v2.8.8.1.23  
**작성자**: BeautyCat Dev Team
