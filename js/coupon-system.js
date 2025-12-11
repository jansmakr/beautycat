/**
 * BeautyCat 쿠폰 시스템
 * 베타 테스트용 할인 쿠폰 관리
 */

class CouponSystem {
    constructor() {
        this.apiUrl = window.CLOUDFLARE_API?.baseUrl || 'https://beautycat-api.jansmakr.workers.dev/api';
        this.coupons = new Map();
        this.userCoupons = [];
        this.init();
    }

    async init() {
        console.log('🎫 쿠폰 시스템 초기화...');
        await this.loadAvailableCoupons();
        this.setupEventListeners();
        this.setupDefaultCoupons();
    }

    // 베타 테스트용 기본 쿠폰 설정
    setupDefaultCoupons() {
        const betaCoupons = [
            {
                code: 'BETA70',
                name: '베타 테스터 특가 할인',
                description: '베타 테스터만을 위한 특별 할인! 첫 예약 시 특가 할인',
                discountType: 'percentage',
                discountValue: 70,
                maxDiscount: 50000,
                minAmount: 10000,
                usageLimit: 1,
                validUntil: '2026-03-30',
                isActive: true,
                category: 'beta'
            },
            {
                code: 'BETA30',
                name: '베타 기간 전체 30% 할인',
                description: '베타 테스트 기간 중 모든 예약에 30% 할인 적용',
                discountType: 'percentage',
                discountValue: 30,
                maxDiscount: 30000,
                minAmount: 20000,
                usageLimit: 10,
                validUntil: '2026-03-30',
                isActive: true,
                category: 'beta'
            },
            {
                code: 'FRIEND10K',
                name: '친구 추천 1만원 할인',
                description: '친구 추천 시 양쪽 모두 1만원 할인 쿠폰 지급',
                discountType: 'fixed',
                discountValue: 10000,
                minAmount: 30000,
                usageLimit: 1,
                validUntil: '2025-03-31',
                isActive: true,
                category: 'referral'
            },
            {
                code: 'FIRST5K',
                name: '첫 방문 고객 5천원 할인',
                description: '처음 beautycat을 이용하는 고객을 위한 웰컴 쿠폰',
                discountType: 'fixed',
                discountValue: 5000,
                minAmount: 25000,
                usageLimit: 1,
                validUntil: '2025-06-30',
                isActive: true,
                category: 'welcome'
            },
            {
                code: 'REVIEW3K',
                name: '리뷰 작성 3천원 쿠폰',
                description: '시술 완료 후 리뷰 작성 시 다음 예약에 사용 가능한 3천원 쿠폰',
                discountType: 'fixed',
                discountValue: 3000,
                minAmount: 15000,
                usageLimit: 1,
                validUntil: '2026-03-30',
                isActive: true,
                category: 'review'
            }
        ];

        // 로컬스토리지에 기본 쿠폰 저장
        betaCoupons.forEach(coupon => {
            this.coupons.set(coupon.code, coupon);
        });

        console.log('✅ 베타 테스트용 쿠폰 5개 설정 완료');
        this.displayAvailableCoupons();
    }

    // 쿠폰 유효성 검증
    validateCoupon(code, amount = 0) {
        const coupon = this.coupons.get(code.toUpperCase());
        
        if (!coupon) {
            return { valid: false, message: '존재하지 않는 쿠폰 코드입니다.' };
        }

        if (!coupon.isActive) {
            return { valid: false, message: '만료된 쿠폰입니다.' };
        }

        if (new Date(coupon.validUntil) < new Date()) {
            return { valid: false, message: '쿠폰 사용 기간이 만료되었습니다.' };
        }

        if (amount < coupon.minAmount) {
            return { 
                valid: false, 
                message: `최소 주문금액 ${this.formatPrice(coupon.minAmount)}원 이상부터 사용 가능합니다.` 
            };
        }

        // 사용 횟수 체크 (실제로는 서버에서 확인)
        const usedCount = this.getUserCouponUsage(code);
        if (usedCount >= coupon.usageLimit) {
            return { valid: false, message: '이미 사용한 쿠폰입니다.' };
        }

        return { valid: true, coupon: coupon };
    }

