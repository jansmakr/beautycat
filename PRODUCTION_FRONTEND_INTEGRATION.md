# 🔌 BeautyCat 프론트엔드 - D1 API 완전 통합 가이드

**목적**: 기존 프론트엔드 코드를 Cloudflare D1 API와 연결하여 상용화  
**소요 시간**: 약 15-20분  
**난이도**: ⭐⭐ (중급)

---

## 📊 현재 상태

### ✅ 완료된 작업
```
✅ Cloudflare Workers API 배포 완료
✅ D1 데이터베이스 (10개 테이블) 생성 완료
✅ RESTful CRUD API 정상 작동 확인
✅ deploy-ready-config.js API URL 수정 완료
```

### 🎯 이제 할 작업
```
1. 기존 JavaScript 파일들을 API와 연동
2. 로컬 스토리지 대신 D1 데이터베이스 사용
3. 실제 데이터 CRUD 작업 구현
```

---

## 🔧 Step 1: 글로벌 API 헬퍼 함수 생성

### js/api-helper.js 파일 생성

```javascript
/**
 * BeautyCat API Helper
 * Cloudflare D1 데이터베이스 연동
 */

const API = {
    BASE_URL: 'https://beautycat-api.jansmakr.workers.dev/api',
    
    // 공통 헤더
    headers: {
        'Content-Type': 'application/json'
    },
    
    // 에러 처리
    handleError(error, context) {
        console.error(`API Error (${context}):`, error);
        return {
            success: false,
            error: error.message || '알 수 없는 오류가 발생했습니다.'
        };
    },
    
    // GET 요청
    async get(endpoint, params = {}) {
        try {
            const url = new URL(`${this.BASE_URL}/tables/${endpoint}`);
            Object.keys(params).forEach(key => 
                url.searchParams.append(key, params[key])
            );
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { success: true, data };
            
        } catch (error) {
            return this.handleError(error, `GET ${endpoint}`);
        }
    },
    
    // POST 요청 (데이터 생성)
    async create(endpoint, data) {
        try {
            const response = await fetch(`${this.BASE_URL}/tables/${endpoint}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    ...data,
                    created_at: Date.now(),
                    updated_at: Date.now()
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return { success: true, data: result };
            
        } catch (error) {
            return this.handleError(error, `POST ${endpoint}`);
        }
    },
    
    // PUT 요청 (데이터 수정)
    async update(endpoint, id, data) {
        try {
            const response = await fetch(`${this.BASE_URL}/tables/${endpoint}/${id}`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify({
                    ...data,
                    updated_at: Date.now()
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return { success: true, data: result };
            
        } catch (error) {
            return this.handleError(error, `PUT ${endpoint}/${id}`);
        }
    },
    
    // DELETE 요청 (데이터 삭제)
    async delete(endpoint, id) {
        try {
            const response = await fetch(`${this.BASE_URL}/tables/${endpoint}/${id}`, {
                method: 'DELETE',
                headers: this.headers
            });
            
            if (!response.ok && response.status !== 204) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return { success: true };
            
        } catch (error) {
            return this.handleError(error, `DELETE ${endpoint}/${id}`);
        }
    },
    
    // Health Check
    async checkHealth() {
        try {
            const response = await fetch(`${this.BASE_URL}/health`);
            if (!response.ok) {
                throw new Error('API is not healthy');
            }
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return this.handleError(error, 'Health Check');
        }
    }
};

// 전역 사용을 위해 window 객체에 추가
if (typeof window !== 'undefined') {
    window.API = API;
}
```

---

## 📝 Step 2: 주요 기능별 API 연동

### 1. 사용자 회원가입 (register.html, login.html)

```javascript
// 회원가입 폼 처리
async function handleRegister(event) {
    event.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        password: await hashPassword(document.getElementById('password').value),
        name: document.getElementById('name').value,
        user_type: document.getElementById('userType').value, // 'customer' or 'shop'
        phone: document.getElementById('phone').value,
        status: 'active',
        email_verified: 0,
        phone_verified: 0
    };
    
    // API 호출
    const result = await API.create('users', formData);
    
    if (result.success) {
        alert('회원가입이 완료되었습니다!');
        window.location.href = 'login.html';
    } else {
        alert(`회원가입 실패: ${result.error}`);
    }
}

// 비밀번호 해싱
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 로그인 처리
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = await hashPassword(document.getElementById('password').value);
    
    // 사용자 조회
    const result = await API.get('users', { limit: 100 });
    
    if (result.success) {
        const user = result.data.data.find(u => 
            u.email === email && u.password === password
        );
        
        if (user) {
            // 로그인 성공
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // 사용자 타입별 리다이렉트
            if (user.user_type === 'customer') {
                window.location.href = 'customer-dashboard.html';
            } else if (user.user_type === 'shop') {
                window.location.href = 'shop-dashboard.html';
            } else if (user.user_type === 'admin') {
                window.location.href = 'admin-dashboard.html';
            }
        } else {
            alert('이메일 또는 비밀번호가 일치하지 않습니다.');
        }
    } else {
        alert(`로그인 실패: ${result.error}`);
    }
}
```

### 2. 상담 신청 (index.html)

```javascript
// 상담 신청 폼 처리
async function handleConsultation(event) {
    event.preventDefault();
    
    const formData = {
        customer_name: document.getElementById('customerName').value,
        customer_phone: document.getElementById('customerPhone').value,
        customer_email: document.getElementById('customerEmail').value,
        state: document.getElementById('state').value,
        district: document.getElementById('district').value,
        treatment_types: JSON.stringify(getSelectedTreatments()),
        skin_concerns: JSON.stringify(getSelectedConcerns()),
        age_range: document.getElementById('ageRange').value,
        budget_range: document.getElementById('budgetRange').value,
        preferred_schedule: document.getElementById('schedule').value,
        additional_notes: document.getElementById('notes').value,
        status: 'pending',
        submission_date: new Date().toISOString()
    };
    
    // API 호출
    const result = await API.create('consultations', formData);
    
    if (result.success) {
        alert('상담 신청이 완료되었습니다! 곧 연락드리겠습니다.');
        document.getElementById('consultationForm').reset();
        
        // 통계 기록
        await logCallStatistics({
            action: 'consultation_submitted',
            customer_region: `${formData.state} ${formData.district}`
        });
    } else {
        alert(`상담 신청 실패: ${result.error}`);
    }
}

