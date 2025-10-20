// 뽀샵 실명인증 시스템 - 나이스페이먼츠 연동
class IdentityAuthManager {
    constructor() {
        this.config = {
            // 나이스페이먼츠 설정 (실제 값으로 교체 필요)
            merchant_id: 'pposhop_test', // 가맹점 ID
            merchant_key: 'test_key_12345', // 가맹점 키
            api_url: 'https://web.nicepay.co.kr/v3/auth/', // API URL
            
            // 인증 설정
            auth_types: {
                mobile: 'MOBILE', // 휴대폰 인증
                ipin: 'IPIN',     // 아이핀 인증
                card: 'CARD'      // 신용카드 인증
            },
            
            return_url: window.location.origin + '/auth/callback',
            
            // 비용 설정 (월별 예상 비용 계산용)
            pricing: {
                monthly_fee: 30000,    // 월정액 3만원
                per_auth_fee: 150,     // 건당 150원
                free_limit: 200        // 월 200건 무료
            }
        };
        
        this.currentAuth = null;
        this.init();
    }
    
    // 초기화
    init() {
        this.setupEventListeners();
        this.loadAuthHistory();
    }
    
    // 휴대폰 본인인증 시작
    async startMobileAuth(userData) {
        try {
            console.log('휴대폰 인증 시작:', userData.name);
            
            // 1단계: 인증 요청 데이터 생성
            const authData = this.createMobileAuthData(userData);
            
            // 2단계: 서명 생성 (보안)
            const signature = this.generateSignature(authData);
            authData.signature = signature;
            
            // 3단계: 나이스페이먼츠 API 호출
            const response = await this.callNicePayAPI(authData);
            
            if (response.success) {
                // 4단계: 인증 창 팝업
                this.openAuthPopup(response.auth_url);
                
                // 5단계: 결과 대기
                this.waitForAuthResult(response.auth_token);
                
                return {
                    success: true,
                    message: '인증 창이 열렸습니다. 인증을 완료해주세요.',
                    auth_token: response.auth_token
                };
            } else {
                throw new Error(response.message || '인증 요청 실패');
            }
            
        } catch (error) {
            console.error('휴대폰 인증 실패:', error);
            return {
                success: false,
                message: error.message || '인증 요청 중 오류가 발생했습니다.'
            };
        }
    }
    
