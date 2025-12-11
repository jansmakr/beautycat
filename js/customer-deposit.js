// BeautyCat 고객 예약금 시스템 v2.7.0
// 날짜: 2025-12-11

class CustomerDepositSystem {
    constructor() {
        this.currentCustomerId = null;
        this.currentCustomerName = null;
        this.init();
    }

    async init() {
        console.log('💳 고객 예약금 시스템 초기화...');
        
        // 현재 고객 정보 로드
        await this.loadCurrentCustomer();
        
        // 내 예약금 내역 로드
        await this.loadMyDeposits();
    }

    // 현재 고객 정보 로드
    async loadCurrentCustomer() {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            this.currentCustomerId = user.id;
            this.currentCustomerName = user.name;
            console.log(`✅ 고객 정보 로드: ${this.currentCustomerName} (${this.currentCustomerId})`);
        } catch (error) {
            console.error('❌ 고객 정보 로드 실패:', error);
        }
    }

    // 내 예약금 내역 로드
    async loadMyDeposits() {
        try {
            const response = await fetch(`/tables/booking_deposits?customer_id=${this.currentCustomerId}`);
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                this.displayMyDeposits(data.data);
            } else {
                this.displayNoDeposits();
            }
        } catch (error) {
            console.error('❌ 예약금 내역 로드 실패:', error);
            this.displayNoDeposits();
        }
    }

    // 예약금 내역 표시
    displayMyDeposits(deposits) {
        const container = document.getElementById('customer-deposits-container');
        if (!container) return;
        
        let html = '<div class="space-y-4">';
        
        deposits.forEach(deposit => {
            const statusBadge = this.getStatusBadge(deposit.payment_status);
            
            html += `
                <div class="border rounded-lg p-4 ${this.getStatusBorderColor(deposit.payment_status)}">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                            <div class="flex items-center mb-2">
                                ${statusBadge}
                                <span class="text-sm text-gray-500 ml-2">
                                    ${this.formatDate(deposit.created_at)}
                                </span>
                            </div>
                            <div class="font-semibold text-gray-900 mb-1">
                                ${deposit.shop_name}
                            </div>
                            <div class="text-sm text-gray-600">
                                예약일: ${this.formatDate(deposit.booking_date)}
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold text-gray-900">
                                ${this.formatPrice(deposit.deposit_amount)}원
                            </div>
                            <div class="text-xs text-gray-500">예약금</div>
                        </div>
                    </div>
                    
                    ${this.getActionButtons(deposit)}
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    // 예약금 없음 표시
    displayNoDeposits() {
        const container = document.getElementById('customer-deposits-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center text-gray-500 py-12">
                <i class="fas fa-receipt text-6xl mb-4 text-gray-300"></i>
                <p class="text-lg mb-2">예약금 내역이 없습니다</p>
                <p class="text-sm">견적 요청 후 예약금을 보내보세요!</p>
            </div>
        `;
    }

    // 상태 뱃지
    getStatusBadge(status) {
        const badges = {
            '대기중': '<span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">대기중</span>',
            '고객입금완료': '<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">입금 완료 (확인 대기)</span>',
            '원장님확인완료': '<span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">원장님 확인 완료</span>',
            '예약확정': '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✅ 예약 확정</span>',
            '취소됨': '<span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">취소됨</span>'
        };
        return badges[status] || badges['대기중'];
    }

    // 상태별 테두리 색상
    getStatusBorderColor(status) {
        const colors = {
            '대기중': 'border-gray-200 bg-white',
            '고객입금완료': 'border-blue-200 bg-blue-50',
            '원장님확인완료': 'border-purple-200 bg-purple-50',
            '예약확정': 'border-green-200 bg-green-50',
            '취소됨': 'border-red-200 bg-red-50'
        };
        return colors[status] || colors['대기중'];
    }

    // 액션 버튼
    getActionButtons(deposit) {
        if (deposit.payment_status === '대기중') {
            return `
                <button onclick="customerDepositSystem.showPaymentModal('${deposit.id}')" 
                        class="w-full bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                    <i class="fas fa-credit-card mr-2"></i>예약금 입금하기
                </button>
            `;
        } else if (deposit.payment_status === '고객입금완료') {
            return `
                <div class="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                    <i class="fas fa-clock mr-2"></i>
                    원장님이 입금을 확인하는 중입니다...
                </div>
            `;
        } else if (deposit.payment_status === '예약확정') {
            return `
                <div class="bg-green-50 p-3 rounded-lg text-sm text-green-800">
                    <i class="fas fa-check-circle mr-2"></i>
                    예약이 확정되었습니다!
                </div>
            `;
        }
        return '';
    }

    // 입금 모달 표시
    async showPaymentModal(depositId) {
        try {
            const response = await fetch(`/tables/booking_deposits/${depositId}`);
            const deposit = await response.json();
            
            // 샵 결제 정보 가져오기
            const paymentResponse = await fetch(`/tables/shop_payment_methods?shop_id=${deposit.shop_id}`);
            const paymentData = await paymentResponse.json();
            
            if (!paymentData.data || paymentData.data.length === 0) {
                alert('⚠️ 샵의 결제 정보가 등록되지 않았습니다.\n샵에 문의해주세요.');
                return;
            }
            
            const paymentMethod = paymentData.data[0];
            
            // 모달 HTML 생성
            let modalHtml = `
                <div id="payment-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div class="bg-white rounded-xl max-w-md w-full p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-xl font-bold text-gray-900">예약금 입금하기</h3>
                            <button onclick="customerDepositSystem.closePaymentModal()" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div class="space-y-4 mb-6">
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <div class="text-sm text-gray-500 mb-1">샵 이름</div>
                                <div class="font-semibold text-gray-900">${deposit.shop_name}</div>
                            </div>
                            
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <div class="text-sm text-gray-500 mb-1">예약금 금액</div>
                                <div class="text-2xl font-bold text-primary-500">${this.formatPrice(deposit.deposit_amount)}원</div>
                            </div>
            `;
            
            // 결제 정보 표시
            if (paymentMethod.payment_type === '간편결제링크') {
                modalHtml += `
                            <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                <div class="text-sm text-gray-700 mb-3">
                                    <i class="fas fa-link mr-2"></i>
                                    <strong>${paymentMethod.payment_provider}</strong> 간편결제
                                </div>
                                <a href="${paymentMethod.payment_link}" target="_blank" 
                                   class="block w-full bg-primary-500 text-white text-center px-4 py-3 rounded-lg hover:bg-primary-600 transition-colors font-semibold">
                                    <i class="fas fa-external-link-alt mr-2"></i>
                                    결제 링크로 이동
                                </a>
                            </div>
                `;
            } else if (paymentMethod.payment_type === '계좌번호') {
                modalHtml += `
                            <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
                                <div class="text-sm text-gray-700 mb-3">
                                    <i class="fas fa-university mr-2"></i>
                                    무통장 입금
                                </div>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-600">은행</span>
                                        <span class="font-semibold">${paymentMethod.bank_name}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-600">계좌번호</span>
                                        <span class="font-mono font-semibold">${paymentMethod.account_number}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-600">예금주</span>
                                        <span class="font-semibold">${paymentMethod.account_holder}</span>
                                    </div>
                                </div>
                            </div>
                `;
            }
            
            modalHtml += `
                        </div>
                        
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                            <div class="text-xs text-yellow-800">
                                <i class="fas fa-info-circle mr-1"></i>
                                입금 후 아래 버튼을 눌러주세요. 원장님이 확인 후 예약이 확정됩니다.
                            </div>
                        </div>
                        
                        <button onclick="customerDepositSystem.confirmPayment('${depositId}')" 
                                class="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                            <i class="fas fa-check mr-2"></i>입금 완료했습니다
                        </button>
                    </div>
                </div>
            `;
            
            // 모달 추가
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        } catch (error) {
            console.error('❌ 입금 모달 표시 실패:', error);
            alert('오류가 발생했습니다. 다시 시도해주세요.');
        }
    }

    // 모달 닫기
    closePaymentModal() {
        const modal = document.getElementById('payment-modal');
        if (modal) {
            modal.remove();
        }
    }

    // 입금 완료 확인
    async confirmPayment(depositId) {
        if (!confirm('입금을 완료하셨나요?\n확인을 누르면 원장님께 알림이 전송됩니다.')) {
            return;
        }
        
        try {
            const response = await fetch(`/tables/booking_deposits/${depositId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    payment_status: '고객입금완료',
                    customer_paid_at: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                alert('✅ 입금이 확인되었습니다!\n원장님이 확인 후 예약이 확정됩니다.');
                this.closePaymentModal();
                await this.loadMyDeposits(); // 목록 새로고침
            } else {
                throw new Error('입금 확인 실패');
            }
        } catch (error) {
            console.error('❌ 입금 확인 실패:', error);
            alert('입금 확인 중 오류가 발생했습니다.');
        }
    }

    // 날짜 포맷팅
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    // 가격 포맷팅
    formatPrice(price) {
        return new Intl.NumberFormat('ko-KR').format(price);
    }
}

// 전역 변수
let customerDepositSystem;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 고객 대시보드에서만 초기화
    if (window.location.pathname.includes('customer-dashboard')) {
        customerDepositSystem = new CustomerDepositSystem();
        window.customerDepositSystem = customerDepositSystem;
    }
});

console.log('✅ customer-deposit.js 로드 완료 (v2.7.0)');
