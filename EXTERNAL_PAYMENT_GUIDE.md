# 🛒 외부 결제 연동 가이드 (자사몰/네이버 스마트스토어)

## 📋 개요
뽀샵 플랫폼에서 직접 PG 연동 대신 기존 운영 중인 자사몰이나 네이버 스마트스토어를 통해 결제를 처리하는 방법에 대한 가이드입니다.

---

## 🏗️ 시스템 아키텍처

```
뽀샵 플랫폼 → 외부 결제 사이트 → 결제 완료 → 웹훅/리다이렉트 → 뽀샵 플랫폼
     ↓              ↓               ↓             ↓              ↓
  견적 확정    →   결제 페이지   →   PG 처리   →   완료 알림   →   상태 업데이트
```

### 🔄 **데이터 플로우**
1. 고객이 뽀샵에서 견적서 확인 후 결제 선택
2. 뽀샵이 외부 결제 URL 생성 (주문 정보 포함)
3. 고객이 외부 사이트에서 결제 진행
4. 결제 완료 시 웹훅/리다이렉트로 뽀샵에 알림
5. 뽀샵에서 주문 상태 업데이트 및 업체/고객 알림

---

## 1️⃣ 네이버 스마트스토어 연동

### 🛍️ **스마트스토어 설정**

#### **A. 상품 등록**
```javascript
// 피부관리 서비스 상품 카테고리
const productCategories = {
    "기본 피부관리": {
        categoryId: "50000001",
        price: 80000,
        options: ["60분", "90분", "120분"]
    },
    "여드름 관리": {
        categoryId: "50000002", 
        price: 120000,
        options: ["압출포함", "압출제외", "집중관리"]
    },
    "미백 관리": {
        categoryId: "50000003",
        price: 150000,
        options: ["기본코스", "프리미엄코스"]
    },
    "주름 개선": {
        categoryId: "50000004",
        price: 180000,
        options: ["리프팅", "볼륨", "탄력"]
    },
    "프리미엄 관리": {
        categoryId: "50000005",
        price: 250000,
        options: ["VIP코스", "맞춤코스"]
    }
};
```

#### **B. 상품 옵션 설정**
```html
<!-- 네이버 스마트스토어 상품 옵션 설정 -->
<상품옵션>
  <필수옵션명>업체선택</필수옵션명>
  <옵션값>강남_뷰티샵|서초_피부관리실|역삼_스킨케어|기타_직접입력</옵션값>
  
  <필수옵션명>고객정보</필수옵션명>
  <옵션값>홍길동_010-1234-5678|김영희_010-9876-5432|직접입력</옵션값>
  
  <선택옵션명>관리시간</선택옵션명>
  <옵션값>60분|90분|120분</옵션값>
</상품옵션>
```

#### **C. 스마트스토어 API 연동**
```javascript
// 네이버 스마트스토어 API 설정
const naverStoreAPI = {
    clientId: 'your_client_id',
    clientSecret: 'your_client_secret',
    baseUrl: 'https://api.commerce.naver.com/external',
    
    // 상품 등록
    async createProduct(productData) {
        const response = await fetch(`${this.baseUrl}/v1/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getAccessToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        return await response.json();
    },
    
    // 주문 조회
    async getOrders(params) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${this.baseUrl}/v1/orders?${queryString}`, {
            headers: {
                'Authorization': `Bearer ${this.getAccessToken()}`
            }
        });
        return await response.json();
    },
    
    // 액세스 토큰 발급
    async getAccessToken() {
        const response = await fetch('https://nid.naver.com/oauth2.0/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: this.clientId,
                client_secret: this.clientSecret
            })
        });
        const data = await response.json();
        return data.access_token;
    }
};
```

### 🔗 **URL 연동 방식**

#### **방법 1: 직접 URL 연결**
```javascript
// 뽀샵에서 네이버 스토어로 연결
function generateNaverStoreUrl(orderInfo) {
    const baseUrl = 'https://smartstore.naver.com/pposhop';
    const productId = getProductId(orderInfo.serviceType);
    
    const params = new URLSearchParams({
        // 상품 정보
        productNo: productId,
        quantity: 1,
        
        // 옵션 정보 (상품 등록 시 설정한 옵션과 매칭)
        option1: encodeURIComponent(`${orderInfo.shopName}_${orderInfo.shopPhone}`),
        option2: encodeURIComponent(`${orderInfo.customerName}_${orderInfo.customerPhone}`),
        
        // 추적 정보
        trackingId: orderInfo.orderId,
        
        // 리다이렉트 URL (결제 완료 후)
        returnUrl: encodeURIComponent(`https://pposhop.kr/payment-success.html?order=${orderInfo.orderId}`),
        cancelUrl: encodeURIComponent(`https://pposhop.kr/payment-cancel.html?order=${orderInfo.orderId}`)
    });
    
    return `${baseUrl}/products/${productId}?${params.toString()}`;
}
```

#### **방법 2: iFrame 임베드**
```html
<!-- 뽀샵 내에서 네이버 스토어 결제 페이지 임베드 -->
<iframe id="payment-frame" 
        src="네이버스토어URL" 
        width="100%" 
        height="600px"
        frameborder="0">
