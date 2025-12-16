// BeautyCat 예약금 관리 시스템 v2.7.0
// 날짜: 2025-12-11

class DepositManagementSystem {
    constructor() {
        this.currentShopId = null;
        this.currentShopName = null;
        this.init();
    }

    async init() {
        console.log('💳 예약금 관리 시스템 초기화...');
        
        // 현재 샵 정보 로드
        await this.loadCurrentShop();
        
        // 결제 정보 로드
        await this.loadPaymentMethod();
        
        // 예약금 목록 로드
        await this.loadDeposits();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }

    // 현재 샵 정보 로드
    async loadCurrentShop() {
        try {
            // shop-dashboard.js의 currentUser 전역 변수 사용
            const user = window.currentUser || JSON.parse(localStorage.getItem('user_data') || '{}');
            this.currentShopId = user.id || user.shop_id;
            this.currentShopName = user.name || user.shopName;
            console.log(`✅ 샵 정보 로드: ${this.currentShopName} (${this.currentShopId})`);
        } catch (error) {
            console.error('❌ 샵 정보 로드 실패:', error);
        }
    }

    // 결제 정보 로드
    async loadPaymentMethod() {
        if (!this.currentShopId) {
            console.warn('⚠️ 샵 ID가 없어 결제 정보를 로드할 수 없습니다.');
            this.displayNoPaymentInfo();
            return;
        }
        
        try {
            const response = await fetch(`/tables/shop_payment_methods?shop_id=${this.currentShopId}`);
            
            // 500 에러 또는 404 에러 처리
            if (!response.ok) {
                console.warn(`⚠️ 결제 정보 API 응답 실패 (${response.status}). 빈 상태로 표시합니다.`);
                this.displayNoPaymentInfo();
                return;
            }
            
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                const paymentMethod = data.data[0];
                this.displayPaymentInfo(paymentMethod);
            } else {
                this.displayNoPaymentInfo();
            }
        } catch (error) {
            console.error('❌ 결제 정보 로드 실패:', error);
            this.displayNoPaymentInfo();
        }
    }

    // 결제 정보 표시
    displayPaymentInfo(paymentMethod) {
        const displayDiv = document.getElementById('payment-info-display');
        
        let html = '<div class="bg-white p-4 rounded-lg border border-gray-200">';
        
        if (paymentMethod.payment_type === '간편결제링크') {
            html += `
                <div class="flex items-center mb-3">
                    <i class="fas fa-link text-primary-500 mr-3"></i>
                    <div>
                        <div class="font-semibold text-gray-900">간편결제 링크</div>
                        <div class="text-sm text-gray-500">${paymentMethod.payment_provider}</div>
                    </div>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="text-xs text-gray-500 mb-1">결제 링크</div>
                    <a href="${paymentMethod.payment_link}" target="_blank" class="text-primary-500 hover:underline break-all">
                        ${paymentMethod.payment_link}
                    </a>
                </div>
            `;
        } else if (paymentMethod.payment_type === '계좌번호') {
            html += `
                <div class="flex items-center mb-3">
                    <i class="fas fa-university text-primary-500 mr-3"></i>
                    <div>
                        <div class="font-semibold text-gray-900">계좌번호</div>
                        <div class="text-sm text-gray-500">${paymentMethod.bank_name}</div>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">계좌번호</div>
                        <div class="font-mono font-semibold">${paymentMethod.account_number}</div>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <div class="text-xs text-gray-500 mb-1">예금주</div>
                        <div class="font-semibold">${paymentMethod.account_holder}</div>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        displayDiv.innerHTML = html;
    }

    // 결제 정보 없음 표시
    displayNoPaymentInfo() {
        const displayDiv = document.getElementById('payment-info-display');
        displayDiv.innerHTML = `
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p class="text-gray-500 text-center py-4">
                    <i class="fas fa-info-circle mr-2"></i>
                    결제 정보가 등록되지 않았습니다. 수정하기 버튼을 눌러 등록해주세요.
                </p>
            </div>
        `;
    }

    // 예약금 목록 로드
    async loadDeposits() {
        if (!this.currentShopId) {
            console.warn('⚠️ 샵 ID가 없어 예약금 목록을 로드할 수 없습니다.');
            this.displayEmptyDeposits();
            return;
        }
        
        try {
            const response = await fetch(`/tables/booking_deposits?shop_id=${this.currentShopId}`);
            
            // 500 에러 또는 404 에러 처리
            if (!response.ok) {
                console.warn(`⚠️ 예약금 목록 API 응답 실패 (${response.status}). 빈 상태로 표시합니다.`);
                this.displayEmptyDeposits();
                return;
            }
            
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                const deposits = data.data;
                
                // 입금 대기 중인 예약
                const pending = deposits.filter(d => d.payment_status === '고객입금완료');
                this.displayPendingDeposits(pending);
                
                // 확정 완료된 예약
                const confirmed = deposits.filter(d => d.payment_status === '예약확정');
                this.displayConfirmedDeposits(confirmed);
            } else {
                this.displayEmptyDeposits();
            }
        } catch (error) {
            console.error('❌ 예약금 목록 로드 실패:', error);
            this.displayEmptyDeposits();
        }
    }

    // 입금 대기 중인 예약 표시
    displayPendingDeposits(deposits) {
        const listDiv = document.getElementById('pending-deposits-list');
        const countSpan = document.getElementById('pending-count');
        
        countSpan.textContent = deposits.length;
        
        if (deposits.length === 0) {
            listDiv.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-inbox text-4xl mb-3"></i>
                    <p>입금 대기 중인 예약이 없습니다.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        deposits.forEach(deposit => {
            html += `
                <div class="border border-orange-200 rounded-lg p-4 bg-orange-50 hover:bg-orange-100 transition-colors">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center mb-2">
                                <span class="px-2 py-1 bg-orange-500 text-white text-xs rounded-full mr-2">
                                    입금 확인 필요
                                </span>
                                <span class="text-sm text-gray-500">
                                    ${this.formatDate(deposit.customer_paid_at)}
                                </span>
                            </div>
                            <div class="font-semibold text-gray-900 mb-1">
                                ${deposit.customer_name} 고객
                            </div>
                            <div class="text-sm text-gray-600 mb-3">
                                예약일: ${this.formatDate(deposit.booking_date)} | 
                                예약금: <strong>${this.formatPrice(deposit.deposit_amount)}</strong>
                            </div>
                            ${deposit.memo ? `<div class="text-xs text-gray-500 bg-white p-2 rounded">${deposit.memo}</div>` : ''}
                        </div>
                        <div class="flex flex-col gap-2 ml-4">
                            <button onclick="depositSystem.confirmDeposit('${deposit.id}')" 
                                    class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap">
                                <i class="fas fa-check mr-1"></i>예약 확정
                            </button>
                            <button onclick="depositSystem.viewDetails('${deposit.id}')" 
                                    class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                                <i class="fas fa-eye mr-1"></i>상세보기
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        listDiv.innerHTML = html;
    }

    // 확정 완료된 예약 표시
    displayConfirmedDeposits(deposits) {
        const listDiv = document.getElementById('confirmed-deposits-list');
        const countSpan = document.getElementById('confirmed-count');
        
        countSpan.textContent = deposits.length;
        
        if (deposits.length === 0) {
            listDiv.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-check-circle text-4xl mb-3"></i>
                    <p>확정된 예약이 없습니다.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        deposits.forEach(deposit => {
            html += `
                <div class="border border-green-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center mb-2">
                                <span class="px-2 py-1 bg-green-500 text-white text-xs rounded-full mr-2">
                                    예약 확정
                                </span>
                                <span class="text-sm text-gray-500">
                                    확정: ${this.formatDate(deposit.booking_confirmed_at)}
                                </span>
                            </div>
                            <div class="font-semibold text-gray-900 mb-1">
                                ${deposit.customer_name} 고객
                            </div>
                            <div class="text-sm text-gray-600 mb-2">
                                예약일: ${this.formatDate(deposit.booking_date)} | 
                                예약금: <strong>${this.formatPrice(deposit.deposit_amount)}</strong>
                            </div>
                        </div>
                        <button onclick="depositSystem.viewDetails('${deposit.id}')" 
                                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                            <i class="fas fa-eye mr-1"></i>상세보기
                        </button>
                    </div>
                </div>
            `;
        });
        
        listDiv.innerHTML = html;
    }

    // 빈 예약금 목록 표시
    displayEmptyDeposits() {
        document.getElementById('pending-deposits-list').innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-inbox text-4xl mb-3"></i>
                <p>입금 대기 중인 예약이 없습니다.</p>
            </div>
        `;
        
        document.getElementById('confirmed-deposits-list').innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-check-circle text-4xl mb-3"></i>
                <p>확정된 예약이 없습니다.</p>
            </div>
        `;
        
        document.getElementById('pending-count').textContent = '0';
        document.getElementById('confirmed-count').textContent = '0';
    }

    // 예약 확정
    async confirmDeposit(depositId) {
        if (!confirm('예약을 확정하시겠습니까?\n확정 후에는 고객에게 확정 알림이 발송됩니다.')) {
            return;
        }
        
        try {
            const response = await fetch(`/tables/booking_deposits/${depositId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    payment_status: '예약확정',
                    shop_confirmed_at: new Date().toISOString(),
                    booking_confirmed_at: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                alert('✅ 예약이 확정되었습니다!');
                await this.loadDeposits(); // 목록 새로고침
            } else {
                throw new Error('예약 확정 실패');
            }
        } catch (error) {
            console.error('❌ 예약 확정 실패:', error);
            alert('예약 확정 중 오류가 발생했습니다.');
        }
    }

    // 상세보기
    async viewDetails(depositId) {
        try {
            const response = await fetch(`/tables/booking_deposits/${depositId}`);
            const deposit = await response.json();
            
            // 모달로 상세 정보 표시 (간단한 alert로 대체)
            const details = `
📋 예약금 상세 정보

🆔 예약 ID: ${deposit.id}
👤 고객명: ${deposit.customer_name}
💰 예약금: ${this.formatPrice(deposit.deposit_amount)}원
📅 예약일: ${this.formatDate(deposit.booking_date)}
📝 상태: ${deposit.payment_status}

💳 결제 정보:
- 결제 방법: ${deposit.payment_method || '미지정'}
- 고객 입금 시간: ${this.formatDate(deposit.customer_paid_at)}
${deposit.shop_confirmed_at ? `- 확인 시간: ${this.formatDate(deposit.shop_confirmed_at)}` : ''}

${deposit.memo ? `📝 메모: ${deposit.memo}` : ''}
            `;
            
            alert(details);
        } catch (error) {
            console.error('❌ 상세 정보 로드 실패:', error);
            alert('상세 정보를 불러올 수 없습니다.');
        }
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 결제 정보 등록 폼 제출
        const paymentForm = document.getElementById('payment-method-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.savePaymentMethod();
            });
        }
        
        // 날짜 필터 변경
        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', () => {
                this.loadDeposits();
            });
        }
    }

    // 결제 정보 저장
    async savePaymentMethod() {
        const paymentType = document.querySelector('input[name="payment_type"]:checked')?.value;
        
        if (!paymentType) {
            alert('결제 방식을 선택해주세요.');
            return;
        }
        
        const paymentData = {
            shop_id: this.currentShopId,
            shop_name: this.currentShopName,
            payment_type: paymentType,
            is_active: true,
            created_at: new Date().toISOString()
        };
        
        if (paymentType === '간편결제링크') {
            paymentData.payment_provider = document.getElementById('payment-provider').value;
            paymentData.payment_link = document.getElementById('payment-link').value;
            
            if (!paymentData.payment_provider || !paymentData.payment_link) {
                alert('결제 제공자와 링크를 모두 입력해주세요.');
                return;
            }
        } else if (paymentType === '계좌번호') {
            paymentData.bank_name = document.getElementById('bank-name').value;
            paymentData.account_number = document.getElementById('account-number').value;
            paymentData.account_holder = document.getElementById('account-holder').value;
            
            if (!paymentData.bank_name || !paymentData.account_number || !paymentData.account_holder) {
                alert('은행명, 계좌번호, 예금주를 모두 입력해주세요.');
                return;
            }
        }
        
        try {
            // 기존 결제 정보 확인 (v2.8.13.1: 절대경로 → 상대경로)
            const checkResponse = await fetch(`tables/shop_payment_methods?shop_id=${this.currentShopId}`);
            const checkData = await checkResponse.json();
            
            let response;
            if (checkData.data && checkData.data.length > 0) {
                // 업데이트
                const existingId = checkData.data[0].id;
                response = await fetch(`tables/shop_payment_methods/${existingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(paymentData)
                });
            } else {
                // 새로 생성
                response = await fetch('tables/shop_payment_methods', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(paymentData)
                });
            }
            
            if (response.ok) {
                alert('✅ 결제 정보가 저장되었습니다!');
                togglePaymentForm(); // 폼 닫기
                await this.loadPaymentMethod(); // 정보 다시 로드
            } else {
                throw new Error('저장 실패');
            }
        } catch (error) {
            console.error('❌ 결제 정보 저장 실패:', error);
            alert('결제 정보 저장 중 오류가 발생했습니다.');
        }
    }

    // 날짜 포맷팅
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    // 가격 포맷팅
    formatPrice(price) {
        return new Intl.NumberFormat('ko-KR').format(price);
    }
}

