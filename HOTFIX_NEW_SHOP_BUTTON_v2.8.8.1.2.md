# 🚨 HOTFIX: 신규 샵 등록 버튼 추가

**버전**: v2.8.8.1.2  
**날짜**: 2026-01-09  
**긴급도**: High  
**작업 시간**: 10분

---

## 📋 문제 요약

### 발견된 문제
1. **신규 샵 등록 버튼 없음**: Admin Dashboard → 업체 관리에서 "신규 샵 등록" 버튼이 보이지 않음
2. **미료쿠 확인 불가**: 사용자 타입을 "고객 → 업체"로 변경했지만, 샵 정보가 없어서 확인 불가

### 원인 분석
```html
<!-- Line 298-305: "새로고침" 버튼만 있고 "신규 샵 등록" 버튼이 없음 -->
<div class="mb-6 flex justify-between items-center">
    <div>
        <h2 class="text-2xl font-bold text-gray-900">샵 관리</h2>
    </div>
    <button onclick="refreshShops()">새로고침</button>  ❌ 신규 등록 버튼 없음!
</div>
```

---

## ✅ 수정 내용

### 1. "신규 샵 등록" 버튼 추가 (Line 298-311)

#### Before:
```html
<button onclick="refreshShops()" class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
    <i class="fas fa-refresh mr-2"></i>새로고침
</button>
```

#### After:
```html
<div class="flex gap-3">
    <button onclick="openNewShopModal()" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
        <i class="fas fa-plus mr-2"></i>신규 샵 등록
    </button>
    <button onclick="refreshShops()" class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
        <i class="fas fa-refresh mr-2"></i>새로고침
    </button>
</div>
```

### 2. 모달 제어 함수 추가 (Line 1748 앞)

```javascript
// 신규 샵 등록 모달 열기/닫기
function openNewShopModal() {
    const modal = document.getElementById('new-shop-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        modal.style.display = 'flex';
        
        // 폼 초기화
        const form = document.getElementById('new-shop-form');
        if (form) {
            form.reset();
        }
        
        console.log('✅ 신규 샵 등록 모달 열림');
    }
}

function closeNewShopModal() {
    const modal = document.getElementById('new-shop-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        modal.style.display = 'none';
        
        console.log('✅ 신규 샵 등록 모달 닫힘');
    }
}
```

### 3. 신규 샵 등록 처리 함수 추가

```javascript
// 신규 샵 등록 처리
async function handleNewShopSubmit(event) {
    event.preventDefault();
    
    console.log('🏪 신규 샵 등록 시작...');
    
    try {
        // 1. Users 테이블에 사용자 등록 (user_type: 'shop')
        const userResponse = await fetch('tables/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: ownerName,
                email: email,
                password: password,
                phone: phone,
                user_type: 'shop'  // 업체로 등록
            })
        });
        
        // 2. Skincare_shops 테이블에 샵 등록
        const shopResponse = await fetch('tables/skincare_shops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: shopName,
                shop_name: shopName,
                owner_name: ownerName,
                state: state,
                district: district,
                address: address,
                phone: phone,
                email: email,
                business_number: businessNumber,
                license_number: licenseNumber,
                naver_cafe_id: naverId,
                status: 'active',
                is_active: true,
                verified: true
            })
        });
        
        alert(`✅ "${shopName}" 샵이 성공적으로 등록되었습니다!`);
        closeNewShopModal();
        loadShops(); // 목록 새로고침
        
    } catch (error) {
        console.error('❌ 신규 샵 등록 오류:', error);
        alert('샵 등록 중 오류가 발생했습니다.\n\n' + error.message);
    }
}
```

### 4. 폼에 submit 이벤트 추가 (Line 2248)

#### Before:
```html
<form id="new-shop-form" class="p-6 space-y-4">
```

#### After:
```html
<form id="new-shop-form" onsubmit="handleNewShopSubmit(event)" class="p-6 space-y-4">
```

---

## 📁 수정된 파일

### admin-dashboard.html
- **Line 298-311**: "신규 샵 등록" 버튼 추가
- **Line 1748 앞**: 모달 제어 함수 추가 (openNewShopModal, closeNewShopModal)
- **Line 1748 앞**: 신규 샵 등록 처리 함수 추가 (handleNewShopSubmit)
- **Line 2248**: 폼에 onsubmit 이벤트 추가