</iframe>

<script>
// iFrame 메시지 리스너
window.addEventListener('message', function(event) {
    if (event.origin !== 'https://smartstore.naver.com') return;
    
    if (event.data.type === 'payment_complete') {
        // 결제 완료 처리
        handlePaymentSuccess(event.data.orderInfo);
    }
});
</script>
```

---

## 2️⃣ 자사몰 연동

### 🏪 **자사몰 설정**

#### **A. 상품 페이지 구성**
```html
<!-- 자사몰 결제 페이지 템플릿 -->
<!DOCTYPE html>
<html>
<head>
    <title>뽀샵 서비스 결제</title>
</head>
<body>
    <div class="checkout-container">
        <h1>피부관리 서비스 결제</h1>
        
        <!-- 주문 정보 표시 -->
        <div class="order-info">
            <h2>주문 정보</h2>
            <div id="service-name"></div>
            <div id="shop-name"></div>
            <div id="customer-info"></div>
            <div id="price"></div>
        </div>
        
        <!-- 결제 방법 선택 -->
        <div class="payment-methods">
            <h2>결제 방법</h2>
            <label><input type="radio" name="payment" value="card"> 신용카드</label>
            <label><input type="radio" name="payment" value="transfer"> 계좌이체</label>
            <label><input type="radio" name="payment" value="virtual"> 가상계좌</label>
        </div>
        
        <!-- 결제 버튼 -->
        <button onclick="processPayment()">결제하기</button>
    </div>
    
    <script>
        // URL 파라미터에서 주문 정보 추출
        function loadOrderInfo() {
            const params = new URLSearchParams(window.location.search);
            
            document.getElementById('service-name').textContent = params.get('product');
            document.getElementById('shop-name').textContent = params.get('shop');
            document.getElementById('customer-info').textContent = 
                `${params.get('customer_name')} (${params.get('customer_phone')})`;
            document.getElementById('price').textContent = 
                `${Number(params.get('price')).toLocaleString()}원`;
        }
        
        // 결제 처리
        async function processPayment() {
            const params = new URLSearchParams(window.location.search);
            const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
            
            if (!paymentMethod) {
                alert('결제 방법을 선택해주세요');
                return;
            }
            
            // 실제 PG 결제 처리 (토스, 카카오페이 등)
            const paymentResult = await callPG({
                orderId: params.get('order_id'),
                amount: params.get('price'),
                method: paymentMethod,
                customerInfo: {
                    name: params.get('customer_name'),
                    email: params.get('customer_email'),
                    phone: params.get('customer_phone')
                }
            });
            
            if (paymentResult.success) {
                // 뽀샵에 결제 완료 알림
                await notifyPposhop({
                    orderId: params.get('order_id'),
                    status: 'completed',
                    transactionId: paymentResult.transactionId,
                    amount: paymentResult.amount
                });
                
                // 성공 페이지로 리다이렉트
                const successUrl = params.get('success_url');
                if (successUrl) {
                    window.location.href = successUrl;
                }
            } else {
                alert('결제에 실패했습니다: ' + paymentResult.message);
            }
        }
        
        // 뽀샵에 결제 결과 알림
        async function notifyPposhop(paymentInfo) {
            const webhookUrl = 'https://pposhop.kr/webhook-handler.html';
            
            // 방법 1: POST 요청
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentInfo)
            });
            
            // 방법 2: URL 리다이렉트
            const params = new URLSearchParams({
                webhook: 'true',
                ...paymentInfo
            });
            
            // iframe으로 웹훅 호출 (백그라운드)
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = `${webhookUrl}?${params.toString()}`;
            document.body.appendChild(iframe);
        }
        
        // 페이지 로드 시 주문 정보 표시
        window.onload = loadOrderInfo;
    </script>
