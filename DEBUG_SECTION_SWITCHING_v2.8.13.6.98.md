# 🔍 DEBUG v2.8.13.6.98 - 샵 입점 관리 표시 문제 디버깅

## 📅 날짜
- **배포일**: 2025-01-30
- **버전**: v2.8.13.6.98
- **이전 버전**: v2.8.13.6.97

---

## 🎯 목표
- 샵 입점 관리 메뉴에서 업체가 표시되지 않는 문제 디버깅
- showSection() 함수의 상세 로깅 추가
- 섹션 전환 및 데이터 로딩 과정 추적

---

## 🐛 보고된 문제

**증상:**
```
URL: https://beautycat.kr/admin-dashboard#

사용자 관리: 샵이 보임 ✅
샵 입점 관리: 샵이 안 보임 ❌

- 동일한 URL (#해시만)
- 사용자 관리에는 데이터 표시
- 샵 입점 관리에는 데이터 미표시
```

**추정 원인:**
1. 섹션 전환 시 데이터 로드 실패
2. `shops-table` 요소가 DOM에 없음
3. CSS 숨김 문제
4. 필터링 문제

---

## 🔧 **추가된 디버깅 로그**

### Before (v2.8.13.6.97)
```javascript
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.add('hidden'));
    
    // Show selected section
    let targetSection = document.getElementById(sectionName + '-section');
    if (!targetSection) {
        targetSection = document.getElementById(sectionName);
    }
    
    if (targetSection) {
        targetSection.classList.remove('hidden');
        currentSection = sectionName;
    }
    
    // Load section-specific data
    switch(sectionName) {
        case 'shops':
            loadShops();
            break;
    }
}
```

### After (v2.8.13.6.98)
```javascript
function showSection(sectionName) {
    console.log('🔄 섹션 전환 시작:', sectionName);
    
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    console.log('📦 전체 섹션 수:', sections.length);
    sections.forEach(section => section.classList.add('hidden'));
    
    // Show selected section
    let targetSection = document.getElementById(sectionName + '-section');
    if (!targetSection) {
        targetSection = document.getElementById(sectionName);
    }
    
    if (targetSection) {
        console.log('✅ 대상 섹션 발견:', targetSection.id);
        targetSection.classList.remove('hidden');
        currentSection = sectionName;
    } else {
        console.error('❌ 섹션을 찾을 수 없습니다:', sectionName);
        console.log('🔍 시도한 ID:', sectionName + '-section', 'and', sectionName);
    }
    
    // Load section-specific data
    console.log('📊 섹션 데이터 로딩:', sectionName);
    switch(sectionName) {
        case 'shops':
            console.log('🏪 loadShops() 호출');
            loadShops();
            break;
    }
    console.log('✅ showSection 완료:', sectionName);
}
```

---

## 📝 변경 사항

### ✅ 수정된 파일

1. **js/admin-dashboard.js**
   - `showSection()` 함수에 상세 로깅 추가
   - 섹션 전환 과정 추적
   - 에러 케이스 처리

2. **admin-dashboard.html**
   - 버전 업데이트: `v2.8.13.6.97` → `v2.8.13.6.98`

---

## 🧪 테스트 방법

### 1️⃣ 배포 후 테스트
```bash
1. 캐시 완전 삭제
   Ctrl+Shift+Delete → 전체 기간 → 삭제

2. 관리자 대시보드 접속
   https://beautycat.kr/admin-dashboard.html
   Ctrl+Shift+R (강제 새로고침)

3. DevTools 열기
   F12 → Console 탭

4. 사용자 관리 클릭
   좌측 메뉴 → "사용자 관리" 클릭
   콘솔 로그 확인

5. 샵 입점 관리 클릭
   좌측 메뉴 → "샵 입점 관리" 클릭
   콘솔 로그 확인
```

### 2️⃣ 예상 콘솔 로그

**정상 케이스:**
```
🔄 섹션 전환 시작: shops
📦 전체 섹션 수: 8
✅ 대상 섹션 발견: shops-section
📊 섹션 데이터 로딩: shops
🏪 loadShops() 호출
✅ showSection 완료: shops
🏪 업체 목록 로딩 시작...
📊 업체 수: 16
📋 업체 목록: [{...}, {...}, ...]
🖼️ 테이블 렌더링 시작...
📊 displayShops 호출됨, 업체 수: 16
✅ shops-table 요소 발견: <tbody id="shops-table">
✅ 업체 테이블 렌더링 중...
✅ 테이블 렌더링 완료
```

**문제 케이스 1: 섹션 미발견**
```
🔄 섹션 전환 시작: shops
📦 전체 섹션 수: 8
❌ 섹션을 찾을 수 없습니다: shops
🔍 시도한 ID: shops-section and shops
```

