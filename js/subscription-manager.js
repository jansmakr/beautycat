// 뽀샵 업체 구독 관리 시스템
class SubscriptionManager {
    constructor() {
        this.currentYear = new Date().getFullYear();
        this.pricingPlans = {
            free2024: {
                id: 'free2024',
                name: '2024년 런칭 에디션',
                setupFee: 0,        // 입점료 무료
                monthlyFee: 0,      // 월 이용료 무료
                yearlyFee: 0,       // 연 이용료 무료
                validUntil: '2024-12-31',
                features: [
                    '전국 고객 상담 요청 수신',
                    '무제한 견적서 작성', 
                    '실시간 채팅 상담',
                    '매출 통계 및 분석',
                    '카페24/네이버 결제 연동'
                ]
            },
            standard2025: {
                id: 'standard2025',
                name: '2025년 정규 플랜',
                setupFee: 100000,   // 입점료 10만원
                monthlyFee: 11000,  // 월 이용료 1만1천원
                yearlyFee: 132000,  // 연 단위 결제
                validFrom: '2025-01-01',
                features: [
                    '전국 고객 상담 요청 수신',
                    '무제한 견적서 작성',
                    '실시간 채팅 상담', 
                    '매출 통계 및 분석',
                    '우선 노출 및 마케팅 지원',
                    '프리미엄 배지 및 인증마크',
                    '전용 고객지원 및 컨설팅'
                ]
            }
        };
        
        this.init();
    }
    
    // 초기화
    init() {
        this.loadSubscriptionStatus();
        this.setupEventListeners();
    }
    
