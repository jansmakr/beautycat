// 결제 시스템 모듈
class PaymentManager {
    constructor() {
        this.supportedMethods = {
            card: '신용카드/체크카드',
            kakao: '카카오페이',
            toss: '토스페이',
            naver: '네이버페이',
            samsung: '삼성페이',
            transfer: '계좌이체',
            virtual: '가상계좌'
        };
        
        this.pgProviders = {
            toss: {
                name: '토스페이먼츠',
                clientKey: 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq', // 테스트키
                isTest: true
            },
            kakao: {
                name: '카카오페이',
                clientKey: 'test_kakao_client_key',
                isTest: true
            }
        };
    }

    // 결제 데이터베이스 스키마 초기화
    async initPaymentSchema() {
        const paymentSchema = {
            name: 'payments',
            fields: [
                { name: 'id', type: 'text', description: '결제 고유 ID' },
                { name: 'order_id', type: 'text', description: '주문 번호' },
                { name: 'user_id', type: 'text', description: '사용자 ID' },
                { name: 'consultation_id', type: 'text', description: '상담 ID' },
                { name: 'shop_id', type: 'text', description: '업체 ID' },
                { name: 'amount', type: 'number', description: '결제 금액' },
                { name: 'payment_method', type: 'text', description: '결제 수단' },
                { name: 'pg_provider', type: 'text', description: 'PG사' },
                { name: 'transaction_id', type: 'text', description: 'PG 거래번호' },
                { name: 'status', type: 'text', description: '결제 상태', options: ['pending', 'completed', 'failed', 'cancelled', 'refunded'] },
                { name: 'paid_at', type: 'datetime', description: '결제 완료 시간' },
                { name: 'cancelled_at', type: 'datetime', description: '취소 시간' },
                { name: 'refunded_at', type: 'datetime', description: '환불 시간' },
                { name: 'failure_reason', type: 'text', description: '실패 사유' },
                { name: 'created_at', type: 'datetime', description: '생성 시간' }
            ]
        };

        try {
            await fetch('/api/table-schema', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentSchema)
            });
            console.log('결제 스키마 초기화 완료');
        } catch (error) {
            console.error('결제 스키마 초기화 오류:', error);
        }
    }

    // 주문번호 생성
    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `PPOSHOP_${timestamp}_${random}`;
    }

    // 결제 요청 생성
    async createPaymentRequest(paymentData) {
        const {
            consultationId,
            shopId,
            amount,
            paymentMethod,
            customerInfo,
            serviceInfo
        } = paymentData;

        // 입력값 검증
        if (!consultationId || !shopId || !amount || amount <= 0) {
            throw new Error('필수 결제 정보가 누락되었습니다.');
        }

        const currentUser = await this.getCurrentUser();
        if (!currentUser) {
            throw new Error('로그인이 필요합니다.');
        }

        const orderId = this.generateOrderId();
        
        const payment = {
            order_id: orderId,
            user_id: currentUser.id,
            consultation_id: consultationId,
            shop_id: shopId,
            amount: amount,
            payment_method: paymentMethod,
            pg_provider: this.selectPGProvider(paymentMethod),
            status: 'pending',
            created_at: new Date().toISOString()
        };

        try {
            const response = await fetch('tables/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payment)
            });

            if (response.ok) {
                const savedPayment = await response.json();
                return {
                    ...savedPayment,
                    customerInfo,
                    serviceInfo
                };
            } else {
                throw new Error('결제 정보 저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('결제 요청 생성 오류:', error);
            throw error;
        }
    }

    // PG사 선택
    selectPGProvider(paymentMethod) {
        switch (paymentMethod) {
            case 'kakao':
                return 'kakao';
            case 'card':
            case 'toss':
            case 'transfer':
            case 'virtual':
                return 'toss';
            default:
                return 'toss';
        }
    }

    // 토스페이먼츠 결제 처리
    async processTossPayment(paymentRequest) {
        return new Promise((resolve, reject) => {
            // 실제 토스페이먼츠 SDK 로드 및 결제 처리
            // 현재는 데모 구현
            
            const mockPaymentResult = {
                success: Math.random() > 0.1, // 90% 성공률
                paymentKey: 'test_payment_' + Date.now(),
                orderId: paymentRequest.order_id,
                amount: paymentRequest.amount,
                method: paymentRequest.payment_method
            };

            setTimeout(() => {
                if (mockPaymentResult.success) {
                    resolve(mockPaymentResult);
                } else {
                    reject(new Error('결제가 취소되었거나 실패했습니다.'));
                }
            }, 2000); // 2초 대기 (실제 결제 시뮬레이션)
        });
    }

    // 카카오페이 결제 처리
    async processKakaoPayment(paymentRequest) {
        return new Promise((resolve, reject) => {
            // 실제 카카오페이 SDK 로드 및 결제 처리
            const mockPaymentResult = {
                success: Math.random() > 0.1,
                tid: 'kakao_' + Date.now(),
                orderId: paymentRequest.order_id,
                amount: paymentRequest.amount
            };

            setTimeout(() => {
                if (mockPaymentResult.success) {
                    resolve(mockPaymentResult);
                } else {
                    reject(new Error('카카오페이 결제가 취소되었습니다.'));
                }
            }, 2000);
        });
    }

    // 통합 결제 처리
    async processPayment(paymentRequest) {
        try {
            let paymentResult;
            
            switch (paymentRequest.pg_provider) {
                case 'kakao':
                    paymentResult = await this.processKakaoPayment(paymentRequest);
                    break;
                case 'toss':
                default:
                    paymentResult = await this.processTossPayment(paymentRequest);
                    break;
            }

            // 결제 성공 시 데이터베이스 업데이트
            if (paymentResult.success) {
                await this.updatePaymentStatus(paymentRequest.id, {
                    status: 'completed',
                    transaction_id: paymentResult.paymentKey || paymentResult.tid,
                    paid_at: new Date().toISOString()
                });

                // 상담 상태 업데이트
                await this.updateConsultationStatus(paymentRequest.consultation_id, 'paid');

                return {
                    success: true,
                    paymentId: paymentRequest.id,
                    transactionId: paymentResult.paymentKey || paymentResult.tid,
                    amount: paymentRequest.amount,
                    paidAt: new Date()
                };
            }
        } catch (error) {
            // 결제 실패 시 데이터베이스 업데이트
            await this.updatePaymentStatus(paymentRequest.id, {
                status: 'failed',
                failure_reason: error.message
            });

            throw error;
        }
    }

    // 결제 상태 업데이트
    async updatePaymentStatus(paymentId, statusData) {
        try {
            const response = await fetch(`tables/payments/${paymentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(statusData)
            });

            if (!response.ok) {
                throw new Error('결제 상태 업데이트 실패');
            }

            return await response.json();
        } catch (error) {
            console.error('결제 상태 업데이트 오류:', error);
            throw error;
        }
    }

    // 상담 상태 업데이트
    async updateConsultationStatus(consultationId, status) {
        try {
            const response = await fetch(`tables/consultations/${consultationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error('상담 상태 업데이트 실패');
            }

            return await response.json();
        } catch (error) {
            console.error('상담 상태 업데이트 오류:', error);
        }
    }

    // 환불 처리
    async processRefund(paymentId, refundReason) {
        try {
            const payment = await this.getPayment(paymentId);
            if (!payment || payment.status !== 'completed') {
                throw new Error('환불할 수 없는 결제입니다.');
            }

            // 실제 PG사 환불 API 호출 (현재는 모크)
            const refundResult = await this.callPGRefundAPI(payment);

            if (refundResult.success) {
                await this.updatePaymentStatus(paymentId, {
                    status: 'refunded',
                    refunded_at: new Date().toISOString(),
                    failure_reason: refundReason
                });

                // 상담 상태 업데이트
                await this.updateConsultationStatus(payment.consultation_id, 'refunded');

                return {
                    success: true,
                    refundAmount: payment.amount,
                    refundedAt: new Date()
                };
            } else {
                throw new Error('환불 처리에 실패했습니다.');
            }
        } catch (error) {
            console.error('환불 처리 오류:', error);
            throw error;
        }
    }

    // PG사 환불 API 호출 (모크)
    async callPGRefundAPI(payment) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 1000);
        });
    }

    // 결제 정보 조회
    async getPayment(paymentId) {
        try {
            const response = await fetch(`tables/payments/${paymentId}`);
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('결제 정보 조회 오류:', error);
            return null;
        }
    }

    // 사용자 결제 내역 조회
    async getUserPayments(userId, page = 1, limit = 10) {
        try {
            const response = await fetch(`tables/payments?search=${userId}&page=${page}&limit=${limit}`);
            if (response.ok) {
                return await response.json();
            }
            return { data: [], total: 0 };
        } catch (error) {
            console.error('결제 내역 조회 오류:', error);
            return { data: [], total: 0 };
        }
    }

    // 현재 사용자 정보 가져오기
    async getCurrentUser() {
        if (window.securityManager) {
            const session = await window.securityManager.validateSession();
            if (session) {
                return { id: session.userId, type: session.userType };
            }
        }
        return null;
    }

    // 결제 UI 생성
    createPaymentModal(paymentRequest) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">결제하기</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm text-gray-600">서비스</span>
                            <span class="font-medium">${paymentRequest.serviceInfo?.name || '피부관리 서비스'}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600">결제금액</span>
                            <span class="text-lg font-bold text-primary-500">${this.formatAmount(paymentRequest.amount)}원</span>
                        </div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">결제수단</label>
                    <div class="space-y-2">
                        ${this.createPaymentMethodOptions(paymentRequest.payment_method)}
                    </div>
                </div>
                
                <div class="flex space-x-3">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        취소
                    </button>
                    <button onclick="paymentManager.confirmPayment('${paymentRequest.id}')" 
                            class="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                        결제하기
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    // 결제수단 옵션 생성
    createPaymentMethodOptions(selectedMethod) {
        return Object.entries(this.supportedMethods).map(([key, name]) => `
            <label class="flex items-center p-3 border rounded-lg cursor-pointer ${key === selectedMethod ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}">
                <input type="radio" name="paymentMethod" value="${key}" ${key === selectedMethod ? 'checked' : ''} class="text-primary-500">
                <span class="ml-3">${name}</span>
            </label>
        `).join('');
    }

    // 금액 포맷팅
    formatAmount(amount) {
        return new Intl.NumberFormat('ko-KR').format(amount);
    }

    // 결제 확인
    async confirmPayment(paymentId) {
        try {
            const paymentRequest = await this.getPayment(paymentId);
            if (!paymentRequest) {
                throw new Error('결제 정보를 찾을 수 없습니다.');
            }

            // 로딩 UI 표시
            this.showPaymentLoading();

            const result = await this.processPayment(paymentRequest);
            
            if (result.success) {
                this.showPaymentSuccess(result);
                // 성공 후 페이지 새로고침 또는 리다이렉트
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }

        } catch (error) {
            this.showPaymentError(error.message);
        } finally {
            this.hidePaymentLoading();
        }
    }

    // 결제 로딩 UI
    showPaymentLoading() {
        const loading = document.createElement('div');
        loading.id = 'payment-loading';
        loading.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        loading.innerHTML = `
            <div class="bg-white rounded-lg p-6 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p class="text-gray-700">결제 처리 중입니다...</p>
                <p class="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
            </div>
        `;
        document.body.appendChild(loading);
    }

    hidePaymentLoading() {
        const loading = document.getElementById('payment-loading');
        if (loading) {
            loading.remove();
        }
    }

    showPaymentSuccess(result) {
        this.showPaymentResult('결제 완료', '결제가 성공적으로 완료되었습니다!', 'success');
    }

    showPaymentError(message) {
        this.showPaymentResult('결제 실패', message, 'error');
    }

    showPaymentResult(title, message, type) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
                <div class="mb-4">
                    <i class="fas fa-${type === 'success' ? 'check-circle text-green-500' : 'exclamation-circle text-red-500'} text-4xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">${title}</h3>
                <p class="text-gray-600 mb-4">${message}</p>
                <button onclick="this.closest('.fixed').remove()" 
                        class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                    확인
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 3초 후 자동 닫기
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 3000);
    }
}

// 전역 결제 매니저 인스턴스
const paymentManager = new PaymentManager();

// 전역 함수로 내보내기
window.paymentManager = paymentManager;