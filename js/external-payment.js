// 외부 결제 연동 시스템 (자사몰/네이버 스토어)
class ExternalPaymentManager {
    constructor() {
        this.paymentProviders = {
            own_mall: {
                name: '뽀샵 스토어',
                baseUrl: 'https://store.pposhop.kr', // 자사몰 URL
                enabled: true
            },
            naver_store: {
                name: '네이버 스마트스토어',
                baseUrl: 'https://smartstore.naver.com/pposhop', // 네이버 스토어 URL
                enabled: true
            },
            coupang: {
                name: '쿠팡',
                baseUrl: 'https://www.coupang.com/vp/products/your-product-id',
                enabled: false
            }
        };
        
        this.serviceCategories = {
            basic_care: {
                name: '기본 피부관리',
                price_range: '50000-100000',
                duration: '60분',
                description: '기본 클렌징 + 스팀 + 팩'
            },
            acne_care: {
                name: '여드름 관리',
                price_range: '80000-150000',
                duration: '90분',
                description: '여드름 진정 + 압출 + 재생 관리'
            },
            whitening: {
                name: '미백 관리',
                price_range: '100000-200000',
                duration: '120분',
                description: '미백 앰플 + 이온도입 + 화이트닝 팩'
            },
            anti_aging: {
                name: '주름 개선',
                price_range: '120000-250000',
                duration: '120분',
                description: '콜라겐 부스터 + 리프팅 마사지'
            },
            premium_care: {
                name: '프리미엄 관리',
                price_range: '200000-500000',
                duration: '150분',
                description: '맞춤형 프리미엄 토탈 케어'
            }
        };
    }