    // 구독 상태 로드
    async loadSubscriptionStatus() {
        try {
            // RESTful API로 현재 업체의 구독 정보 조회
            const shopId = this.getCurrentShopId();
            if (!shopId) return;
            
            const response = await fetch(`/tables/subscriptions?shop_id=${shopId}`);
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                this.currentSubscription = data.data[0];
                this.updateSubscriptionUI();
            } else {
                // 구독 정보가 없으면 2024년 무료 플랜 자동 적용
                await this.createFreeSubscription(shopId);
            }
        } catch (error) {
            console.error('구독 정보 로드 실패:', error);
        }
    }
    
    // 현재 업체 ID 가져오기
    getCurrentShopId() {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return user.id;
    }
    
    // 2024년 무료 구독 생성
    async createFreeSubscription(shopId) {
        const freeSubscription = {
            shop_id: shopId,
            plan_id: 'free2024',
            plan_name: '2024년 런칭 에디션',
            status: 'active',
            start_date: new Date().toISOString().split('T')[0],
            end_date: '2024-12-31',
            setup_fee: 0,
            monthly_fee: 0,
            yearly_fee: 0,
            total_paid: 0,
            payment_method: 'promotional',
            auto_renew: false,
            created_at: new Date().toISOString()
        };
        
        try {
            const response = await fetch('/tables/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(freeSubscription)
            });
            
            if (response.ok) {
                this.currentSubscription = freeSubscription;
                this.updateSubscriptionUI();
                this.showWelcomeMessage();
            }
        } catch (error) {
            console.error('무료 구독 생성 실패:', error);
        }
    }
    
    // 구독 UI 업데이트
    updateSubscriptionUI() {
        if (!this.currentSubscription) return;
        
        const subscription = this.currentSubscription;
        const plan = this.pricingPlans[subscription.plan_id];
        
        // 구독 정보 표시
        this.displaySubscriptionInfo(subscription, plan);
        
        // 결제 상태에 따른 UI 조정
        if (subscription.status === 'active') {
            this.showActiveSubscription();
        } else if (subscription.status === 'expired') {
            this.showExpiredSubscription();
        } else if (subscription.status === 'pending') {
            this.showPendingPayment();
        }
    }
    
    // 구독 정보 표시
    displaySubscriptionInfo(subscription, plan) {
        const infoContainer = document.getElementById('subscription-info');
        if (!infoContainer) return;
        
        const isExpiringSoon = this.isExpiringSoon(subscription.end_date);
        const daysLeft = this.getDaysLeft(subscription.end_date);
        
        infoContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">
                        ${plan ? plan.name : subscription.plan_name}
                    </h3>
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getStatusBadgeClass(subscription.status)}">
                        ${this.getStatusText(subscription.status)}
                    </span>
                </div>
                
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-600">구독 기간</span>
                        <span class="font-medium">${subscription.start_date} ~ ${subscription.end_date}</span>
                    </div>
                    
                    ${daysLeft !== null ? `
                    <div class="flex justify-between">
                        <span class="text-gray-600">남은 기간</span>
                        <span class="font-medium ${isExpiringSoon ? 'text-red-600' : 'text-green-600'}">
                            ${daysLeft > 0 ? `${daysLeft}일` : '만료됨'}
                        </span>
                    </div>
                    ` : ''}
                    
                    <div class="flex justify-between">
                        <span class="text-gray-600">결제 금액</span>
                        <span class="font-medium text-lg">
                            ${subscription.total_paid === 0 ? '무료' : subscription.total_paid.toLocaleString() + '원'}
                        </span>
                    </div>
                </div>
                
                ${this.getActionButtons(subscription)}
            </div>
        `;
    }
    
    // 만료 임박 확인
    isExpiringSoon(endDate) {
        const end = new Date(endDate);
        const now = new Date();
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays > 0;
    }
    
    // 남은 일수 계산
    getDaysLeft(endDate) {
        const end = new Date(endDate);
        const now = new Date();
        return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    }
    
    // 상태 배지 CSS 클래스
    getStatusBadgeClass(status) {
        const classes = {
            'active': 'bg-green-100 text-green-800',
            'expired': 'bg-red-100 text-red-800', 
            'pending': 'bg-yellow-100 text-yellow-800',
            'cancelled': 'bg-gray-100 text-gray-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }
    
    // 상태 텍스트
    getStatusText(status) {
        const texts = {
            'active': '사용 중',
            'expired': '만료됨',
            'pending': '결제 대기',
            'cancelled': '취소됨'
        };
        return texts[status] || '알 수 없음';
    }
    
    // 액션 버튼
    getActionButtons(subscription) {
        const now = new Date();
        const endDate = new Date(subscription.end_date);
        const isExpired = now > endDate;
        
        if (subscription.plan_id === 'free2024') {
            if (isExpired) {
                // 2024년 무료 플랜 만료됨 - 2025년 플랜 안내
                return `
                    <div class="mt-6 pt-4 border-t border-gray-200">
                        <p class="text-sm text-gray-600 mb-3">
                            무료 혜택이 종료되었습니다. 서비스 이용을 계속하려면 정규 플랜으로 업그레이드하세요.
                        </p>
                        <button onclick="subscriptionManager.upgrade2025Plan()" 
                                class="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                            2025년 정규 플랜으로 업그레이드
                        </button>
                    </div>
                `;
            } else {
                // 2024년 무료 플랜 사용 중
                const daysLeft = this.getDaysLeft(subscription.end_date);
                if (daysLeft <= 30) {
                    return `
                        <div class="mt-6 pt-4 border-t border-gray-200">
                            <p class="text-sm text-amber-600 mb-3">
                                ⚠️ 무료 혜택이 곧 종료됩니다. 2025년 플랜을 미리 준비하세요.
                            </p>
                            <button onclick="subscriptionManager.showUpgradeInfo()" 
                                    class="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-md transition-colors">
                                2025년 플랜 정보 보기
                            </button>
                        </div>
                    `;
                } else {
                    return `
                        <div class="mt-6 pt-4 border-t border-gray-200">
                            <p class="text-sm text-green-600">
                                🎉 무료 혜택을 이용 중입니다. 추가 비용 없이 모든 기능을 사용하세요!
                            </p>
                        </div>
                    `;
                }
            }
        } else {
            // 정규 플랜
            if (isExpired) {
                return `
                    <div class="mt-6 pt-4 border-t border-gray-200">
                        <button onclick="subscriptionManager.renewSubscription()" 
                                class="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                            구독 갱신하기
                        </button>
                    </div>
                `;
            } else {
                return `
                    <div class="mt-6 pt-4 border-t border-gray-200 space-y-2">
                        <button onclick="subscriptionManager.managePayment()" 
                                class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors">
                            결제 정보 관리
                        </button>
                        ${subscription.auto_renew ? 
                            '<p class="text-xs text-green-600">✓ 자동 갱신 설정됨</p>' : 
                            '<p class="text-xs text-amber-600">⚠️ 수동 갱신 - 만료 전 갱신 필요</p>'
                        }
                    </div>
                `;
            }
        }
    }
    
    // 2025년 플랜 업그레이드
    async upgrade2025Plan() {
        const confirmMessage = `
