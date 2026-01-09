# 🚨 HOTFIX: 신규 샵 등록 - 구/군 드롭다운 수정

**버전**: v2.8.8.1.3  
**날짜**: 2026-01-09  
**긴급도**: Critical  
**작업 시간**: 5분

---

## 📋 문제 요약

### 발견된 문제
- **시/군/구 선택 불가**: 신규 샵 등록 모달에서 시/도를 선택해도 구/군 드롭다운이 "선택하세요"로 비활성화됨

### 원인 분석
```html
<!-- Line 2270: onchange 이벤트는 있지만 함수가 없음 -->
<select id="new-shop-state" required onchange="updateDistricts()">
    <!-- ❌ updateDistricts() 함수가 정의되지 않음 -->
</select>
```

---

## ✅ 수정 내용

### updateDistricts() 함수 추가 (Line 1869 앞)

```javascript
// 신규 샵 등록 폼: 시/도 선택 시 구/군 업데이트
function updateDistricts() {
    const stateSelect = document.getElementById('new-shop-state');
    const districtSelect = document.getElementById('new-shop-district');
    
    const selectedState = stateSelect.value;
    console.log('🏙️ 시/도 선택됨:', selectedState);
    
    // 구/군 초기화
    districtSelect.innerHTML = '<option value="">선택하세요</option>';
    districtSelect.disabled = true;
    
    if (!selectedState) return;
    
    // 시/도 매핑 (약어 → 전체 이름)
    const stateMapping = {
        '서울': '서울특별시',
        '부산': '부산광역시',
        '대구': '대구광역시',
        '인천': '인천광역시',
        '광주': '광주광역시',
        '대전': '대전광역시',
        '울산': '울산광역시',
        '세종': '세종특별자치시',
        '경기': '경기도',
        '강원': '강원특별자치도',
        '충북': '충청북도',
        '충남': '충청남도',
        '전북': '전북특별자치도',
        '전남': '전라남도',
        '경북': '경상북도',
        '경남': '경상남도',
        '제주': '제주특별자치도'
    };
    
    const fullStateName = stateMapping[selectedState] || selectedState;
    const districts = window.KOREA_TOWN_DATA[fullStateName];
    
    if (!districts) {
        console.error('❌ 해당 시/도의 구/군 데이터가 없음:', fullStateName);
        return;
    }
    
    // 구/군 옵션 추가
    const districtNames = Object.keys(districts);
    districtNames.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });
    
    districtSelect.disabled = false;
    console.log(`✅ ${districtNames.length}개 구/군 로드 완료`);
}
```

---

## 📁 수정된 파일

### admin-dashboard.html
- **Line 1869 앞**: `updateDistricts()` 함수 추가

---

## 🧪 테스트 방법

### 1. 신규 샵 등록 모달 열기
```
Admin Dashboard → 업체 관리 → "신규 샵 등록" 버튼 클릭
```

### 2. 시/도 선택
```
시/도 드롭다운에서 "경기" 선택
→ 콘솔 로그: "🏙️ 시/도 선택됨: 경기"
→ 콘솔 로그: "✅ 31개 구/군 로드 완료"
```

### 3. 구/군 확인
```
시/군/구 드롭다운 활성화 확인
→ "수원시", "성남시", "고양시" 등 31개 옵션 표시
```

### 4. 다른 시/도 테스트
```
시/도: "서울" 선택
→ 시/군/구: "강남구", "서초구", "송파구" 등 25개 옵션 표시

시/도: "제주" 선택
→ 시/군/구: "제주시", "서귀포시" 2개 옵션 표시
```

---

## 📊 예상 결과

### Before:
```
시/도: "경기" 선택
→ 시/군/구: "선택하세요" (비활성화) ❌
```

### After:
```
시/도: "경기" 선택
→ 콘솔: "🏙️ 시/도 선택됨: 경기"
→ 콘솔: "✅ 31개 구/군 로드 완료"
→ 시/군/구: 31개 옵션 표시 (활성화) ✅
```

---

## 🚀 배포 정보

### Git 커밋 메시지
```bash
fix: 신규 샵 등록 - 구/군 드롭다운 활성화 (v2.8.8.1.3)

- updateDistricts() 함수 추가
- 시/도 선택 시 구/군 자동 로드
- 시/도 약어 → 전체 이름 매핑
```

### 배포 명령어
```bash
git add admin-dashboard.html HOTFIX_DISTRICT_DROPDOWN_v2.8.8.1.3.md README.md
git commit -m "fix: 신규 샵 등록 - 구/군 드롭다운 활성화 (v2.8.8.1.3)"
git push origin main
```

---

## ✅ 체크리스트

### 배포 전
- [x] updateDistricts() 함수 추가
- [x] HOTFIX 문서 작성
- [x] README 업데이트

### 배포 후
- [ ] Cloudflare 캐시 삭제
- [ ] 신규 샵 등록 모달 테스트
- [ ] 시/도 선택 시 구/군 로드 확인
- [ ] 미료쿠 샵 등록 완료

---

## 📞 문의

**BeautyCat 프로젝트**  
- 🌐 https://beautycat.kr
- 🔧 관리자 대시보드: https://beautycat.kr/admin-dashboard.html
- 📧 admin@beautycat.kr

---

**작성일**: 2026-01-09  
**버전**: v2.8.8.1.3  
**상태**: 수정 완료, 배포 준비
