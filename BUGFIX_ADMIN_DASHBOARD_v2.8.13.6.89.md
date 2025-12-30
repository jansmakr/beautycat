# 🔧 BUGFIX: 관리자 대시보드 3개 버그 수정 v2.8.13.6.89

**배포 일시**: 2025-12-29  
**배포 버전**: v2.8.13.6.89  
**주요 변경**: 관리자 대시보드 안정성 개선

---

## 🐛 **수정된 버그**

### **1️⃣ updateDistricts is not defined**

**증상**
```javascript
Uncaught ReferenceError: updateDistricts is not defined
    at HTMLSelectElement.onchange (admin-dashboard:1910:153)
```

**원인**
- `admin-dashboard.html`에서 `onchange="updateDistricts()"`로 호출
- `js/admin-dashboard.js`에 함수가 정의되지 않음

**해결**
```javascript
// js/admin-dashboard.js (새로 추가)

// 지역 데이터
const districtsByState = {
    '서울': ['강남구', '강동구', '강북구', ...],
    '부산': ['강서구', '금정구', '남구', ...],
    // ... 전국 시/도별 구/군 데이터
};

// updateDistricts 함수
function updateDistricts() {
    const stateSelect = document.getElementById('new-shop-state');
    const districtSelect = document.getElementById('new-shop-district');
    
    const selectedState = stateSelect.value;
    
    // 구/군 초기화
    districtSelect.innerHTML = '<option value="">선택하세요</option>';
    
    if (selectedState && districtsByState[selectedState]) {
        const districts = districtsByState[selectedState];
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
        districtSelect.disabled = false;
    } else {
        districtSelect.disabled = true;
    }
}

// 전역 접근 허용
window.updateDistricts = updateDistricts;
```

---

### **2️⃣ UNIQUE constraint failed: users.email**

**증상**
```javascript
Shop registration error: Error: 사용자 계정 생성 실패
D1_ERROR: UNIQUE constraint failed: users.email: SQLITE_CONSTRAINT
```

**원인**
- 이미 존재하는 이메일로 업체 등록 시도
- 사전 중복 체크 없음

**해결**
```javascript
// js/admin-dashboard.js (line 2533 이전에 추가)

// 중복 이메일 체크
try {
    const checkResponse = await fetch(`tables/users?limit=1000`);
    const checkData = await checkResponse.json();
    const existingUser = checkData.data.find(u => 
        u.email && u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingUser) {
        alert('이미 등록된 이메일입니다. 다른 이메일을 사용해주세요.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        return;
    }
} catch (checkError) {
    console.warn('이메일 중복 체크 실패:', checkError);
}

// Step 1: Create user account (기존 로직)
```

---

### **3️⃣ originalBtnText is not defined**

**증상**
```javascript
Uncaught (in promise) ReferenceError: originalBtnText is not defined
    at HTMLFormElement.<anonymous> (admin-dashboard.js:2622:39)
```

**원인**
- `try` 블록에서 선언된 `originalBtnText` 변수
- `catch` 블록에서 접근 불가 (스코프 문제)

**해결**
```javascript
// js/admin-dashboard.js

// Before (문제)
try {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML; // try 블록 내 선언
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>등록 중...';
    
    // ... 로직
    
} catch (error) {
    console.error('Shop registration error:', error);
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText; // ❌ 접근 불가
}

// After (해결)
try {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.dataset.originalText = originalBtnText; // ✅ 데이터 속성에 저장
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>등록 중...';
    
    // ... 로직
    
} catch (error) {
    console.error('Shop registration error:', error);
    
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        // ✅ 데이터 속성에서 복원
        if (typeof submitBtn.dataset.originalText !== 'undefined') {
            submitBtn.innerHTML = submitBtn.dataset.originalText;
        } else {
            submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>업체 등록';
        }
    }
}
```

---

## 📦 **배포 파일**

```
js/admin-dashboard.js
BUGFIX_ADMIN_DASHBOARD_v2.8.13.6.89.md
```

---

## 💻 **Git 배포 명령어**

```bash
cd /d/beautycat && git add js/admin-dashboard.js BUGFIX_ADMIN_DASHBOARD_v2.8.13.6.89.md && git commit -m "🔧 BUGFIX v2.8.13.6.89 - 관리자 대시보드 3개 버그 수정

🐛 버그 수정
1. updateDistricts() 함수 추가
   - 시/도 선택 시 구/군 자동 업데이트
   - 전국 시/도별 구/군 데이터 포함
   
2. 중복 이메일 체크 추가
   - 업체 등록 전 이메일 중복 검사
   - 사용자 친화적 에러 메시지
   
3. originalBtnText 스코프 수정
   - 버튼 텍스트를 dataset에 저장
   - catch 블록에서 안전하게 복원

✅ 효과
- 관리자 대시보드 안정성 개선
- 업체 등록 프로세스 개선
- 에러 핸들링 강화" && git push origin main
```

---

## 🔍 **배포 후 확인**

1. **Cloudflare 배포 대기** (2-5분)
2. **관리자 대시보드 접속**
   ```
   https://beautycat.kr/admin-dashboard.html
   또는
   https://beautyket.com/admin-dashboard.html
   ```
3. **새 업체 등록 테스트**
   - "새 업체 등록" 버튼 클릭
   - 시/도 선택 → 구/군 자동 업데이트 확인 ✅
   - 중복 이메일 입력 → 경고 메시지 확인 ✅
   - 등록 실패 시 버튼 복원 확인 ✅

4. **Chrome DevTools 콘솔 확인**
   ```javascript
   // 예상 로그 (에러 없음)
   ✅ 관리자 인증 성공
   👥 사용자 수: 24 명
   New shop modal opened
   ```

---

## 📊 **배포 히스토리**

| 버전 | 날짜 | 주요 변경 | 상태 |
|------|------|----------|------|
| v2.8.13.6.85 | 12/29 | Lighthouse 최적화 | ✅ 완료 |
| v2.8.13.6.86 | 12/29 | SEO 헤더 최적화 | ✅ 완료 |
| v2.8.13.6.87 | 12/29 | 로그인 중 표시 수정 | ✅ 완료 |
| v2.8.13.6.88 | 12/29 | 500 에러 제거 | ✅ 완료 |
| **v2.8.13.6.89** | **12/29** | **관리자 대시보드 버그 수정** | **⏳ 배포 준비** |

---

**배포 담당자**: AI Assistant  
**배포 승인자**: 사용자  
**배포 상태**: 준비 완료 ✅