2025년 정규 플랜으로 업그레이드하시겠습니까?

📋 플랜 내용:
• 입점료: 100,000원 (1회)  
• 연간 이용료: 132,000원
• 프리미엄 기능 모두 포함

💳 결제 방법:
• 신용카드, 계좌이체, 무통장입금 가능
        `;
        
        if (confirm(confirmMessage)) {
            // 결제 페이지로 이동하거나 모달 표시
            this.showPaymentModal('standard2025');
        }
    }
    
    // 업그레이드 정보 표시
    showUpgradeInfo() {
        alert(`
🎯 2025년 정규 플랜 안내

💰 요금:
• 입점료: 100,000원 (최초 1회)
• 연간 이용료: 132,000원 (월 11,000원)

✨ 추가 혜택:
• 우선 노출 및 마케팅 지원
• 프리미엄 배지 및 인증마크  
• 전용 고객지원 및 컨설팅

📅 2025년 1월 1일부터 적용됩니다.
        `);
    }
    
    // 결제 모달 표시
    showPaymentModal(planId) {
        const plan = this.pricingPlans[planId];
        const totalAmount = plan.setupFee + plan.yearlyFee;
        
        // 실제로는 PG 결제 모듈 연동 또는 결제 페이지로 이동
        const paymentUrl = `/payment?plan=${planId}&amount=${totalAmount}&shop_id=${this.getCurrentShopId()}`;
        
        // 임시로 alert으로 안내
        alert(`
💳 결제 안내

📋 플랜: ${plan.name}
💰 총 결제 금액: ${totalAmount.toLocaleString()}원

결제는 다음 방법 중 선택하실 수 있습니다:
1. 신용카드 (즉시 승인)
2. 계좌이체 (1-2일 소요)  
3. 무통장입금 (확인 후 승인)

계속 진행하시겠습니까?
        `);
        
        // 실제 결제 진행
        // window.location.href = paymentUrl;
    }
    
    // 구독 갱신
    async renewSubscription() {
        const subscription = this.currentSubscription;
        const plan = this.pricingPlans[subscription.plan_id];
        
        if (confirm(`구독을 갱신하시겠습니까?\n\n결제 금액: ${plan.yearlyFee.toLocaleString()}원`)) {
            this.showPaymentModal(subscription.plan_id);
        }
    }
    
    // 결제 정보 관리
    managePayment() {
        alert(`
💳 결제 정보 관리

현재 등록된 결제 수단을 관리하거나
새로운 결제 수단을 등록할 수 있습니다.

• 신용카드 변경
• 자동결제 설정/해제
• 결제 내역 조회
• 세금계산서 발급

고객센터(1588-0000)로 문의해주세요.
        `);
    }
    
    // 환영 메시지 표시
    showWelcomeMessage() {
        const welcomeMsg = `
🎉 뽀샵 입점을 환영합니다!

✅ 2024년 런칭 기념 무료 혜택이 적용되었습니다.
✅ 입점료 10만원 → 무료
✅ 1년 이용료 13만원 → 무료  
✅ 총 23만원 혜택!

