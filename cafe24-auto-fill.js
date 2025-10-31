/**
 * 카페24 뽀샵 연동 자동 입력 스크립트
 * 
 * 사용법:
 * 1. 카페24 관리자 > 쇼핑몰 설정 > 기본 설정 > 추가 스크립트에 추가
 * 2. 또는 상품 상세페이지, 주문서 페이지 스킨에 직접 추가
 */

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
                    
                    // 뽀샵 연동 표시
                    this.showPposhopBanner();
                    
                    // 세션에 저장 (페이지 이동 시에도 유지)
                    sessionStorage.setItem('pposhop_customer_data', JSON.stringify(this.customerData));
                }
            } else {
                // 세션에서 복원 시도
                const savedData = sessionStorage.getItem('pposhop_customer_data');
                if (savedData) {
                    try {
                        this.customerData = JSON.parse(savedData);
                    } catch (error) {
                        console.error('뽀샵 데이터 복원 실패:', error);
                    }
                }
            }
        }
        
        // 데이터 복호화
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
                console.error('뽀샵 데이터 복호화 실패:', error);
                return null;
            }
        }
        
        // 뽀샵 연동 배너 표시
        showPposhopBanner() {
            if (!this.customerData) return;
            
            // 기존 배너 제거
            const existingBanner = document.getElementById('pposhop-banner');
            if (existingBanner) existingBanner.remove();
            
            // 배너 생성
            const banner = document.createElement('div');
            banner.id = 'pposhop-banner';
            banner.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, #ff2d92, #ff6b9d);
                    color: white;
                    padding: 12px 20px;
                    text-align: center;
                    font-size: 14px;
                    font-weight: 500;
                    z-index: 9999;
                    box-shadow: 0 2px 10px rgba(255, 45, 146, 0.3);
                    animation: slideDown 0.5s ease-out;
                ">
                    <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span>뽀샵에서 연결되었습니다! <strong>${this.customerData.name}</strong>님의 정보가 자동으로 입력됩니다.</span>
                        </div>
                        <button onclick="document.getElementById('pposhop-banner').remove()" 
                                style="
                                    background: rgba(255,255,255,0.2);
                                    border: none;
                                    color: white;
                                    padding: 4px 8px;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    margin-left: 15px;
                                    font-size: 12px;
                                ">닫기</button>
                    </div>
                </div>
                <style>
                    @keyframes slideDown {
                        from { transform: translateY(-100%); }
                        to { transform: translateY(0); }
                    }
                    body { margin-top: 60px !important; }
                </style>
            `;
            
            document.body.insertAdjacentElement('afterbegin', banner);
            
            // 5초 후 자동 닫기
            setTimeout(() => {
                if (banner.parentNode) {
                    banner.style.animation = 'slideUp 0.5s ease-out forwards';
                    setTimeout(() => banner.remove(), 500);
                }
            }, 5000);
        }
        
        // 자동 입력 설정
        setupAutoFill() {
            if (!this.customerData) return;
            
            // 현재 페이지 타입 감지
            const pageType = this.detectPageType();
            
            switch (pageType) {
                case 'product':
                    this.handleProductPage();
                    break;
                case 'cart':
                    this.handleCartPage(); 
                    break;
                case 'order':
                    this.handleOrderPage();
                    break;
                case 'member':
                    this.handleMemberPage();
                    break;
            }
        }
        
        // 페이지 타입 감지
        detectPageType() {
            const path = window.location.pathname;
            const url = window.location.href;
            
            if (path.includes('/product/') || path.includes('product_no=')) {
                return 'product';
            } else if (path.includes('/order/') || url.includes('order')) {
                return 'order';
            } else if (path.includes('/basket/') || url.includes('basket')) {
                return 'cart';
            } else if (path.includes('/member/') || url.includes('member')) {
                return 'member';
            }
            
            return 'unknown';
        }
        
        // 상품 페이지 처리
        handleProductPage() {
            console.log('상품 페이지 자동 입력 설정');
            
            // 바로구매 버튼에 이벤트 추가
            this.addEventToButtons([
                'a[href*="order"]',
                'input[onclick*="order"]', 
                '.btn_order',
                '#btn_buy_now'
            ], () => {
                // 주문 페이지로 이동하기 전에 데이터 준비
                this.prepareOrderData();
            });
        }
        
        // 장바구니 페이지 처리  
        handleCartPage() {
            console.log('장바구니 페이지 자동 입력 설정');
            
            this.addEventToButtons([
                'a[href*="order"]',
                '.btn_order_all',
                '#btn_order'
            ], () => {
                this.prepareOrderData();
            });
        }
        
        // 주문서 페이지 처리 (가장 중요!)
        handleOrderPage() {
            console.log('주문서 페이지 자동 입력 시작');
            
            // 주문서 폼 요소 찾기 및 자동 입력
            setTimeout(() => {
                this.fillOrderForm();
                this.addOrderFormValidation();
                this.setupPposhopOrderInfo();
            }, 1000);
        }
        
        // 회원가입 페이지 처리
        handleMemberPage() {
            if (this.customerData && window.location.href.includes('agreement')) {
                // 비회원 주문으로 유도
                this.showGuestOrderOption();
            }
        }
        
        // 주문서 폼 자동 입력
        fillOrderForm() {
            if (!this.customerData) return;
            
            const data = this.customerData;
            
            // 카페24 표준 필드명으로 자동 입력
            const fieldMappings = [
                // 주문자 정보
                { selectors: ['#order_name', 'input[name="order_name"]', '#orderer_name'], value: data.name },
                { selectors: ['#order_phone', 'input[name="order_phone"]', '#orderer_phone'], value: data.phone },
                { selectors: ['#order_email', 'input[name="order_email"]', '#orderer_email'], value: data.email },
                
                // 수령자 정보 (동일인 체크박스가 있는 경우)
                { selectors: ['#receiver_name', 'input[name="receiver_name"]'], value: data.name },
                { selectors: ['#receiver_phone', 'input[name="receiver_phone"]'], value: data.phone },
                
                // 휴대폰 번호 분리 (010-1234-5678 형태)
                ...(this.splitPhoneNumber(data.phone))
            ];
            
            fieldMappings.forEach(mapping => {
                mapping.selectors.forEach(selector => {
                    const element = document.querySelector(selector);
                    if (element && !element.value) {
                        element.value = mapping.value;
                        element.style.backgroundColor = '#f0fdf4'; // 자동 입력 표시
                        element.style.borderColor = '#16a34a';
                        
                        // 변경 이벤트 트리거 (카페24 유효성 검사)
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                });
            });
            
            // 동일인 배송 체크박스 자동 선택
            const samePersonCheckbox = document.querySelector('#same_person, input[name="same_person"], .same_person');
            if (samePersonCheckbox && !samePersonCheckbox.checked) {
                samePersonCheckbox.click();
            }
            
            // 자동 입력 완료 메시지
            this.showAutoFillComplete();
        }
        
        // 전화번호 분리 (카페24는 종종 전화번호를 3개 필드로 분리)
        splitPhoneNumber(phone) {
            const cleaned = phone.replace(/[^0-9]/g, '');
            if (cleaned.length === 11 && cleaned.startsWith('010')) {
                return [
                    { selectors: ['#order_phone1', 'select[name="order_phone1"]'], value: '010' },
                    { selectors: ['#order_phone2', 'input[name="order_phone2"]'], value: cleaned.substring(3, 7) },
                    { selectors: ['#order_phone3', 'input[name="order_phone3"]'], value: cleaned.substring(7, 11) }
                ];
            }
            return [];
        }
        
        // 버튼에 이벤트 추가
        addEventToButtons(selectors, callback) {
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.addEventListener('click', callback);
                });
            });
        }
        
        // 주문 데이터 준비
        prepareOrderData() {
            if (this.customerData) {
                // 다음 페이지에서도 사용할 수 있도록 세션 스토리지에 저장
                sessionStorage.setItem('pposhop_auto_fill_ready', 'true');
            }
        }
        
        // 자동 입력 완료 표시
        showAutoFillComplete() {
            const toast = document.createElement('div');
            toast.innerHTML = `
                <div style="
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #16a34a;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    z-index: 10000;
                    box-shadow: 0 4px 15px rgba(22, 163, 74, 0.3);
                    animation: fadeInUp 0.5s ease-out;
                ">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        <span>뽀샵 정보가 자동으로 입력되었습니다!</span>
                    </div>
                </div>
                <style>
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                </style>
            `;
            
            document.body.appendChild(toast);
            
            // 3초 후 자동 제거
            setTimeout(() => {
                toast.style.animation = 'fadeOut 0.5s ease-out forwards';
                setTimeout(() => toast.remove(), 500);
            }, 3000);
        }
        
        // 뽀샵 주문 정보 표시
        setupPposhopOrderInfo() {
            if (!this.customerData) return;
            
            // 주문서에 뽀샵 정보 박스 추가
            const orderForm = document.querySelector('#order_form, .order_form, form[name="orderform"]');
            if (orderForm) {
                const infoBox = document.createElement('div');
                infoBox.innerHTML = `
                    <div style="
                        background: linear-gradient(135deg, #fff0f8, #ffe3f2);
                        border: 2px solid #ff2d92;
                        border-radius: 12px;
                        padding: 20px;
                        margin: 20px 0;
                        position: relative;
                    ">
                        <div style="
                            background: #ff2d92;
                            color: white;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: 600;
                            position: absolute;
                            top: -8px;
                            left: 20px;
                        ">뽀샵 연동 주문</div>
                        
                        <div style="margin-top: 10px;">
                            <h3 style="color: #ff2d92; font-weight: 600; margin-bottom: 15px;">
                                📋 뽀샵 상담 정보
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                                <div><strong>상담번호:</strong> ${this.customerData.consultationId || 'N/A'}</div>
                                <div><strong>선택업체:</strong> ${this.customerData.shopName || 'N/A'}</div>
                                <div><strong>서비스:</strong> ${this.getServiceName(this.customerData.serviceType)}</div>
                                <div><strong>예상금액:</strong> ${this.formatPrice(this.customerData.estimatedPrice)}원</div>
                            </div>
                            
                            <div style="
                                background: rgba(255, 45, 146, 0.1);
                                padding: 12px;
                                border-radius: 8px;
                                margin-top: 15px;
                                font-size: 13px;
                                color: #831843;
                            ">
                                💡 <strong>알림:</strong> 결제 완료 후 ${this.customerData.shopName}에서 직접 연락드려 예약 일정을 조율합니다.
                            </div>
                        </div>
                        
                        <!-- 숨겨진 필드로 뽀샵 정보 전송 -->
                        <input type="hidden" name="pposhop_order_id" value="${this.customerData.orderId}">
                        <input type="hidden" name="pposhop_consultation_id" value="${this.customerData.consultationId}">
                        <input type="hidden" name="pposhop_shop_name" value="${this.customerData.shopName}">
                    </div>
                `;
                
                // 주문서 상단에 삽입
                orderForm.insertBefore(infoBox, orderForm.firstChild);
            }
        }
        
        // 서비스명 변환
        getServiceName(serviceType) {
            const serviceNames = {
                basic_care: '기본 피부관리',
                acne_care: '여드름 관리', 
                whitening: '미백 관리',
                anti_aging: '주름 개선',
                premium_care: '프리미엄 관리'
            };
            return serviceNames[serviceType] || '피부관리 서비스';
        }
        
        // 가격 포맷팅
        formatPrice(price) {
            return new Intl.NumberFormat('ko-KR').format(price || 0);
        }
        
        // 비회원 주문 옵션 표시
        showGuestOrderOption() {
            const guestOption = document.createElement('div');
            guestOption.innerHTML = `
                <div style="
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: white;
                    border: 3px solid #ff2d92;
                    border-radius: 15px;
                    padding: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    z-index: 10000;
                    max-width: 400px;
                    text-align: center;
                ">
                    <h3 style="color: #ff2d92; margin-bottom: 10px;">🎉 뽀샵 고객님!</h3>
                    <p style="margin-bottom: 15px; font-size: 14px;">회원가입 없이 바로 주문하실 수 있습니다.</p>
                    <button onclick="window.location.href='/order/orderform.html?guest=Y'" 
                            style="
                                background: #ff2d92;
                                color: white;
                                border: none;
                                padding: 12px 24px;
                                border-radius: 8px;
                                font-weight: 600;
                                cursor: pointer;
                                margin-right: 10px;
                            ">비회원 주문하기</button>
                    <button onclick="this.parentElement.remove()"
                            style="
                                background: #f3f4f6;
                                color: #6b7280;
                                border: none;
                                padding: 12px 20px;
                                border-radius: 8px;
                                cursor: pointer;
                            ">닫기</button>
                </div>
            `;
            
            document.body.appendChild(guestOption);
        }
        
        // 주문서 유효성 검사 추가
        addOrderFormValidation() {
            const orderForm = document.querySelector('#order_form, form[name="orderform"]');
            if (orderForm) {
                orderForm.addEventListener('submit', (e) => {
                    if (this.customerData) {
                        // 뽀샵 주문임을 표시
                        const pposhopFlag = document.createElement('input');
                        pposhopFlag.type = 'hidden';
                        pposhopFlag.name = 'pposhop_integration';
                        pposhopFlag.value = 'true';
                        orderForm.appendChild(pposhopFlag);
                        
                        console.log('뽀샵 연동 주문 제출:', this.customerData.orderId);
                    }
                });
            }
        }
    }
    
    // 전역 변수로 등록
    window.PposhopIntegration = new Cafe24PposhopIntegration();
    
})();