    // 할인 금액 계산
    calculateDiscount(coupon, amount) {
        let discountAmount = 0;

        if (coupon.discountType === 'percentage') {
            discountAmount = Math.floor(amount * (coupon.discountValue / 100));
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discountValue;
        }

        return Math.min(discountAmount, amount);
    }

    // 쿠폰 적용
    applyCoupon(code, amount) {
        const validation = this.validateCoupon(code, amount);
        
        if (!validation.valid) {
            return {
                success: false,
                message: validation.message
            };
        }

        const coupon = validation.coupon;
        const discountAmount = this.calculateDiscount(coupon, amount);
        const finalAmount = amount - discountAmount;

        return {
            success: true,
            coupon: coupon,
            originalAmount: amount,
            discountAmount: discountAmount,
            finalAmount: finalAmount,
            message: `🎉 ${coupon.name} 적용! ${this.formatPrice(discountAmount)}원 할인되었습니다.`
        };
    }

    // 사용자별 쿠폰 사용 내역 조회 (로컬스토리지 기반)
    getUserCouponUsage(code) {
        const usedCoupons = JSON.parse(localStorage.getItem('usedCoupons') || '[]');
        return usedCoupons.filter(used => used.code === code.toUpperCase()).length;
    }

    // 쿠폰 사용 기록
    markCouponAsUsed(code, amount, discountAmount) {
        const usedCoupons = JSON.parse(localStorage.getItem('usedCoupons') || '[]');
        usedCoupons.push({
            code: code.toUpperCase(),
            amount: amount,
            discountAmount: discountAmount,
            usedAt: new Date().toISOString()
        });
        localStorage.setItem('usedCoupons', JSON.stringify(usedCoupons));
        
        console.log(`✅ 쿠폰 ${code} 사용 완료: ${this.formatPrice(discountAmount)}원 할인`);
    }