지금부터 전국 고객들의 상담 요청을 받으실 수 있습니다.
대시보드에서 상담 관리를 시작해보세요!
        `;
        
        // 실제로는 예쁜 모달이나 토스트 메시지로 표시
        setTimeout(() => alert(welcomeMsg), 1000);
    }
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        // 페이지 로드 시 구독 상태 확인
        document.addEventListener('DOMContentLoaded', () => {
            this.loadSubscriptionStatus();
        });
        
        // 구독 관련 버튼 클릭 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-subscription-action]')) {
                const action = e.target.dataset.subscriptionAction;
                this.handleSubscriptionAction(action);
            }
        });
    }
    
    // 구독 액션 핸들러
    handleSubscriptionAction(action) {
        switch(action) {
            case 'upgrade':
                this.upgrade2025Plan();
                break;
            case 'renew': 
                this.renewSubscription();
                break;
            case 'manage':
                this.managePayment();
                break;
            case 'cancel':
                this.cancelSubscription();
                break;
        }
    }
    
    // 구독 취소
    async cancelSubscription() {
        const confirmMessage = `
정말로 구독을 취소하시겠습니까?

⚠️ 주의사항:
• 구독 취소 시 즉시 서비스 이용이 중단됩니다
• 남은 기간에 대한 환불은 약관에 따라 처리됩니다
• 취소 후 재가입 시 입점료가 다시 부과됩니다
        `;
        
        if (confirm(confirmMessage)) {
            try {
                const response = await fetch(`/tables/subscriptions/${this.currentSubscription.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        status: 'cancelled',
                        cancelled_at: new Date().toISOString()
                    })
                });
                
                if (response.ok) {
                    alert('구독이 취소되었습니다.');
                    this.loadSubscriptionStatus();
                } else {
                    throw new Error('구독 취소 실패');
                }
            } catch (error) {
                alert('구독 취소 중 오류가 발생했습니다. 고객센터로 문의해주세요.');
                console.error('구독 취소 실패:', error);
            }
        }
    }
    
    // 구독 통계 조회
    async getSubscriptionStats() {
        try {
            const response = await fetch('/tables/subscriptions?analytics=true');
            const data = await response.json();
            
            return {
                totalSubscriptions: data.total || 0,
                activeSubscriptions: data.active || 0,
                revenue: data.revenue || 0,
                conversionRate: data.conversion_rate || 0
            };
        } catch (error) {
            console.error('구독 통계 조회 실패:', error);
            return null;
        }
    }
}

// 전역 인스턴스 생성
const subscriptionManager = new SubscriptionManager();

// 구독 관리 유틸리티 함수들
window.SubscriptionUtils = {
    // 구독 상태 확인
    checkSubscriptionStatus: async (shopId) => {
        try {
            const response = await fetch(`/tables/subscriptions?shop_id=${shopId}`);
            const data = await response.json();
            return data.data && data.data.length > 0 ? data.data[0] : null;
        } catch (error) {
            console.error('구독 상태 확인 실패:', error);
            return null;
        }
    },
    
    // 구독 만료 알림
    showExpirationWarning: (daysLeft) => {
        if (daysLeft <= 7 && daysLeft > 0) {
            const warning = `
⚠️ 구독 만료 임박 알림

구독이 ${daysLeft}일 후 만료됩니다.
서비스 중단을 방지하려면 구독을 갱신해주세요.

지금 갱신하시겠습니까?
            `;
            
            if (confirm(warning)) {
                subscriptionManager.renewSubscription();
            }
        }
    },
    
    // 2024년 무료 플랜 확인
    isFree2024Plan: (subscription) => {
        return subscription && subscription.plan_id === 'free2024';
    }
};

// 페이지 로드 시 구독 상태 자동 확인
document.addEventListener('DOMContentLoaded', () => {
    // shop-dashboard나 관련 페이지에서만 실행
    if (window.location.pathname.includes('shop-') || 
        window.location.pathname.includes('subscription')) {
        
        setTimeout(() => {
            subscriptionManager.loadSubscriptionStatus();
        }, 1000);
    }
});

// 구독 만료 알림 체크 (24시간마다)
setInterval(async () => {
    const shopId = subscriptionManager.getCurrentShopId();
    if (shopId) {
        const subscription = await SubscriptionUtils.checkSubscriptionStatus(shopId);
        if (subscription && subscription.status === 'active') {
            const daysLeft = subscriptionManager.getDaysLeft(subscription.end_date);
            SubscriptionUtils.showExpirationWarning(daysLeft);
        }
    }
}, 24 * 60 * 60 * 1000); // 24시간

console.log('💳 뽀샵 구독 관리 시스템 로드 완료');