// 선택된 치료 타입 가져오기
function getSelectedTreatments() {
    const checkboxes = document.querySelectorAll('input[name="treatment"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// 선택된 피부 고민 가져오기
function getSelectedConcerns() {
    const checkboxes = document.querySelectorAll('input[name="concern"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}
```

### 3. 피부관리실 등록 (shop-registration.html)

```javascript
// 샵 등록 폼 처리
async function handleShopRegistration(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('shopName').value,
        owner_name: document.getElementById('ownerName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        state: document.getElementById('state').value,
        district: document.getElementById('district').value,
        services: JSON.stringify(getSelectedServices()),
        description: document.getElementById('description').value,
        business_number: document.getElementById('businessNumber').value,
        status: 'pending', // 관리자 승인 대기
        price_range: document.getElementById('priceRange').value,
        operating_hours: JSON.stringify(getOperatingHours())
    };
    
    // API 호출
    const result = await API.create('skincare_shops', formData);
    
    if (result.success) {
        alert('샵 등록 신청이 완료되었습니다! 관리자 승인 후 활성화됩니다.');
        window.location.href = 'index.html';
    } else {
        alert(`샵 등록 실패: ${result.error}`);
    }
}

// 선택된 서비스 가져오기
function getSelectedServices() {
    const checkboxes = document.querySelectorAll('input[name="service"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// 운영 시간 가져오기
function getOperatingHours() {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const hours = {};
    
    days.forEach(day => {
        const openInput = document.getElementById(`${day}Open`);
        const closeInput = document.getElementById(`${day}Close`);
        
        if (openInput && closeInput) {
            hours[day] = `${openInput.value}-${closeInput.value}`;
        } else {
            hours[day] = 'closed';
        }
    });
    
    return hours;
}
```

### 4. 고객 대시보드 (customer-dashboard.html)

```javascript
// 대시보드 초기화
async function initCustomerDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.user_type !== 'customer') {
        window.location.href = 'login.html';
        return;
    }
    
    // 사용자 정보 표시
    document.getElementById('userName').textContent = currentUser.name;
    
    // 내 상담 내역 불러오기
    await loadMyConsultations(currentUser.email);
    
    // 공지사항 불러오기
    await loadAnnouncements();
}

// 내 상담 내역 불러오기
async function loadMyConsultations(email) {
    const result = await API.get('consultations', { limit: 100 });
    
    if (result.success) {
        // 내 이메일로 필터링
        const myConsultations = result.data.data.filter(c => 
            c.customer_email === email
        );
        
        // 화면에 표시
        displayConsultations(myConsultations);
    } else {
        console.error('상담 내역 로드 실패:', result.error);
    }
}

// 상담 내역 화면 표시
function displayConsultations(consultations) {
    const container = document.getElementById('consultationsContainer');
    
    if (consultations.length === 0) {
        container.innerHTML = '<p>상담 신청 내역이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = consultations.map(c => `
        <div class="consultation-card">
            <h3>${c.customer_name}님의 상담</h3>
            <p>지역: ${c.state} ${c.district}</p>
            <p>신청일: ${new Date(c.created_at).toLocaleDateString()}</p>
            <p>상태: <span class="status-${c.status}">${getStatusText(c.status)}</span></p>
            <button onclick="viewConsultationDetail('${c.id}')">상세보기</button>
        </div>
    `).join('');
}

// 상태 텍스트 변환
function getStatusText(status) {
    const statusMap = {
        'pending': '대기 중',
        'in_progress': '진행 중',
        'matched': '매칭 완료',
        'completed': '완료',
        'cancelled': '취소'
    };
    return statusMap[status] || status;
}
```

### 5. 업체 대시보드 (shop-dashboard.html)

```javascript
// 업체 대시보드 초기화
async function initShopDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.user_type !== 'shop') {
        window.location.href = 'login.html';
        return;
    }
    
    // 내 샵 정보 불러오기
    await loadMyShopInfo(currentUser.shop_id);
    
    // 매칭된 상담 불러오기
    await loadMatchedConsultations(currentUser.shop_id);
}

// 내 샵 정보 불러오기
async function loadMyShopInfo(shopId) {
    const result = await API.get('skincare_shops', { limit: 100 });
    
    if (result.success) {
        const myShop = result.data.data.find(s => s.id === shopId);
        
        if (myShop) {
            displayShopInfo(myShop);
        }
    }
}

// 견적서 보내기
async function sendQuote(consultationId, quoteData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const formData = {
        consultation_id: consultationId,
        shop_id: currentUser.shop_id,
        shop_name: currentUser.name,
        treatment_details: JSON.stringify(quoteData.treatments),
        price: quoteData.price,
        duration: quoteData.duration,
        available_dates: JSON.stringify(quoteData.dates),
        additional_notes: quoteData.notes,
        status: 'sent',
        valid_until: quoteData.validUntil
    };
    
    const result = await API.create('quotes', formData);
    
    if (result.success) {
        alert('견적서가 전송되었습니다!');
        await loadMatchedConsultations(currentUser.shop_id);
    } else {
        alert(`견적서 전송 실패: ${result.error}`);
    }
}
```

### 6. 관리자 대시보드 (admin-dashboard.html)

```javascript
// 관리자 대시보드 초기화
async function initAdminDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.user_type !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
    
    // 전체 통계 불러오기
    await loadStatistics();
    
    // 승인 대기 샵 불러오기
    await loadPendingShops();
    
    // 최근 상담 불러오기
    await loadRecentConsultations();
}

// 통계 불러오기
async function loadStatistics() {
    try {
        const [users, shops, consultations] = await Promise.all([
            API.get('users', { limit: 1000 }),
            API.get('skincare_shops', { limit: 1000 }),
            API.get('consultations', { limit: 1000 })
        ]);
        
        if (users.success && shops.success && consultations.success) {
            document.getElementById('totalUsers').textContent = users.data.total;
            document.getElementById('totalShops').textContent = shops.data.total;
            document.getElementById('totalConsultations').textContent = consultations.data.total;
        }
    } catch (error) {
        console.error('통계 로드 실패:', error);
    }
}

// 샵 승인 처리
async function approveShop(shopId) {
    const result = await API.update('skincare_shops', shopId, {
        status: 'active'
    });
    
    if (result.success) {
        alert('샵이 승인되었습니다!');
        await loadPendingShops();
    } else {
        alert(`샵 승인 실패: ${result.error}`);
    }
}

// 샵 거부 처리
async function rejectShop(shopId, reason) {
    const result = await API.update('skincare_shops', shopId, {
        status: 'rejected'
    });
    
    if (result.success) {
        alert('샵 신청이 거부되었습니다.');
        await loadPendingShops();
    } else {
        alert(`샵 거부 실패: ${result.error}`);
    }
}
```

### 7. 전화상담 통계 기록 (전역)

```javascript
// 전화상담 버튼 클릭 시
async function logCallStatistics(data) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const statData = {
        action: data.action || 'phone_call',
        shop_id: data.shop_id || null,
        shop_name: data.shop_name || null,
        phone_number: data.phone_number || null,
        customer_region: data.customer_region || null,
        user_agent: navigator.userAgent,
        user_id: currentUser.id || null,
        session_id: localStorage.getItem('sessionId') || generateSessionId(),
        success: 1
    };
    
    await API.create('call_statistics', statData);
}

// 세션 ID 생성
function generateSessionId() {
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
    return sessionId;
}

// 전화 버튼에 이벤트 추가
document.querySelectorAll('.call-button').forEach(button => {
    button.addEventListener('click', function() {
        const shopId = this.dataset.shopId;
        const shopName = this.dataset.shopName;
        const phoneNumber = this.dataset.phone;
        
        logCallStatistics({
            action: 'phone_call_clicked',
            shop_id: shopId,
            shop_name: shopName,
            phone_number: phoneNumber
        });
    });
});
```

---

## 🎨 Step 3: HTML 파일 수정

### 모든 HTML 파일의 <head>에 추가

```html
<!-- Cloudflare D1 API 설정 -->
<script src="deploy-ready-config.js"></script>
<script src="js/api-helper.js"></script>
```

### 예시: index.html

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>beautycat - 피부관리실 견적 플랫폼</title>
    
    <!-- API 설정 (가장 먼저 로드) -->
    <script src="deploy-ready-config.js"></script>
    <script src="js/api-helper.js"></script>
    
    <!-- 기존 스타일시트 및 스크립트 -->
    <link rel="stylesheet" href="css/style.css">
    ...
</head>
<body>
    ...
</body>
</html>
```

---

## ✅ Step 4: 테스트

### 1. Health Check 테스트

브라우저 콘솔에서:
```javascript
API.checkHealth().then(result => console.log(result));
// 예상: {success: true, data: {status: "healthy", ...}}
```

### 2. 데이터 조회 테스트

```javascript
// 샵 목록 조회
API.get('skincare_shops', { limit: 10 }).then(result => console.log(result));

// 상담 목록 조회
API.get('consultations', { limit: 10 }).then(result => console.log(result));

// 사용자 목록 조회
API.get('users', { limit: 10 }).then(result => console.log(result));
```

### 3. 데이터 생성 테스트

```javascript
// 테스트 사용자 생성
API.create('users', {
    email: 'test@beautycat.kr',
    password: 'hashed_password',
    name: '테스트 사용자',
    user_type: 'customer',
    phone: '010-0000-0000',
    status: 'active'
}).then(result => console.log(result));
```

---

## 🚀 Step 5: 배포

### GitHub에 Push

```bash
git add .
git commit -m "Integrate Cloudflare D1 API with frontend"
git push origin main
```

### Cloudflare Pages 자동 배포

- GitHub push 후 자동으로 beautycat-v2.pages.dev에 배포됩니다
- 2-3분 대기 후 beautycat.kr에서 확인

---

## 📋 최종 체크리스트

### 설정 파일
- [ ] deploy-ready-config.js API URL 수정 완료
- [ ] js/api-helper.js 파일 생성 완료

### HTML 파일
- [ ] index.html에 API 스크립트 추가
- [ ] register.html에 API 스크립트 추가
- [ ] login.html에 API 스크립트 추가
- [ ] customer-dashboard.html에 API 스크립트 추가
- [ ] shop-dashboard.html에 API 스크립트 추가
- [ ] admin-dashboard.html에 API 스크립트 추가
- [ ] shop-registration.html에 API 스크립트 추가

### 기능 연동
- [ ] 회원가입 API 연동
- [ ] 로그인 API 연동
- [ ] 상담 신청 API 연동
- [ ] 샵 등록 API 연동
- [ ] 대시보드 데이터 로드 연동
- [ ] 전화상담 통계 기록 연동

### 테스트
- [ ] Health Check 성공
- [ ] 데이터 조회 성공
- [ ] 데이터 생성 성공
- [ ] 실제 회원가입 테스트
- [ ] 실제 로그인 테스트
- [ ] 실제 상담 신청 테스트

---

## 🎉 완료!

모든 단계를 완료하면:

✅ **프론트엔드가 Cloudflare D1 데이터베이스와 완전히 연동됩니다!**  
✅ **사용자, 샵, 상담 데이터가 실제로 저장됩니다!**  
✅ **상용화 준비가 완료됩니다!**

---

**다음 문서**: PRODUCTION_LAUNCH_CHECKLIST.md (최종 런칭 체크리스트)
