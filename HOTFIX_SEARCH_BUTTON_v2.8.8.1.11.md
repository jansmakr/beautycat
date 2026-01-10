# 🔍 검색 버튼 수정 (v2.8.8.1.11)

**날짜**: 2026-01-10  
**우선순위**: LOW  
**담당자**: AI Assistant

---

## 📋 변경 사항 요약

### 문제
- 관리자 대시보드의 샵 검색창에서 **타이핑할 때마다 자동 검색**이 실행되어 성능 저하 및 사용자 경험 저하

### 해결
- **검색창의 `input` 이벤트 리스너 제거**
- **버튼 클릭** 또는 **엔터 키**로만 검색 실행되도록 변경

---

## 🔧 수정 파일

### 1. `js/admin-dashboard.js`

#### 수정 위치: 라인 662-665

**이전 코드**:
```javascript
if (shopSearchInput && !shopSearchInput.dataset.listenerAdded) {
    shopSearchInput.addEventListener('input', filterShops);
    shopSearchInput.dataset.listenerAdded = 'true';
}
```

**수정 후**:
```javascript
// v2.8.8.1.11: 검색 입력 자동 실행 제거 - 버튼 클릭 또는 엔터 키로만 검색
// 검색창의 input 이벤트 리스너 제거 (HTML의 onkeypress="Enter" 이벤트 사용)
```

---

## ✅ 동작 확인

### 검색 방법
1. **검색 버튼 클릭**: `<button onclick="filterShops()">` (라인 341)
2. **엔터 키**: `<input onkeypress="if(event.key==='Enter') filterShops()">` (라인 338)

### 기존 기능 유지
- ✅ 지역 필터: 드롭다운 변경 시 즉시 필터링
- ✅ 상태 필터: 드롭다운 변경 시 즉시 필터링
- ✅ 샵 타입 필터: 드롭다운 변경 시 즉시 필터링
- ✅ 초기화 버튼: 모든 필터 리셋 및 전체 데이터 로드

---

## 🧪 테스트 시나리오

### 1. 검색 버튼 테스트
```
1. admin-dashboard.html → 업체 관리
2. 검색창에 "미료쿠" 입력
3. 검색 버튼 클릭
4. 예상: loadShops() 호출 및 필터링 결과 표시
```

### 2. 엔터 키 테스트
```
1. 검색창에 "해욿토탈뷰티" 입력
2. 엔터 키 누름
3. 예상: loadShops() 호출 및 필터링 결과 표시
```

### 3. 타이핑 테스트
```
1. 검색창에 "서울" 타이핑
2. 예상: 검색이 실행되지 않음 (버튼 클릭 또는 엔터 필요)
```

---

## 📊 영향 범위

### 긍정적 영향
- ✅ **성능 개선**: 타이핑마다 API 호출하지 않음
- ✅ **사용자 경험 개선**: 의도한 시점에만 검색 실행
- ✅ **서버 부하 감소**: 불필요한 API 호출 제거

### 주의 사항
- ⚠️ 기존 사용자는 타이핑 후 **검색 버튼 클릭** 또는 **엔터 키**를 눌러야 함
- 📌 지역/상태/샵타입 필터는 여전히 **즉시 반영**

---

## 🚀 배포 절차

### Git 명령어
```bash
cd /d D:\beautycat
git add js/admin-dashboard.js HOTFIX_SEARCH_BUTTON_v2.8.8.1.11.md README.md
git commit -m "fix: 검색창 자동 실행 제거 (v2.8.8.1.11)"
git push origin main
```

### 배포 후 확인
1. **Cloudflare 캐시 삭제**: https://dash.cloudflare.com/ → beautycat.kr → Caching → **Purge Everything**
2. **브라우저 테스트**: https://beautycat.kr/admin-dashboard.html (Ctrl+Shift+R)
3. **검색 테스트**: 검색창에 입력 → 버튼 클릭 또는 엔터

---

## 📝 관련 문서
- [v2.8.8.1.8] HOTFIX_REGISTER_FUNCTION_v2.8.8.1.8.md
- [v2.8.8.1.9] HOTFIX_SHOP_TYPE_FILTER_v2.8.8.1.9.md
- [v2.8.8.1.10] HOTFIX_NAVER_CAFE_ID_v2.8.8.1.10.md

---

**상태**: ✅ 수정 완료 - 배포 대기  
**테스트**: ⏳ 배포 후 검증 필요