**문제 케이스 2: 테이블 요소 미발견**
```
🔄 섹션 전환 시작: shops
✅ 대상 섹션 발견: shops-section
🏪 loadShops() 호출
🏪 업체 목록 로딩 시작...
📊 업체 수: 16
🖼️ 테이블 렌더링 시작...
❌ shops-table 요소를 찾을 수 없습니다!
```

**문제 케이스 3: 데이터 없음**
```
🔄 섹션 전환 시작: shops
✅ 대상 섹션 발견: shops-section
🏪 loadShops() 호출
🏪 업체 목록 로딩 시작...
📊 업체 수: 0
⚠️ 표시할 업체가 없습니다
```

---

## 🔍 **디버깅 체크리스트**

### 섹션 전환 확인
- [ ] `showSection('shops')` 호출되는가?
- [ ] `shops-section` DOM 요소가 존재하는가?
- [ ] 섹션이 `hidden` 클래스를 제거하는가?

### 데이터 로딩 확인
- [ ] `loadShops()` 호출되는가?
- [ ] API 응답이 정상인가?
- [ ] `allShops` 배열에 데이터가 있는가?

### 테이블 렌더링 확인
- [ ] `displayShops()` 호출되는가?
- [ ] `shops-table` 요소가 존재하는가?
- [ ] `tableBody.innerHTML`이 업데이트되는가?

### 화면 표시 확인
- [ ] 테이블이 화면에 보이는가?
- [ ] CSS `display: none` 문제가 없는가?
- [ ] 스크롤이 필요한가?

---

## 🚀 배포 절차

### 1. Git 푸시
```bash
cd /d/beautycat

git add admin-dashboard.html \
        js/admin-dashboard.js \
        DEBUG_SECTION_SWITCHING_v2.8.13.6.98.md

git commit -m "🔍 DEBUG v2.8.13.6.98 - 샵 입점 관리 표시 문제 디버깅

- showSection() 함수에 상세 로깅 추가
- 섹션 전환 과정 추적
- 에러 케이스 상세 로깅
- shops-table 렌더링 문제 파악용"

git push origin main
```

### 2. 배포 후 테스트
```bash
1. 캐시 삭제: Ctrl+Shift+Delete
2. 새로고침: Ctrl+Shift+R
3. 콘솔 확인: F12 → Console
4. 샵 입점 관리 클릭
5. 콘솔 로그 전체 복사
```

---

## 📊 **수집할 정보**

### 콘솔 로그
```
1. 섹션 전환 시작/완료 로그
2. DOM 요소 발견 여부
3. API 응답 데이터
4. 테이블 렌더링 상태
5. 에러 메시지 (있는 경우)
```

### 화면 상태
```
1. 샵 입점 관리 화면 스크린샷
2. DevTools Elements 탭에서 shops-section 확인
3. shops-table 요소 innerHTML 확인
```

### 수동 확인 명령어
```javascript
// Console에서 실행
document.getElementById('shops-section')
document.getElementById('shops-table')
allShops
allShops.length
```

---

## 🎯 **예상 문제 및 해결**

### 문제 1: 섹션이 숨겨져 있음
```javascript
// 해결: 수동으로 표시
document.getElementById('shops-section').classList.remove('hidden')
```

### 문제 2: 테이블이 비어있음
```javascript
// 해결: 강제 렌더링
displayShops(allShops)
```

### 문제 3: 데이터가 로드되지 않음
```javascript
// 해결: 수동 로드
loadShops()
```

---

## 📦 배포 파일
- ✅ `admin-dashboard.html` (버전 업데이트)
- ✅ `js/admin-dashboard.js` (디버깅 로그 추가)
- ✅ `DEBUG_SECTION_SWITCHING_v2.8.13.6.98.md` (이 문서)

---

## 📋 배포 히스토리

| 버전 | 날짜 | 변경사항 | 상태 |
|------|------|---------|------|
| **v2.8.13.6.98** | 01/30 | 섹션 전환 디버깅 | 🚀 **푸시 대기** |
| v2.8.13.6.97 | 01/30 | naver_cafe_id 제거 | ✅ 완료 |
| v2.8.13.6.96 | 12/30 | 사용자 삭제 기능 | ✅ 완료 |

---

## 🔮 다음 단계

### 1. 로그 수집
- 배포 후 콘솔 로그 전체 복사
- 문제 발생 위치 파악

### 2. 원인 분석
- 로그를 기반으로 문제 원인 파악
- 추가 수정 필요시 v2.8.13.6.99 배포

### 3. 최종 수정
- 근본 원인 해결
- 안정적인 샵 입점 관리 기능 완성

---

**배포 후 "샵 입점 관리" 클릭 시 콘솔 로그를 전체 복사해서 공유해 주세요!** 🔍