    // 휴대폰 인증 데이터 생성
    createMobileAuthData(userData) {
        const timestamp = new Date().toISOString();
        const orderId = 'AUTH_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        return {
            // 기본 정보
            merchant_id: this.config.merchant_id,
            order_id: orderId,
            timestamp: timestamp,
            
            // 인증 방식
            auth_type: this.config.auth_types.mobile,
            
            // 사용자 정보
            name: userData.name,
            birth_date: userData.birthDate,
            phone_number: userData.phoneNumber.replace(/[^0-9]/g, ''),
            
            // 콜백 URL
            return_url: this.config.return_url,
            
            // 추가 옵션
            popup_yn: 'Y',     // 팝업 사용
            timeout: 180,      // 3분 타임아웃
            
            // 뽀샵 관련 정보
            service_name: '뽀샵 본인인증',
            user_id: this.getCurrentUserId() || 'guest'
        };
    }
    
    // 서명 생성 (보안을 위한 해시)
    generateSignature(data) {
        // 실제로는 HMAC-SHA256 등을 사용해야 함
        const signString = [
            data.merchant_id,
            data.order_id, 
            data.timestamp,
            data.auth_type,
            this.config.merchant_key
        ].join('|');
        
        // 간단한 해시 (실제로는 crypto 라이브러리 사용)
        return btoa(signString).replace(/[+/=]/g, '');
    }
    
    // 나이스페이먼츠 API 호출 (실제로는 서버에서 처리)
    async callNicePayAPI(authData) {
        try {
            // 실제 운영에서는 백엔드 API를 통해 호출
            const response = await fetch('/api/auth/nice/mobile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.getAuthToken()
                },
                body: JSON.stringify(authData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'API 호출 실패');
            }
            
            return result;
            
        } catch (error) {
            // 개발/테스트용 Mock 응답
            console.warn('실제 API 대신 Mock 응답 사용:', error.message);
            
            return this.getMockAuthResponse(authData);
        }
    }
    
    // 개발용 Mock 응답
    getMockAuthResponse(authData) {
        // 50% 확률로 성공/실패 시뮬레이션
        const success = Math.random() > 0.1; // 90% 성공률
        
        if (success) {
            return {
                success: true,
                auth_token: 'mock_token_' + Date.now(),
                auth_url: this.createMockAuthUrl(authData),
                expires_in: 180
            };
        } else {
            return {
                success: false,
                error_code: 'AUTH_FAILED',
                message: '통신사 서버 일시 장애입니다. 잠시 후 다시 시도해주세요.'
            };
        }
    }
    
    // Mock 인증 URL 생성 (개발용)
    createMockAuthUrl(authData) {
        const params = new URLSearchParams({
            merchant_id: authData.merchant_id,
            order_id: authData.order_id,
            name: authData.name,
            phone: authData.phone_number,
            return_url: authData.return_url
        });
        
        return '/mock-auth.html?' + params.toString();
    }
    
    // 인증 팝업 창 열기
    openAuthPopup(authUrl) {
        const popup = window.open(
            authUrl,
            'nice_auth_popup',
            'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        
        this.authPopup = popup;
        
        // 팝업 차단 확인
        if (!popup || popup.closed) {
            alert('팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.');
            return false;
        }
        
        // 팝업 닫힘 감지
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                this.onAuthPopupClosed();
            }
        }, 1000);
        
        return true;
    }
    
    // 인증 결과 대기
    async waitForAuthResult(authToken) {
        return new Promise((resolve, reject) => {
            this.authResultPromise = { resolve, reject };
            
            // 3분 타임아웃
            setTimeout(() => {
                if (this.authResultPromise) {
                    this.authResultPromise.reject(new Error('인증 시간이 초과되었습니다.'));
                    this.authResultPromise = null;
                }
            }, 180000);
        });
    }
    
    // 인증 결과 수신 (콜백에서 호출)
    handleAuthResult(result) {
        if (this.authResultPromise) {
            if (result.success) {
                this.authResultPromise.resolve(result);
            } else {
                this.authResultPromise.reject(new Error(result.message));
            }
            this.authResultPromise = null;
        }
        
        // 팝업 닫기
        if (this.authPopup && !this.authPopup.closed) {
            this.authPopup.close();
        }
        
        // 결과 처리
        this.processAuthResult(result);
    }
    
    // 인증 결과 처리
    async processAuthResult(result) {
        try {
            if (result.success) {
                // 성공 시 사용자 정보 업데이트
                await this.updateUserVerification(result.user_info);
                
                // 성공 메시지
                this.showSuccessMessage('본인인증이 완료되었습니다!');
                
                // 페이지 리다이렉트
                setTimeout(() => {
                    window.location.href = result.redirect_url || '/dashboard';
                }, 2000);
                
            } else {
                // 실패 시 오류 메시지
                this.showErrorMessage(result.message || '인증에 실패했습니다.');
            }
            
        } catch (error) {
            console.error('인증 결과 처리 실패:', error);
            this.showErrorMessage('인증 처리 중 오류가 발생했습니다.');
        }
    }
    
    // 사용자 인증 정보 업데이트
    async updateUserVerification(userInfo) {
        try {
            const response = await fetch('/api/user/verification', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.getAuthToken()
                },
                body: JSON.stringify({
                    name: userInfo.name,
                    birth_date: userInfo.birth_date,
                    phone_number: userInfo.phone_number,
                    verification_method: 'mobile',
                    verification_date: new Date().toISOString(),
                    verification_provider: 'nicepay'
                })
            });
            
            if (!response.ok) {
                throw new Error('사용자 정보 업데이트 실패');
            }
            
            // 로컬 스토리지에도 인증 상태 저장
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            user.is_verified = true;
            user.verification_date = new Date().toISOString();
            localStorage.setItem('currentUser', JSON.stringify(user));
            
        } catch (error) {
            console.error('사용자 정보 업데이트 실패:', error);
        }
    }
    
    // 아이핀 인증
    startIpinAuth() {
        const ipinUrl = 'https://cert.vno.co.kr/ipin.cb';
        this.openAuthPopup(ipinUrl);
    }
    
    // 카카오 간편 인증
    async startKakaoAuth() {
        try {
            // 카카오 SDK 초기화 확인
            if (typeof Kakao === 'undefined') {
                throw new Error('카카오 SDK가 로드되지 않았습니다.');
            }
            
            // 카카오 로그인
            Kakao.Auth.login({
                success: (authObj) => {
                    this.getKakaoUserInfo(authObj.access_token);
                },
                fail: (err) => {
                    console.error('카카오 로그인 실패:', err);
                    alert('카카오 로그인에 실패했습니다.');
                }
            });
            
        } catch (error) {
            console.error('카카오 인증 실패:', error);
            alert(error.message);
        }
    }
    
    // 카카오 사용자 정보 조회
    getKakaoUserInfo(accessToken) {
        Kakao.API.request({
            url: '/v2/user/me',
            success: (res) => {
                const userInfo = {
                    name: res.kakao_account.profile.nickname,
                    phone_number: res.kakao_account.phone_number,
                    email: res.kakao_account.email
                };
                
                this.processAuthResult({
                    success: true,
                    user_info: userInfo,
                    verification_method: 'kakao'
                });
            },
            fail: (error) => {
                console.error('카카오 사용자 정보 조회 실패:', error);
                alert('사용자 정보 조회에 실패했습니다.');
            }
        });
    }
    
    // 인증 비용 계산
    calculateMonthlyCost(monthlyAuthCount) {
        const { monthly_fee, per_auth_fee, free_limit } = this.config.pricing;
        
        if (monthlyAuthCount <= free_limit) {
            return monthly_fee;
        } else {
            const additionalCost = (monthlyAuthCount - free_limit) * per_auth_fee;
            return monthly_fee + additionalCost;
        }
    }
    
    // 인증 통계 조회
    async getAuthStats() {
        try {
            const response = await fetch('/api/auth/stats', {
                headers: {
                    'Authorization': 'Bearer ' + this.getAuthToken()
                }
            });
            
            const stats = await response.json();
            
            return {
                monthly_count: stats.monthly_count || 0,
                success_rate: stats.success_rate || 0,
                monthly_cost: this.calculateMonthlyCost(stats.monthly_count),
                most_used_method: stats.most_used_method || 'mobile'
            };
            
        } catch (error) {
            console.error('인증 통계 조회 실패:', error);
            return null;
        }
    }
    
    // 유틸리티 함수들
    getCurrentUserId() {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return user.id;
    }
    
    getAuthToken() {
        return localStorage.getItem('authToken') || '';
    }
    
    showSuccessMessage(message) {
        // 성공 토스트 메시지 표시
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    showErrorMessage(message) {
        // 에러 토스트 메시지 표시
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        // 메시지 수신 리스너 (팝업에서 온 결과)
        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'AUTH_RESULT') {
                this.handleAuthResult(event.data.result);
            }
        });
        
        // 페이지 언로드 시 팝업 정리
        window.addEventListener('beforeunload', () => {
            if (this.authPopup && !this.authPopup.closed) {
                this.authPopup.close();
            }
        });
    }
    
    // 팝업 닫힘 처리
    onAuthPopupClosed() {
        if (this.authResultPromise) {
            this.authResultPromise.reject(new Error('사용자가 인증을 취소했습니다.'));
            this.authResultPromise = null;
        }
    }
    
    // 인증 히스토리 로드
    loadAuthHistory() {
        const history = JSON.parse(localStorage.getItem('authHistory') || '[]');
        this.authHistory = history;
    }
    
    // 인증 히스토리 저장
    saveAuthHistory(authData) {
        this.authHistory = this.authHistory || [];
        this.authHistory.push({
            ...authData,
            timestamp: new Date().toISOString()
        });
        
        // 최대 10개만 보관
        if (this.authHistory.length > 10) {
            this.authHistory = this.authHistory.slice(-10);
        }
        
        localStorage.setItem('authHistory', JSON.stringify(this.authHistory));
    }
}

// 전역 인스턴스 생성
const identityAuth = new IdentityAuthManager();

// 전역 함수로 노출 (HTML에서 사용)
window.requestMobileAuth = async function(data) {
    return await identityAuth.startMobileAuth(data);
};

window.startKakaoAuth = function() {
    return identityAuth.startKakaoAuth();
};

window.startIpinAuth = function() {
    return identityAuth.startIpinAuth();
};

// 인증 결과 수신 함수 (콜백 페이지에서 사용)
window.receiveAuthResult = function(result) {
    identityAuth.handleAuthResult(result);
};

console.log('🔐 뽀샵 실명인증 시스템 로드 완료');

// 사용 예시:
/*
// 휴대폰 인증 시작
const result = await requestMobileAuth({
    name: '홍길동',
    birthDate: '901234', 
    phoneNumber: '01012345678'
});

// 인증 비용 계산
const monthlyCost = identityAuth.calculateMonthlyCost(500); // 월 500건
console.log('월 예상 비용:', monthlyCost.toLocaleString() + '원');

// 인증 통계 조회  
const stats = await identityAuth.getAuthStats();
console.log('인증 통계:', stats);
*/