// 전역 함수들
function togglePaymentForm() {
    const form = document.getElementById('payment-method-form');
    const display = document.getElementById('payment-info-display');
    const btn = document.getElementById('edit-payment-btn');
    
    if (form.classList.contains('hidden')) {
        form.classList.remove('hidden');
        display.classList.add('hidden');
        btn.innerHTML = '<i class="fas fa-times mr-2"></i>취소';
    } else {
        form.classList.add('hidden');
        display.classList.remove('hidden');
        btn.innerHTML = '<i class="fas fa-edit mr-2"></i>수정하기';
    }
}

function togglePaymentFields() {
    const paymentType = document.querySelector('input[name="payment_type"]:checked')?.value;
    const linkFields = document.getElementById('payment-link-fields');
    const accountFields = document.getElementById('account-fields');
    
    if (paymentType === '간편결제링크') {
        linkFields.classList.remove('hidden');
        accountFields.classList.add('hidden');
    } else if (paymentType === '계좌번호') {
        linkFields.classList.add('hidden');
        accountFields.classList.remove('hidden');
    }
}

function refreshDepositList() {
    if (window.depositSystem) {
        window.depositSystem.loadDeposits();
    }
}

// 페이지 로드 시 초기화 (약간의 지연)
let depositSystem;
document.addEventListener('DOMContentLoaded', () => {
    // 샵 대시보드에서만 초기화
    if (window.location.pathname.includes('shop-dashboard')) {
        // shop-dashboard.js가 완전히 로드될 때까지 대기
        setTimeout(() => {
            depositSystem = new DepositManagementSystem();
            window.depositSystem = depositSystem;
        }, 1000);
    }
});

console.log('✅ deposit-system.js 로드 완료 (v2.7.0)');
