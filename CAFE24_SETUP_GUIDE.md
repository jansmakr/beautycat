# 🏪 카페24 뽀샵 자동 입력 설치 가이드

## 📋 개요
뽀샵에서 카페24 자사몰로 고객정보를 자동으로 전송하여 주문폼에 자동 입력하는 시스템 설치 가이드입니다.

---

## 1️⃣ 카페24 관리자 설정

### 🔧 **Step 1: 카페24 관리자 로그인**
1. 카페24 관리자 페이지 접속: `https://yourmall.cafe24.com/admin`
2. 관리자 계정으로 로그인

### 🔧 **Step 2: 스크립트 설치 위치**

#### **방법 A: 전체 쇼핑몰 적용**
```
카페24 관리자 → 쇼핑몰 설정 → 기본설정 → 추가 스크립트 → </head> 위
```

#### **방법 B: 특정 페이지만 적용**
```
카페24 관리자 → 디자인 관리 → 스킨 관리 → PC 쇼핑몰 → 편집
→ 다음 파일들에 스크립트 추가:
  - product/detail.html (상품 상세페이지)
  - order/orderform.html (주문서 페이지)
  - product/cart.html (장바구니 페이지)
```

### 🔧 **Step 3: JavaScript 스크립트 추가**

카페24 관리자에서 다음 스크립트를 추가하세요:

```html
<!-- 뽀샵 자동 입력 스크립트 시작 -->
<script>
// 카페24 뽀샵 연동 자동 입력 스크립트 삽입
(function() {
    'use strict';
    
    // 뽀샵 자동 입력 관리자
    class Cafe24PposhopIntegration {
        constructor() {
            this.isInitialized = false;
            this.customerData = null;
            this.init();
        }
        
        // 초기화
        init() {
            if (this.isInitialized) return;
            
            // URL 파라미터 확인
            this.checkPposhopParams();
            
            // DOM 로드 완료 시 실행
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupAutoFill());
            } else {
                this.setupAutoFill();
            }
            
            this.isInitialized = true;
        }
        
        // 뽀샵 파라미터 확인
        checkPposhopParams() {
            const urlParams = new URLSearchParams(window.location.search);
            const pposhopData = urlParams.get('pposhop_data');
            const autoFill = urlParams.get('auto_fill');
            const source = urlParams.get('source');
            
            if (source === 'pposhop' && autoFill === 'Y' && pposhopData) {
                this.customerData = this.decryptCustomerData(pposhopData);
                
                if (this.customerData) {
                    console.log('뽀샵 고객 정보 로드 완료:', this.customerData.name);
                    this.showPposhopBanner();
                }
            }
        }
        
        // 데이터 복호화
        decryptCustomerData(encryptedData) {
            try {
                const key = 'pposhop2024';
                const decoded = atob(decodeURIComponent(encryptedData));
                let decrypted = '';
                
                for (let i = 0; i < decoded.length; i++) {
                    decrypted += String.fromCharCode(
                        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                    );
                }
                
                return JSON.parse(decrypted);
            } catch (error) {
                console.error('데이터 복호화 실패:', error);
                return null;
            }
        }
        
        // 뽀샵 연동 배너 표시
        showPposhopBanner() {
            const banner = document.createElement('div');
            banner.id = 'pposhop-banner';
            banner.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #ff2d92, #ff6b9d);
                    color: white;
                    padding: 12px 20px;
                    text-align: center;
                    font-weight: 600;
                    margin-bottom: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(255, 45, 146, 0.2);
                ">
                    🎉 뽀샵에서 연결되었습니다! 고객정보가 자동으로 입력됩니다.
                </div>
            `;
            
            // 페이지 상단에 배너 삽입
            const container = document.body.querySelector('.xans-layout-main') || 
                            document.body.querySelector('#container') || 
                            document.body;
            
            if (container) {
                container.insertBefore(banner, container.firstChild);
            }
        }
        
        // 자동 입력 설정
        setupAutoFill() {
            if (!this.customerData) return;
            
            // 페이지 유형 감지
            const pageType = this.detectPageType();
            
            // 지연 실행으로 폼 로딩 대기
            setTimeout(() => {
                switch(pageType) {
                    case 'product':
                        this.fillProductForm();
                        break;
                    case 'cart':
                        this.fillCartForm();
                        break;
                    case 'order':
                        this.fillOrderForm();
                        break;
                    case 'member':
                        this.fillMemberForm();
                        break;
                }
            }, 1000);
        }
        
        // 페이지 유형 감지
        detectPageType() {
            const url = window.location.pathname;
            const search = window.location.search;
            
            if (url.includes('/product/') && url.includes('detail')) return 'product';
            if (url.includes('/order/') || search.includes('orderform')) return 'order';
            if (url.includes('/cart') || url.includes('basket')) return 'cart';
            if (url.includes('/member/') || url.includes('join')) return 'member';
            
            return 'unknown';
        }
        
        // 상품 페이지 정보 표시
        fillProductForm() {
            this.showOrderInfo();
        }
        
        // 장바구니 페이지 정보 표시
        fillCartForm() {
            this.showOrderInfo();
        }
        
        // 주문서 폼 자동 입력
        fillOrderForm() {
            if (!this.customerData) return;
            
            const data = this.customerData;
            
            // 주문자 정보 필드 매핑
            const fieldMappings = [
                // 주문자명
                { 
                    selectors: [
                        '#order_name', 
                        'input[name="order_name"]',
                        'input[name="orderer_name"]',
                        'input[name="buyer_name"]'
                    ], 
                    value: data.name 
                },
                
                // 전화번호
                { 
                    selectors: [
                        '#order_phone', 
                        'input[name="order_phone"]',
                        'input[name="orderer_phone"]',
                        'input[name="buyer_phone"]'
                    ], 
                    value: data.phone 
                },
                
                // 이메일
                { 
                    selectors: [
                        '#order_email', 
                        'input[name="order_email"]',
                        'input[name="orderer_email"]',
                        'input[name="buyer_email"]'
                    ], 
                    value: data.email 
                },
                
                // 생년월일 (있을 경우)
                { 
                    selectors: [
                        'input[name="birth"]',
                        'input[name="buyer_birth"]'
                    ], 
                    value: data.birthdate 
                }
            ];
            
            let filledCount = 0;
            
            // 각 필드 자동 입력
            fieldMappings.forEach(mapping => {
                if (!mapping.value) return;
                
                for (const selector of mapping.selectors) {
                    const field = document.querySelector(selector);
                    if (field && !field.value) {
                        field.value = mapping.value;
                        field.dispatchEvent(new Event('input', { bubbles: true }));
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                        
                        // 시각적 피드백
                        field.style.backgroundColor = '#e8f5e8';
                        field.style.border = '2px solid #4caf50';
                        
                        setTimeout(() => {
                            field.style.backgroundColor = '';
                            field.style.border = '';
                        }, 2000);
                        
                        filledCount++;
                        console.log(`자동 입력 완료: ${selector} = ${mapping.value}`);
                        break;
                    }
                }
            });
            
            // 배송지 정보도 동일하게 적용 (선택사항)
            if (data.address) {
                this.fillShippingAddress(data);
            }
            
            // 자동 입력 완료 알림
            if (filledCount > 0) {
                this.showAutoFillSuccess(filledCount);
            }
        }
        
        // 배송지 정보 자동 입력
        fillShippingAddress(data) {
            if (!data.address) return;
            
            const addressFields = [
                { selectors: ['input[name="addr1"]', '#addr1'], value: data.address },
                { selectors: ['input[name="zipcode"]', '#zipcode'], value: data.zipcode || '' }
            ];
            
            addressFields.forEach(mapping => {
                if (!mapping.value) return;
                
                for (const selector of mapping.selectors) {
                    const field = document.querySelector(selector);
                    if (field && !field.value) {
                        field.value = mapping.value;
                        field.dispatchEvent(new Event('input', { bubbles: true }));
                        break;
                    }
                }
            });
        }
        
        // 회원가입 폼 자동 입력
        fillMemberForm() {
            if (!this.customerData) return;
            
            const data = this.customerData;
            
            const memberFields = [
                { selectors: ['input[name="member_id"]', '#member_id'], value: data.username || data.email },
                { selectors: ['input[name="name"]', '#name'], value: data.name },
                { selectors: ['input[name="email"]', '#email'], value: data.email },
                { selectors: ['input[name="phone"]', '#phone'], value: data.phone }
            ];
            
            memberFields.forEach(mapping => {
                if (!mapping.value) return;
                
                for (const selector of mapping.selectors) {
                    const field = document.querySelector(selector);
                    if (field && !field.value) {
                        field.value = mapping.value;
                        field.dispatchEvent(new Event('input', { bubbles: true }));
                        break;
                    }
                }
            });
        }
        
        // 주문 정보 박스 표시
        showOrderInfo() {
            if (!this.customerData) return;
            
            const orderInfo = document.createElement('div');
            orderInfo.innerHTML = `
                <div style="
                    background: #f8f9fa;
                    border: 2px solid #ff2d92;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                    font-family: 'Pretendard', sans-serif;
                ">
                    <h3 style="
                        color: #ff2d92;
                        margin: 0 0 15px 0;
                        font-size: 18px;
                        font-weight: 600;
                    ">🎯 뽀샵 주문 정보</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div><strong>고객명:</strong> ${this.customerData.name}</div>
                        <div><strong>전화번호:</strong> ${this.customerData.phone}</div>
                        <div><strong>이메일:</strong> ${this.customerData.email}</div>
                        <div><strong>예약업체:</strong> ${this.customerData.shopName || '선택된 업체'}</div>
                    </div>
                    
                    <div style="
                        background: #fff3f8;
                        border-radius: 8px;
                        padding: 12px;
                        margin-top: 15px;
                        font-size: 14px;
                        color: #666;
                    ">
                        💡 주문서 작성 시 위 정보가 자동으로 입력됩니다.
                    </div>
                </div>
            `;
            
            // 상품 정보 영역 다음에 삽입
            const productArea = document.querySelector('.xans-product-detail') ||
                              document.querySelector('.product-detail') ||
                              document.querySelector('#prdDetail') ||
                              document.querySelector('.detail_wrap');
            
            if (productArea) {
                productArea.appendChild(orderInfo);
            }
        }
        
        // 자동 입력 성공 알림
        showAutoFillSuccess(count) {
            const successMsg = document.createElement('div');
            successMsg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4caf50, #45a049);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
                z-index: 9999;
                font-weight: 600;
                animation: slideIn 0.3s ease-out;
            `;
            
            successMsg.innerHTML = `✅ ${count}개 정보 자동 입력 완료!`;
            
            document.body.appendChild(successMsg);
            
            // 3초 후 자동 제거
            setTimeout(() => {
                if (successMsg.parentNode) {
                    successMsg.remove();
                }
            }, 3000);
        }
    }
    
    // CSS 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 뽀샵 연동 시스템 초기화
    new Cafe24PposhopIntegration();
    
})();
</script>
<!-- 뽀샵 자동 입력 스크립트 끝 -->
```

---

## 2️⃣ 뽀샵 측 설정

### 🔧 **자사몰 URL 설정**
`js/external-payment.js` 파일에서 카페24 URL을 실제 주소로 변경:

```javascript
// 47번째 줄 근처
generateOwnMallLink(orderInfo) {
    const baseUrl = 'https://yourmall.cafe24.com'; // ← 실제 카페24 주소로 변경
    
    // 상품 코드 매핑 (카페24에서 등록한 실제 상품 번호로 변경)
    const productMapping = {
        basic_care: 'P0000001',    // 기본 피부관리 상품번호
        acne_care: 'P0000002',     // 여드름 관리 상품번호
        whitening: 'P0000003',     // 미백 관리 상품번호
        anti_aging: 'P0000004',    // 주름 개선 상품번호
        premium_care: 'P0000005'   // 프리미엄 관리 상품번호
    };
    
    const productCode = productMapping[orderInfo.serviceType] || 'P0000001';
    
    const params = new URLSearchParams({
        product_no: productCode,
        pposhop_data: this.encryptCustomerData({
            name: orderInfo.customerName,
            phone: orderInfo.customerPhone,
            email: orderInfo.customerEmail,
            shopName: orderInfo.shopName,
            serviceType: orderInfo.serviceType,
            amount: orderInfo.amount
        }),
        auto_fill: 'Y',
        source: 'pposhop'
    });
    
    return `${baseUrl}/product/detail.html?${params.toString()}`;
}
```

---

## 3️⃣ 카페24 상품 등록

### 🛍️ **피부관리 서비스 상품 등록**

카페24 관리자에서 다음 상품들을 등록하세요:

| 상품번호 | 상품명 | 가격 | 설명 |
|---------|-------|------|------|
| P0000001 | 기본 피부관리 | 80,000원 | 클렌징 + 스팀 + 팩 (60분) |
| P0000002 | 여드름 관리 | 120,000원 | 여드름 진정 + 압출 (90분) |
| P0000003 | 미백 관리 | 150,000원 | 미백 앰플 + 이온도입 (120분) |
| P0000004 | 주름 개선 | 180,000원 | 콜라겐 + 리프팅 (120분) |
| P0000005 | 프리미엄 관리 | 250,000원 | VIP 맞춤 관리 (150분) |

### 📋 **상품 옵션 설정**
각 상품에 다음 옵션을 추가:

```
필수옵션: 업체 선택
- 강남뷰티샵
- 서초피부관리실  
- 역삼스킨케어
- 기타 (직접입력)

필수옵션: 예약 시간
- 오전 (10:00-12:00)
- 오후 (14:00-17:00)
- 저녁 (18:00-20:00)

선택옵션: 추가 서비스
- 홈케어 키트 (+30,000원)
- 애프터케어 (+20,000원)
```

---

## 4️⃣ 테스트 방법

### 🧪 **Step 1: 테스트 URL 생성**
브라우저에서 다음 URL로 테스트:
```
https://yourmall.cafe24.com/product/detail.html?product_no=P0000001&pposhop_data=eyJuYW1lIjoi7ZmN6ri464+ZIiwicGhvbmUiOiIwMTAtMTIzNC01Njc4IiwiZW1haWwiOiJ0ZXN0QHBwb3Nob3Aua3IifQ%3D%3D&auto_fill=Y&source=pposhop
```

### 🧪 **Step 2: 확인 사항**
- [ ] 페이지 상단에 "뽀샵에서 연결되었습니다!" 배너 표시
- [ ] 주문 정보 박스에 고객 정보 표시
- [ ] 주문서 페이지에서 자동으로 정보 입력 확인
- [ ] 브라우저 콘솔에 "뽀샵 고객 정보 로드 완료" 메시지 확인

### 🧪 **Step 3: 실제 주문 테스트**
1. 뽀샵에서 견적서 확인 후 "자사몰에서 결제하기" 클릭
2. 카페24로 이동하여 정보 자동 입력 확인
3. 실제 결제까지 완료하여 전체 플로우 검증

---

## 5️⃣ 문제 해결

### ❌ **자동 입력이 안 되는 경우**

#### **문제 1: 스크립트 로드 실패**
```javascript
// 브라우저 콘솔에서 확인
console.log('Cafe24PposhopIntegration 로드 상태:', typeof Cafe24PposhopIntegration);
```

#### **문제 2: 필드 선택자 불일치**
카페24 스킨마다 필드명이 다를 수 있습니다:
```javascript
// 실제 필드명 확인 방법
document.querySelectorAll('input[type="text"]').forEach(input => {
    console.log('Field name:', input.name, 'ID:', input.id);
});
```

#### **문제 3: 데이터 복호화 실패**
암호화 키가 일치하지 않는 경우:
```javascript
// 뽀샵과 카페24의 암호화 키 일치 확인
const key = 'pposhop2024'; // 양쪽 동일해야 함
```

### ⚠️ **보안 고려사항**
- 암호화 키는 주기적으로 변경
- URL 파라미터 로그 기록 방지  
- HTTPS 필수 적용
- 고객 개인정보 최소 수집

---

## 📞 **지원 및 문의**

**기술 지원**: tech@pposhop.kr  
**설치 문의**: install@pposhop.kr  
**카카오톡**: https://open.kakao.com/o/sXXnTISh

---

**설치 완료 후 뽀샵 팀에 알려주시면 연동 테스트를 도와드립니다! 🎉**