---

## 🧪 테스트 방법

### 미료쿠 샵 등록 절차

1. **Admin Dashboard 접속**
   ```
   https://beautycat.kr/admin-dashboard.html
   ```

2. **업체 관리 탭 클릭**
   - 좌측 메뉴에서 "샵 관리" 클릭

3. **"신규 샵 등록" 버튼 확인**
   - 우측 상단에 녹색 버튼 "신규 샵 등록" 표시 확인

4. **신규 샵 등록 모달 열기**
   - "신규 샵 등록" 버튼 클릭
   - 모달 창이 열리는지 확인

5. **미료쿠 샵 정보 입력**
   ```
   업체명: 미료쿠
   시/도: (선택)
   구/군: (선택)
   상세 주소: (입력)
   
   대표자명: 미료쿠
   전화번호: (입력)
   이메일: (미료쿠의 이메일 - users 테이블에서 확인)
   비밀번호: (동일한 비밀번호)
   
   사업자등록번호: (입력)
   영업신고번호: (선택사항)
   네이버 카페 ID: (선택사항)
   ```

6. **등록하기 버튼 클릭**
   - 성공 메시지 확인: "✅ '미료쿠' 샵이 성공적으로 등록되었습니다!"

7. **샵 목록에서 확인**
   - 업체 관리 목록에서 "미료쿠" 샵이 표시되는지 확인
   - 상태: "승인됨" (active)

---

## 📊 예상 결과

### Before:
```
❌ "신규 샵 등록" 버튼 없음
❌ 미료쿠 확인 불가 (샵 정보 없음)
```

### After:
```
✅ "신규 샵 등록" 버튼 표시
✅ 미료쿠 샵 등록 가능
✅ 업체 관리 목록에서 미료쿠 확인 가능
```

---

## 🎯 미료쿠 문제 해결

### 문제 상황
1. **사용자 테이블**: 미료쿠가 "업체" 타입으로 변경됨 ✅
2. **샵 테이블**: 미료쿠의 샵 정보가 없음 ❌

### 해결 방법
1. **"신규 샵 등록" 버튼** 사용
2. **미료쿠 샵 정보 입력** (이메일 일치 필수!)
3. **등록 완료** → 업체 대시보드 접근 가능

### 중요 사항
- ⚠️ **이메일 일치**: 샵 등록 시 이메일이 사용자 테이블의 이메일과 **정확히 일치**해야 함
- ⚠️ **비밀번호 동기화**: 동일한 비밀번호 사용 권장
- ✅ **자동 연결**: 이메일이 일치하면 자동으로 사용자와 샵이 연결됨

---

## 🚀 배포 정보

### Git 커밋 메시지
```bash
fix: 신규 샵 등록 버튼 및 기능 추가 (v2.8.8.1.2)

- "신규 샵 등록" 버튼 추가 (업체 관리 페이지)
- openNewShopModal/closeNewShopModal 함수 추가
- handleNewShopSubmit 함수 추가 (사용자 + 샵 동시 등록)
- 미료쿠 샵 등록 가능
```

### 배포 명령어
```bash
git add admin-dashboard.html HOTFIX_NEW_SHOP_BUTTON_v2.8.8.1.2.md
git commit -m "fix: 신규 샵 등록 버튼 및 기능 추가 (v2.8.8.1.2)"
git push origin main
```

---

## ✅ 체크리스트

### 배포 전
- [x] "신규 샵 등록" 버튼 추가
- [x] openNewShopModal 함수 추가
- [x] closeNewShopModal 함수 추가
- [x] handleNewShopSubmit 함수 추가
- [x] 폼에 onsubmit 이벤트 추가
- [x] HOTFIX 문서 작성

### 배포 후
- [ ] Cloudflare 캐시 삭제
- [ ] "신규 샵 등록" 버튼 표시 확인
- [ ] 모달 열기/닫기 테스트
- [ ] 미료쿠 샵 등록 테스트
- [ ] 업체 목록에서 미료쿠 확인

---

## 📞 문의

**BeautyCat 프로젝트**  
- 🌐 https://beautycat.kr
- 🔧 관리자 대시보드: https://beautycat.kr/admin-dashboard.html
- 📧 admin@beautycat.kr

---

**작성일**: 2026-01-09  
**버전**: v2.8.8.1.2  
**상태**: 수정 완료, 배포 준비