    // 외부 결제 링크 생성
    generatePaymentLink(consultationData) {
        const {
            consultationId,
            shopId,
            serviceType,
            customerInfo,
            shopInfo,
            estimatedPrice,
            preferredProvider = 'own_mall'
        } = consultationData;

        // 주문 정보 생성
        const orderInfo = {
            orderId: this.generateOrderId(),
            consultationId,
            shopId,
            serviceType,
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            customerEmail: customerInfo.email,
            shopName: shopInfo.name,
            shopPhone: shopInfo.phone,
            estimatedPrice,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        // 로컬 데이터베이스에 주문 정보 저장
        this.saveOrderInfo(orderInfo);

        // 선택된 결제 제공자에 따라 URL 생성
        switch (preferredProvider) {
            case 'own_mall':
                return this.generateOwnMallLink(orderInfo);
            case 'naver_store':
                return this.generateNaverStoreLink(orderInfo);
            default:
                return this.generateOwnMallLink(orderInfo);
        }
    }

    // 카페24 자사몰 결제 링크 생성
    generateOwnMallLink(orderInfo) {
        const baseUrl = this.paymentProviders.own_mall.baseUrl;
        const serviceCategory = this.serviceCategories[orderInfo.serviceType] || this.serviceCategories.basic_care;
        
        // 카페24 상품 코드 매핑
        const productMapping = {
            basic_care: 'P0000001',    // 기본 피부관리
            acne_care: 'P0000002',     // 여드름 관리
            whitening: 'P0000003',     // 미백 관리
            anti_aging: 'P0000004',    // 주름 개선
            premium_care: 'P0000005'   // 프리미엄 관리
        };
        
        const productCode = productMapping[orderInfo.serviceType] || productMapping.basic_care;
        
        // 카페24 URL 파라미터 구성
        const params = new URLSearchParams({
            // 카페24 필수 파라미터
            product_no: productCode,
            cate_no: '24',  // 피부관리 카테고리
            display_group: '1',
            
            // 뽀샵 고객 정보 (암호화)
            pposhop_data: this.encryptCustomerData({
                name: orderInfo.customerName,
                phone: orderInfo.customerPhone,  
                email: orderInfo.customerEmail,
                orderId: orderInfo.orderId,
                consultationId: orderInfo.consultationId,
                shopName: orderInfo.shopName,
                serviceType: orderInfo.serviceType,
                estimatedPrice: orderInfo.estimatedPrice
            }),
            
            // 자동 입력 플래그
            auto_fill: 'Y',
            source: 'pposhop',
            
            // 리다이렉트 URL (카페24 결제 완료 후)
            return_url: encodeURIComponent(`${window.location.origin}/payment-success.html?order=${orderInfo.orderId}`),
            cancel_return_url: encodeURIComponent(`${window.location.origin}/payment-cancel.html?order=${orderInfo.orderId}`)
        });

        // 카페24 상품 페이지로 직접 이동
        return `${baseUrl}/product/detail.html?${params.toString()}`;
    }
    
    // 고객 데이터 암호화 (간단한 XOR + Base64)
    encryptCustomerData(data) {
        const jsonString = JSON.stringify(data);
        const key = 'pposhop2024'; // 실제로는 환경변수에서 가져오기
        
        let encrypted = '';
        for (let i = 0; i < jsonString.length; i++) {
            encrypted += String.fromCharCode(jsonString.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        
        return btoa(encrypted);
    }
    
    // 고객 데이터 복호화
    decryptCustomerData(encryptedData) {
        try {
            const key = 'pposhop2024';
            const encrypted = atob(encryptedData);
            
            let decrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
                decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('데이터 복호화 오류:', error);
            return null;
        }
    }

    // 네이버 스마트스토어 결제 링크 생성
    generateNaverStoreLink(orderInfo) {
        const baseUrl = this.paymentProviders.naver_store.baseUrl;
        const serviceCategory = this.serviceCategories[orderInfo.serviceType] || this.serviceCategories.basic_care;
        
        // 네이버 스토어의 경우 상품별 고유 URL 사용
        const productMapping = {
            basic_care: '/products/5001', // 기본 피부관리 상품 ID
            acne_care: '/products/5002',  // 여드름 관리 상품 ID
            whitening: '/products/5003',  // 미백 관리 상품 ID
            anti_aging: '/products/5004', // 주름 개선 상품 ID
            premium_care: '/products/5005' // 프리미엄 관리 상품 ID
        };

        const productUrl = productMapping[orderInfo.serviceType] || productMapping.basic_care;
        
        // 네이버 스토어 파라미터
        const params = new URLSearchParams({
            // 수량 및 옵션
            ea: '1',
            
            // 맞춤 정보 (상품 옵션으로 전달)
            shop_option: orderInfo.shopName,
            customer_info: `${orderInfo.customerName}_${orderInfo.customerPhone}`,
            
            // 주문 추적
            external_order_id: orderInfo.orderId,
            
            // 가격 (참고용, 실제 결제는 상품 설정 가격)
            ref_price: orderInfo.estimatedPrice
        });

        return `${baseUrl}${productUrl}?${params.toString()}`;
    }

    // 주문 ID 생성
    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `PPO${timestamp}${random}`;
    }

    // 주문 정보 로컬 저장
    async saveOrderInfo(orderInfo) {
        try {
            const response = await fetch('tables/external_orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderInfo)
            });

            if (response.ok) {
                console.log('주문 정보 저장 완료:', orderInfo.orderId);
            }
        } catch (error) {
            console.error('주문 정보 저장 오류:', error);
        }
    }

    // 결제 프로세스 시작
    async startPaymentProcess(consultationId, paymentProvider = 'own_mall') {
        try {
            // 상담 정보 조회
            const consultation = await this.getConsultationInfo(consultationId);
            if (!consultation) {
                throw new Error('상담 정보를 찾을 수 없습니다.');
            }

            // 업체 정보 조회
            const shopInfo = await this.getShopInfo(consultation.shop_id);
            if (!shopInfo) {
                throw new Error('업체 정보를 찾을 수 없습니다.');
            }

            // 견적 정보 조회
            const quote = await this.getQuoteInfo(consultationId);
            if (!quote) {
                throw new Error('견적 정보를 찾을 수 없습니다.');
            }

            // 결제 링크 생성
            const paymentLink = this.generatePaymentLink({
                consultationId,
                shopId: consultation.shop_id,
                serviceType: this.detectServiceType(consultation.treatment_type),
                customerInfo: {
                    name: consultation.customer_name,
                    phone: consultation.customer_phone,
                    email: consultation.customer_email
                },
                shopInfo: {
                    name: shopInfo.shop_name,
                    phone: shopInfo.phone
                },
                estimatedPrice: quote.price,
                preferredProvider: paymentProvider
            });

            // 상담 상태 업데이트 (결제 진행 중)
            await this.updateConsultationStatus(consultationId, 'payment_initiated');

            return {
                success: true,
                paymentLink,
                provider: paymentProvider,
                estimatedPrice: quote.price
            };

        } catch (error) {
            console.error('결제 프로세스 시작 오류:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 상담 정보 조회
    async getConsultationInfo(consultationId) {
        try {
            const response = await fetch(`tables/consultations/${consultationId}`);
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('상담 정보 조회 오류:', error);
            return null;
        }
    }

    // 업체 정보 조회
    async getShopInfo(shopId) {
        try {
            const response = await fetch(`tables/skincare_shops/${shopId}`);
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('업체 정보 조회 오류:', error);
            return null;
        }
    }

    // 견적 정보 조회
    async getQuoteInfo(consultationId) {
        try {
            const response = await fetch(`tables/quotes?search=${consultationId}&limit=1`);
            if (response.ok) {
                const data = await response.json();
                return data.data && data.data.length > 0 ? data.data[0] : null;
            }
            return null;
        } catch (error) {
            console.error('견적 정보 조회 오류:', error);
            return null;
        }
    }

    // 서비스 타입 감지
    detectServiceType(treatmentType) {
        if (!treatmentType) return 'basic_care';
        
        const type = treatmentType.toLowerCase();
        
        if (type.includes('여드름') || type.includes('트러블')) return 'acne_care';
        if (type.includes('미백') || type.includes('화이트닝')) return 'whitening';
        if (type.includes('주름') || type.includes('안티에이징') || type.includes('리프팅')) return 'anti_aging';
        if (type.includes('프리미엄') || type.includes('vip')) return 'premium_care';
        
        return 'basic_care';
    }

    // 상담 상태 업데이트
    async updateConsultationStatus(consultationId, status) {
        try {
            const response = await fetch(`tables/consultations/${consultationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            return response.ok;
        } catch (error) {
            console.error('상담 상태 업데이트 오류:', error);
            return false;
        }
    }

    // 결제 선택 모달 생성
    createPaymentSelectionModal(consultationId, quoteInfo) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold text-gray-900">결제 방법 선택</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <!-- 견적 정보 -->
                <div class="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 class="font-medium text-gray-900 mb-3">결제 정보</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">서비스</span>
                            <span class="font-medium">${quoteInfo.treatment_details}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">예상 소요시간</span>
                            <span class="font-medium">${quoteInfo.duration}</span>
                        </div>
                        <div class="flex justify-between items-center pt-2 border-t">
                            <span class="text-gray-900 font-medium">총 결제금액</span>
                            <span class="text-xl font-bold text-primary-500">${this.formatPrice(quoteInfo.price)}원</span>
                        </div>
                    </div>
                </div>
                
                <!-- 결제 방법 선택 -->
                <div class="space-y-3 mb-6">
                    <h4 class="font-medium text-gray-900">결제 방법을 선택해주세요</h4>
                    
                    <label class="payment-method-option flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                        <input type="radio" name="paymentMethod" value="own_mall" checked class="text-primary-500">
                        <div class="ml-4 flex-1">
                            <div class="font-medium text-gray-900">뽀샵 스토어</div>
                            <div class="text-sm text-gray-500">안전한 자사 결제시스템 (카드, 계좌이체, 페이 등)</div>
                        </div>
                        <div class="text-primary-500">
                            <i class="fas fa-store text-xl"></i>
                        </div>
                    </label>
                    
                    <label class="payment-method-option flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                        <input type="radio" name="paymentMethod" value="naver_store" class="text-primary-500">
                        <div class="ml-4 flex-1">
                            <div class="font-medium text-gray-900">네이버 스마트스토어</div>
                            <div class="text-sm text-gray-500">네이버페이, 카드, 무통장입금</div>
                        </div>
                        <div class="text-green-500">
                            <i class="fab fa-neos text-xl"></i>
                        </div>
                    </label>
                </div>
                
                <!-- 주의사항 -->
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                    <div class="flex items-start">
                        <i class="fas fa-info-circle text-yellow-600 mt-0.5 mr-2"></i>
                        <div class="text-sm text-yellow-800">
                            <div class="font-medium mb-1">결제 안내</div>
                            <ul class="space-y-1 text-xs">
                                <li>• 결제 완료 후 업체에서 직접 연락드립니다</li>
                                <li>• 예약 일정은 업체와 별도 조율이 필요합니다</li>
                                <li>• 환불 규정은 각 결제 플랫폼의 정책을 따릅니다</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="flex space-x-3">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        취소
                    </button>
                    <button onclick="externalPaymentManager.proceedToPayment('${consultationId}')" 
                            class="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                        결제하기
                    </button>
                </div>
            </div>
        `;
        
        // 결제 방법 선택 시 스타일 업데이트
        modal.addEventListener('change', (e) => {
            if (e.target.name === 'paymentMethod') {
                modal.querySelectorAll('.payment-method-option').forEach(option => {
                    option.classList.remove('border-primary-500', 'bg-primary-50');
                    option.classList.add('border-gray-200');
                });
                
                e.target.closest('.payment-method-option').classList.remove('border-gray-200');
                e.target.closest('.payment-method-option').classList.add('border-primary-500', 'bg-primary-50');
            }
        });
        
        document.body.appendChild(modal);
        return modal;
    }

    // 결제 진행
    async proceedToPayment(consultationId) {
        try {
            // 선택된 결제 방법 가져오기
            const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'own_mall';
            
            // 결제 프로세스 시작
            const result = await this.startPaymentProcess(consultationId, selectedMethod);
            
            if (result.success) {
                // 로딩 표시
                this.showPaymentRedirect(selectedMethod);
                
                // 외부 결제 페이지로 이동
                setTimeout(() => {
                    window.open(result.paymentLink, '_blank');
                }, 2000);
                
                // 모달 닫기
                document.querySelector('.fixed.inset-0').remove();
                
            } else {
                this.showPaymentError(result.error);
            }
            
        } catch (error) {
            console.error('결제 진행 오류:', error);
            this.showPaymentError('결제 진행 중 오류가 발생했습니다.');
        }
    }

    // 가격 포맷팅
    formatPrice(price) {
        return new Intl.NumberFormat('ko-KR').format(price);
    }

    // 결제 리다이렉트 안내
    showPaymentRedirect(provider) {
        const providerName = this.paymentProviders[provider]?.name || '결제 사이트';
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
                <div class="mb-4">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">${providerName}로 이동 중...</h3>
                <p class="text-gray-600 mb-4">결제 페이지가 새 창에서 열립니다</p>
                <div class="text-sm text-gray-500">
                    <p>• 팝업 차단이 해제되어 있는지 확인해주세요</p>
                    <p>• 결제 완료 후 자동으로 돌아옵니다</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 5초 후 자동 닫기
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 5000);
    }

    // 결제 오류 표시
    showPaymentError(message) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
                <div class="mb-4">
                    <i class="fas fa-exclamation-circle text-red-500 text-4xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">결제 오류</h3>
                <p class="text-gray-600 mb-4">${message}</p>
                <button onclick="this.closest('.fixed').remove()" 
                        class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                    확인
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // 결제 완료 처리 (웹훅 또는 수동 확인)
    async handlePaymentComplete(orderId, paymentInfo) {
        try {
            // 주문 정보 업데이트
            await fetch(`tables/external_orders?search=${orderId}&limit=1`)
                .then(response => response.json())
                .then(async (data) => {
                    if (data.data && data.data.length > 0) {
                        const order = data.data[0];
                        
                        // 주문 상태 업데이트
                        await fetch(`tables/external_orders/${order.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                status: 'completed',
                                payment_completed_at: new Date().toISOString(),
                                payment_info: JSON.stringify(paymentInfo)
                            })
                        });
                        
                        // 상담 상태 업데이트
                        await this.updateConsultationStatus(order.consultationId, 'paid');
                        
                        return true;
                    }
                });
                
        } catch (error) {
            console.error('결제 완료 처리 오류:', error);
            return false;
        }
    }
}

// 전역 인스턴스
const externalPaymentManager = new ExternalPaymentManager();
window.externalPaymentManager = externalPaymentManager;