    // 사용 가능한 쿠폰 목록 표시
    displayAvailableCoupons() {
        const couponContainer = document.getElementById('availableCoupons');
        if (!couponContainer) return;

        const activeCoupons = Array.from(this.coupons.values())
            .filter(coupon => coupon.isActive && new Date(coupon.validUntil) >= new Date());

        couponContainer.innerHTML = `
            <div class="space-y-3">
                <h3 class="font-semibold text-gray-900 mb-3">🎫 사용 가능한 쿠폰</h3>
                ${activeCoupons.map(coupon => `
                    <div class="coupon-card border rounded-lg p-4 bg-gradient-to-r ${this.getCouponGradient(coupon.category)} cursor-pointer hover:shadow-md transition-shadow" 
                         onclick="couponSystem.selectCoupon('${coupon.code}')">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <div class="flex items-center space-x-2 mb-1">
                                    <span class="font-bold text-lg text-gray-900">${coupon.code}</span>
                                    <span class="text-xs px-2 py-1 rounded-full ${this.getCouponBadgeColor(coupon.category)} text-white">
                                        ${this.getCategoryName(coupon.category)}
                                    </span>
                                </div>
                                <h4 class="font-semibold text-gray-800 mb-1">${coupon.name}</h4>
                                <p class="text-sm text-gray-600 mb-2">${coupon.description}</p>
                                <div class="text-xs text-gray-500">
                                    최소 주문: ${this.formatPrice(coupon.minAmount)}원 | 
                                    사용기한: ${coupon.validUntil}
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl font-bold text-primary-500">
                                    ${coupon.discountType === 'percentage' ? 
                                        `${coupon.discountValue}%` : 
                                        `${this.formatPrice(coupon.discountValue)}원`}
                                </div>
                                <div class="text-xs text-gray-500">할인</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 쿠폰 선택
    selectCoupon(code) {
        const couponInput = document.getElementById('couponCode');
        if (couponInput) {
            couponInput.value = code;
            this.showCouponSuccess(`쿠폰 ${code}가 선택되었습니다! 결제 시 자동으로 적용됩니다.`);
            
            // 결제 금액이 있으면 미리 계산해서 보여주기
            const amountInput = document.getElementById('totalAmount');
            if (amountInput && amountInput.value) {
                this.previewDiscount(code, parseInt(amountInput.value));
            }
        }
    }

    // 할인 미리보기
    previewDiscount(code, amount) {
        const result = this.applyCoupon(code, amount);
        const previewContainer = document.getElementById('discountPreview');
        
        if (previewContainer) {
            if (result.success) {
                previewContainer.innerHTML = `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-gray-700">원래 금액:</span>
                            <span class="text-gray-700">${this.formatPrice(result.originalAmount)}원</span>
                        </div>
                        <div class="flex justify-between items-center text-sm text-red-600">
                            <span>할인 금액:</span>
                            <span>-${this.formatPrice(result.discountAmount)}원</span>
                        </div>
                        <hr class="my-2">
                        <div class="flex justify-between items-center font-bold text-lg">
                            <span class="text-gray-900">최종 결제:</span>
                            <span class="text-primary-600">${this.formatPrice(result.finalAmount)}원</span>
                        </div>
                    </div>
                `;
            } else {
                previewContainer.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                        <p class="text-sm text-red-600">${result.message}</p>
                    </div>
                `;
            }
        }
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 쿠폰 코드 입력 시 실시간 검증
        const couponInput = document.getElementById('couponCode');
        if (couponInput) {
            couponInput.addEventListener('input', (e) => {
                const code = e.target.value.trim();
                if (code.length >= 3) {
                    this.validateCouponInput(code);
                }
            });
        }

        // 쿠폰 적용 버튼
        const applyButton = document.getElementById('applyCouponBtn');
        if (applyButton) {
            applyButton.addEventListener('click', () => {
                this.handleCouponApplication();
            });
        }
    }

    // 쿠폰 입력 실시간 검증
    validateCouponInput(code) {
        const validation = this.validateCoupon(code);
        const feedback = document.getElementById('couponFeedback');
        
        if (feedback) {
            if (validation.valid) {
                feedback.innerHTML = `
                    <div class="text-sm text-green-600 mt-1">
                        ✅ 사용 가능한 쿠폰입니다: ${validation.coupon.name}
                    </div>
                `;
            } else {
                feedback.innerHTML = `
                    <div class="text-sm text-red-600 mt-1">
                        ❌ ${validation.message}
                    </div>
                `;
            }
        }
    }

    // 쿠폰 적용 처리
    handleCouponApplication() {
        const couponInput = document.getElementById('couponCode');
        const amountInput = document.getElementById('totalAmount');
        
        if (!couponInput?.value) {
            this.showCouponError('쿠폰 코드를 입력해주세요.');
            return;
        }

        const amount = parseInt(amountInput?.value || '0');
        if (amount <= 0) {
            this.showCouponError('결제 금액을 먼저 확인해주세요.');
            return;
        }

        const result = this.applyCoupon(couponInput.value, amount);
        
        if (result.success) {
            this.showCouponSuccess(result.message);
            this.previewDiscount(couponInput.value, amount);
            
            // 결제 시스템에 할인 정보 전달
            if (window.paymentSystem) {
                window.paymentSystem.applyCouponDiscount(result);
            }
        } else {
            this.showCouponError(result.message);
        }
    }

    // 성공 메시지 표시
    showCouponSuccess(message) {
        const messageContainer = this.getOrCreateMessageContainer();
        messageContainer.innerHTML = `
            <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 animate-fade-in">
                <div class="flex items-center">
                    <span class="text-green-600 mr-2">🎉</span>
                    <span class="text-green-700 text-sm">${message}</span>
                </div>
            </div>
        `;
        setTimeout(() => messageContainer.innerHTML = '', 5000);
    }

    // 에러 메시지 표시
    showCouponError(message) {
        const messageContainer = this.getOrCreateMessageContainer();
        messageContainer.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 animate-fade-in">
                <div class="flex items-center">
                    <span class="text-red-600 mr-2">❌</span>
                    <span class="text-red-700 text-sm">${message}</span>
                </div>
            </div>
        `;
        setTimeout(() => messageContainer.innerHTML = '', 5000);
    }

    // 메시지 컨테이너 생성/조회
    getOrCreateMessageContainer() {
        let container = document.getElementById('couponMessages');
        if (!container) {
            container = document.createElement('div');
            container.id = 'couponMessages';
            const couponSection = document.getElementById('couponSection') || document.body;
            couponSection.insertBefore(container, couponSection.firstChild);
        }
        return container;
    }

    // 유틸리티 함수들
    formatPrice(price) {
        return price.toLocaleString('ko-KR');
    }

    getCouponGradient(category) {
        const gradients = {
            'beta': 'from-purple-50 to-pink-50 border-purple-200',
            'welcome': 'from-blue-50 to-cyan-50 border-blue-200',
            'referral': 'from-green-50 to-emerald-50 border-green-200',
            'review': 'from-orange-50 to-yellow-50 border-orange-200'
        };
        return gradients[category] || 'from-gray-50 to-gray-100 border-gray-200';
    }

    getCouponBadgeColor(category) {
        const colors = {
            'beta': 'bg-purple-500',
            'welcome': 'bg-blue-500',
            'referral': 'bg-green-500',
            'review': 'bg-orange-500'
        };
        return colors[category] || 'bg-gray-500';
    }

    getCategoryName(category) {
        const names = {
            'beta': '베타',
            'welcome': '신규',
            'referral': '추천',
            'review': '리뷰'
        };
        return names[category] || '일반';
    }

    // 사용자 쿠폰 목록 조회
    async loadAvailableCoupons() {
        try {
            // TODO: 실제 API에서 사용자별 쿠폰 조회
            // const response = await fetch(`${this.apiUrl}/user-coupons`);
            // this.userCoupons = await response.json();
            console.log('📋 쿠폰 목록 로드 완료');
        } catch (error) {
            console.warn('⚠️ 쿠폰 로드 실패, 로컬 쿠폰 사용:', error);
        }
    }

    // 특별 쿠폰 발급 (친구 추천, 리뷰 등)
    async issueCoupon(userId, couponCode, reason = '') {
        try {
            console.log(`🎫 쿠폰 발급: ${couponCode} (사유: ${reason})`);
            
            // 로컬스토리지에 발급된 쿠폰 기록
            const issuedCoupons = JSON.parse(localStorage.getItem('issuedCoupons') || '[]');
            issuedCoupons.push({
                code: couponCode,
                userId: userId,
                reason: reason,
                issuedAt: new Date().toISOString()
            });
            localStorage.setItem('issuedCoupons', JSON.stringify(issuedCoupons));
            
            this.showCouponSuccess(`새로운 쿠폰이 발급되었습니다! 코드: ${couponCode}`);
            
            return { success: true, couponCode: couponCode };
        } catch (error) {
            console.error('❌ 쿠폰 발급 실패:', error);
            return { success: false, error: error.message };
        }
    }
}

// 전역 쿠폰 시스템 초기화
let couponSystem;

document.addEventListener('DOMContentLoaded', function() {
    couponSystem = new CouponSystem();
    window.couponSystem = couponSystem; // 전역 접근 가능
});

// 베타 테스트 자동 쿠폰 지급 함수
function grantBetaTesterCoupons() {
    if (couponSystem) {
        couponSystem.showCouponSuccess('🎉 베타 테스터로 등록되었습니다! BETA70 쿠폰이 자동으로 적용됩니다.');
        
        // 쿠폰 입력창에 자동 입력
        const couponInput = document.getElementById('couponCode');
        if (couponInput) {
            couponInput.value = 'BETA70';
        }
    }
}

// 친구 추천 쿠폰 발급
function issueReferralCoupon(referrerUserId, newUserId) {
    if (couponSystem) {
        // 추천인에게 쿠폰 발급
        couponSystem.issueCoupon(referrerUserId, 'FRIEND10K', '친구 추천');
        // 신규 가입자에게도 쿠폰 발급  
        couponSystem.issueCoupon(newUserId, 'FRIEND10K', '친구 추천으로 가입');
    }
}

console.log('🎫 BeautyCat 쿠폰 시스템 로드 완료!');