</body>
</html>
```

---

## 3️⃣ 웹훅 처리 시스템

### 🔄 **웹훅 엔드포인트 설정**

#### **A. 뽀샵 웹훅 URL**
```
결제 완료: https://pposhop.kr/webhook-handler.html?webhook=true&orderId={ORDER_ID}&status=completed
결제 취소: https://pposhop.kr/webhook-handler.html?webhook=true&orderId={ORDER_ID}&status=cancelled
결제 실패: https://pposhop.kr/webhook-handler.html?webhook=true&orderId={ORDER_ID}&status=failed
```

#### **B. 자사몰에서 웹훅 호출**
```javascript
// 자사몰 결제 완료 후 뽀샵 웹훅 호출
async function sendWebhookToPposhop(orderInfo, paymentResult) {
    const webhookData = {
        orderId: orderInfo.pposhopOrderId,
        status: paymentResult.success ? 'completed' : 'failed',
        amount: paymentResult.amount,
        transactionId: paymentResult.transactionId,
        provider: 'own_mall',
        timestamp: new Date().toISOString()
    };
    
    // 웹훅 URL 생성
    const webhookUrl = new URL('https://pposhop.kr/webhook-handler.html');
    webhookUrl.searchParams.set('webhook', 'true');
    Object.entries(webhookData).forEach(([key, value]) => {
        webhookUrl.searchParams.set(key, value);
    });
    
    // 백그라운드에서 웹훅 호출
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = webhookUrl.toString();
    document.body.appendChild(iframe);
    
    // 또는 직접 POST 요청
    try {
        await fetch('https://pposhop.kr/api/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookData)
        });
    } catch (error) {
        console.error('웹훅 전송 실패:', error);
    }
}
```

---

## 4️⃣ 실제 구현 단계

### 📋 **구현 체크리스트**

#### **Phase 1: 기본 연동 (1-2주)**
- [ ] **네이버 스마트스토어 계정 개설**
- [ ] **피부관리 서비스 상품 5개 등록**
  - 기본 피부관리 (8만원)
  - 여드름 관리 (12만원)  
  - 미백 관리 (15만원)
  - 주름 개선 (18만원)
  - 프리미엄 관리 (25만원)
- [ ] **상품 옵션 설정** (업체명, 고객정보, 관리시간)
- [ ] **뽀샵 외부결제 시스템 테스트**

#### **Phase 2: 자사몰 구축 (2-3주)**
- [ ] **도메인 설정** (store.pposhop.kr)
- [ ] **결제 페이지 개발**
- [ ] **PG 연동** (토스페이먼츠 또는 카카오페이)
- [ ] **웹훅 시스템 구축**
- [ ] **SSL 인증서 설정**

#### **Phase 3: 고도화 (1-2주)**
- [ ] **주문 관리 시스템**
- [ ] **재고 관리** (예약 가능 시간)
- [ ] **자동 알림** (이메일, SMS)
- [ ] **매출 통계** 대시보드

### 🔧 **기술적 요구사항**

#### **네이버 스마트스토어**
```bash
# 필요한 준비물
1. 사업자등록증
2. 통신판매업신고증
3. 네이버 비즈니스 계정
4. 상품 이미지 (1200x1200px 이상)
5. 상세 설명 페이지

# API 신청
- 네이버 커머스 API 신청
- 앱 등록 및 Client ID/Secret 발급
- Webhook URL 등록
```

#### **자사몰 구축**
```javascript
// 최소 기술 스택
Frontend: HTML/CSS/JavaScript (현재 사용 중)
Backend: Node.js + Express (또는 PHP)
Database: MySQL/PostgreSQL (현재 Table API 활용 가능)
PG: 토스페이먼츠, 카카오페이, 이니시스 중 선택
Hosting: AWS, Cafe24, 가비아 등

// 예상 개발 비용
- 도메인: 연 2-3만원
- 호스팅: 월 3-10만원  
- PG 수수료: 거래액의 2.5-3.5%
- 개발 외주: 300-800만원 (기능에 따라)
```

---

## 5️⃣ 운영 가이드

### 📊 **주문 관리 워크플로우**

```
1. 고객 견적 요청 → 2. 업체 견적 발송 → 3. 고객 결제 선택 → 4. 외부 사이트 결제
                                                       ↓
8. 서비스 제공 완료 ← 7. 업체-고객 일정 조율 ← 6. 업체에 알림 ← 5. 결제 완료 웹훅
```

### 📈 **성과 측정 지표**
- **전환율**: 견적 요청 대비 결제 완료율
- **평균 객단가**: 결제 건당 평균 금액
- **리피트 구매**: 재구매 고객 비율
- **업체 만족도**: 월별 업체 피드백
- **고객 만족도**: 서비스 완료 후 평점

---

## 🚨 **주의사항 및 리스크**

### ⚠️ **법적 고려사항**
- **전자상거래법** 준수 (청약철회, 환불 규정)
- **개인정보보호법** 준수 (고객 정보 처리)
- **의료광고법** 준수 (피부관리 서비스 광고 제한)
- **소비자분쟁조정위원회** 대응 방안

### 🔒 **보안 고려사항**
- 결제 정보는 외부 PG사에서 처리 (뽀샵에서 직접 저장 금지)
- 고객 개인정보 최소 수집 및 암호화 저장
- 웹훅 데이터 검증 및 위조 방지
- HTTPS 필수 적용

### 💰 **비용 구조**
```
네이버 스마트스토어:
- 월 이용료: 무료 (프리미엄 옵션 별도)
- 판매 수수료: 2.5-5.5% (카테고리별 상이)
- 광고비: 월 10-100만원 (선택사항)

자사몰:
- 초기 개발: 300-800만원
- 월 운영비: 10-30만원
- PG 수수료: 2.5-3.5%
- 마케팅비: 월 50-200만원
```

---

## 📞 **지원 및 문의**

**개발 지원**: dev@pposhop.kr  
**사업 문의**: biz@pposhop.kr  
**기술 문의**: tech@pposhop.kr

**관련 문서**:
- [뽀샵 API 문서](./API_DOCUMENTATION.md)
- [보안 가이드](./SECURITY_DEPLOYMENT_GUIDE.md)
- [데이터베이스 스키마](./DATABASE_SCHEMA.md)