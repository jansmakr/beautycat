// 뽀샵 완전 독립형 인증 시스템 - 서버 없이 작동
// 가성비 인증 + 로컬 데이터베이스로 500 오류 해결

class StandaloneAuth {
    constructor() {
        this.users = this.initializeUsers();
        this.currentUser = null;
        this.authToken = null;
        this.init();
        
        console.log('🚀 뽀샵 독립형 인증 시스템 초기화 완료');
        console.log('👥 등록된 사용자 수:', this.users.length);
    }
    
    // 초기 사용자 데이터 생성 (로컬 DB 역할)
    initializeUsers() {
        const defaultUsers = [
            {
                id: 'user_001',
                email: 'customer@pposhop.com',
                password: 'demo123',
                name: '김고객',
                role: 'customer',
                phone: '01012345678',
                created_at: new Date().toISOString(),
                is_verified: false
            },
            {
                id: 'user_002', 
                email: 'shop@pposhop.com',
                password: 'demo123',
                name: '뽀샵 강남점',
                role: 'shop',
                phone: '01087654321',
                created_at: new Date().toISOString(),
                is_verified: true,
                business_number: '123-45-67890'
            },
            {
                id: 'user_003',
                email: 'admin@pposhop.com', 
                password: 'admin123',
                name: '관리자',
                role: 'admin',
                phone: '01099999999',
                created_at: new Date().toISOString(),
                is_verified: true
            },
            {
                id: 'user_004',
                email: 'test@example.com',
                password: 'test123', 
                name: '테스트 사용자',
                role: 'customer',
                phone: '01011111111',
                created_at: new Date().toISOString(),
                is_verified: false
            }
        ];
        
        // 로컬 스토리지에서 사용자 데이터 로드
        const savedUsers = localStorage.getItem('pposhop_users');
        if (savedUsers) {
            try {
                const parsed = JSON.parse(savedUsers);
                console.log('📚 저장된 사용자 데이터 로드:', parsed.length, '명');
                return parsed;
            } catch (error) {
                console.warn('⚠️ 저장된 사용자 데이터 파싱 실패, 기본값 사용');
            }
        }
        
        // 기본 사용자 데이터 저장
        this.saveUsers(defaultUsers);
        return defaultUsers;
    }
    
    // 사용자 데이터 로컬 저장
    saveUsers(users = this.users) {
        try {
            localStorage.setItem('pposhop_users', JSON.stringify(users));
            console.log('💾 사용자 데이터 저장 완료:', users.length, '명');
        } catch (error) {
            console.error('❌ 사용자 데이터 저장 실패:', error);
        }
    }
    
    // 로그인 처리 
    async login(email, password) {
        try {
            console.log('🔐 로그인 시도:', email);
            
            // 사용자 찾기
            const user = this.users.find(u => u.email === email);
            
            if (!user) {
                throw new Error('존재하지 않는 이메일입니다.');
            }
            
            // 비밀번호 확인
            if (user.password !== password) {
                throw new Error('비밀번호가 일치하지 않습니다.');
            }
            
            // JWT 토큰 생성 (단순화)
            this.authToken = this.generateToken(user);
            this.currentUser = { ...user };
            delete this.currentUser.password; // 보안상 비밀번호 제거
            
            // 세션 저장
            localStorage.setItem('pposhop_auth_token', this.authToken);
            localStorage.setItem('pposhop_current_user', JSON.stringify(this.currentUser));
            
            console.log('✅ 로그인 성공:', user.name, `(${user.role})`);
            
            return {
                success: true,
                message: '로그인이 완료되었습니다.',
                user: this.currentUser,
                token: this.authToken,
                redirect_url: this.getRedirectUrl(user.role)
            };
            
        } catch (error) {
            console.error('❌ 로그인 실패:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // 회원가입 처리
    async register(userData) {
        try {
            console.log('📝 회원가입 시도:', userData.email);
            
            // 이메일 중복 확인
            if (this.users.some(u => u.email === userData.email)) {
                throw new Error('이미 등록된 이메일입니다.');
            }
            
            // 전화번호 중복 확인
            if (this.users.some(u => u.phone === userData.phone)) {
                throw new Error('이미 등록된 전화번호입니다.');
            }
            
            // 새 사용자 생성
            const newUser = {
                id: 'user_' + Date.now(),
                email: userData.email,
                password: userData.password,
                name: userData.name,
                role: userData.role || 'customer',
                phone: userData.phone,
                created_at: new Date().toISOString(),
                is_verified: false,
                ...userData
            };
            
            // 사용자 추가 및 저장
            this.users.push(newUser);
            this.saveUsers();
            
            console.log('✅ 회원가입 성공:', newUser.name);
            
            return {
                success: true,
                message: '회원가입이 완료되었습니다.',
                user_id: newUser.id
            };
            
        } catch (error) {
            console.error('❌ 회원가입 실패:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // 자동 로그인 (저장된 세션 복구)
    autoLogin() {
        try {
            const savedToken = localStorage.getItem('pposhop_auth_token');
            const savedUser = localStorage.getItem('pposhop_current_user');
            
            if (savedToken && savedUser) {
                this.authToken = savedToken;
                this.currentUser = JSON.parse(savedUser);
                
                console.log('🔄 자동 로그인 성공:', this.currentUser.name);
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.warn('⚠️ 자동 로그인 실패:', error);
            return false;
        }
    }
    
    // 로그아웃
    logout() {
        this.currentUser = null;
        this.authToken = null;
        
        localStorage.removeItem('pposhop_auth_token');
        localStorage.removeItem('pposhop_current_user');
        
        console.log('👋 로그아웃 완료');
        
        return {
            success: true,
            message: '로그아웃되었습니다.'
        };
    }
    
    // 현재 사용자 정보 조회
    getCurrentUser() {
        if (!this.currentUser) {
            // 자동 로그인 시도
            this.autoLogin();
        }
        
        return this.currentUser;
    }
    
    // 인증 토큰 확인
    isAuthenticated() {
        return !!this.getCurrentUser();
    }
    
    // 사용자 목록 조회 (관리자용)
    getAllUsers() {
        return this.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }
    
    // 사용자 정보 업데이트
    updateUser(userId, updateData) {
        try {
            const userIndex = this.users.findIndex(u => u.id === userId);
            
            if (userIndex === -1) {
                throw new Error('사용자를 찾을 수 없습니다.');
            }
            
            // 업데이트 적용
            this.users[userIndex] = { 
                ...this.users[userIndex], 
                ...updateData,
                updated_at: new Date().toISOString()
            };
            
            // 저장
            this.saveUsers();
            
            // 현재 사용자가 업데이트된 경우 세션 갱신
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = { ...this.users[userIndex] };
                delete this.currentUser.password;
                localStorage.setItem('pposhop_current_user', JSON.stringify(this.currentUser));
            }
            
            console.log('✅ 사용자 정보 업데이트:', userId);
            
            return {
                success: true,
                message: '사용자 정보가 업데이트되었습니다.'
            };
            
        } catch (error) {
            console.error('❌ 사용자 업데이트 실패:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // 비밀번호 변경
    changePassword(userId, currentPassword, newPassword) {
        try {
            const user = this.users.find(u => u.id === userId);
            
            if (!user) {
                throw new Error('사용자를 찾을 수 없습니다.');
            }
            
            if (user.password !== currentPassword) {
                throw new Error('현재 비밀번호가 일치하지 않습니다.');
            }
            
            user.password = newPassword;
            user.updated_at = new Date().toISOString();
            
            this.saveUsers();
            
            console.log('✅ 비밀번호 변경 완료:', userId);
            
            return {
                success: true,
                message: '비밀번호가 변경되었습니다.'
            };
            
        } catch (error) {
            console.error('❌ 비밀번호 변경 실패:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // JWT 토큰 생성 (단순화)
    generateToken(user) {
        const payload = {
            user_id: user.id,
            email: user.email,
            role: user.role,
            issued_at: Date.now(),
            expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24시간
        };
        
        // 실제로는 암호화해야 하지만, 데모용으로 단순 인코딩
        return btoa(JSON.stringify(payload));
    }
    
    // 토큰 검증
    validateToken(token) {
        try {
            if (!token) return false;
            
            const payload = JSON.parse(atob(token));
            
            // 만료 시간 확인
            if (Date.now() > payload.expires_at) {
                console.warn('⚠️ 토큰 만료');
                return false;
            }
            
            return payload;
            
        } catch (error) {
            console.warn('⚠️ 토큰 검증 실패:', error);
            return false;
        }
    }
    
    // 역할별 리다이렉트 URL 결정
    getRedirectUrl(role) {
        const redirectUrls = {
            customer: 'customer-dashboard.html',
            shop: 'shop-dashboard.html', 
            admin: 'admin-dashboard.html'
        };
        
        return redirectUrls[role] || 'customer-dashboard.html';
    }
    
    // 초기화
    init() {
        // 페이지 로드시 자동 로그인 시도
        this.autoLogin();
        
        // 전역 함수로 노출
        window.standaloneAuth = this;
        
        // 기존 auth.js 함수들 오버라이드
        this.overrideAuthFunctions();
    }
    
    // 기존 auth.js 함수들을 대체
    overrideAuthFunctions() {
        // 전역 로그인 함수 오버라이드
        window.handleLogin = async (event) => {
            if (event) {
                event.preventDefault();
            }
            
            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;
            
            if (!email || !password) {
                this.showMessage('이메일과 비밀번호를 입력해주세요.', 'error');
                return;
            }
            
            const result = await this.login(email, password);
            
            if (result.success) {
                this.showMessage('로그인 성공!', 'success');
                
                setTimeout(() => {
                    window.location.href = result.redirect_url;
                }, 1000);
            } else {
                this.showMessage(result.error, 'error');
            }
        };
        
        // 데모 계정 로드 함수 오버라이드
        window.loadDemoAccounts = () => {
            console.log('📚 데모 계정 로드 (독립형)');
            
            const demoAccounts = [
                { email: 'customer@pposhop.com', password: 'demo123', role: '고객' },
                { email: 'shop@pposhop.com', password: 'demo123', role: '업체' },
                { email: 'admin@pposhop.com', password: 'admin123', role: '관리자' }
            ];
            
            const container = document.getElementById('demoAccounts');
            if (container) {
                container.innerHTML = demoAccounts.map(account => `
                    <div class="demo-account" onclick="fillLoginForm('${account.email}', '${account.password}')">
                        <strong>${account.role}</strong><br>
                        ${account.email}
                    </div>
                `).join('');
                
                container.style.display = 'block';
            }
            
            return demoAccounts;
        };
        
        // 로그인 폼 자동 채우기
        window.fillLoginForm = (email, password) => {
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            
            if (emailInput) emailInput.value = email;
            if (passwordInput) passwordInput.value = password;
            
            console.log('📝 데모 계정 정보 자동 입력:', email);
        };
        
        console.log('🔄 기존 auth.js 함수들 독립형으로 교체 완료');
    }
    
    // 메시지 표시
    showMessage(message, type = 'info') {
        // 기존 메시지 제거
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 새 메시지 생성
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message auth-message-${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        // 타입별 스타일
        const styles = {
            success: 'background: #10b981; color: white;',
            error: 'background: #ef4444; color: white;',
            info: 'background: #3b82f6; color: white;'
        };
        
        messageDiv.style.cssText += styles[type] || styles.info;
        messageDiv.textContent = message;
        
        // CSS 애니메이션 추가
        if (!document.querySelector('#auth-message-style')) {
            const style = document.createElement('style');
            style.id = 'auth-message-style';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(messageDiv);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => {
                    messageDiv.remove();
                }, 300);
            }
        }, 3000);
        
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
    }
    
    // 통계 정보 제공
    getStats() {
        const stats = {
            total_users: this.users.length,
            customers: this.users.filter(u => u.role === 'customer').length,
            shops: this.users.filter(u => u.role === 'shop').length,
            admins: this.users.filter(u => u.role === 'admin').length,
            verified_users: this.users.filter(u => u.is_verified).length,
            current_user: this.currentUser?.name || null,
            is_authenticated: this.isAuthenticated()
        };
        
        console.log('📊 뽀샵 사용자 통계:', stats);
        return stats;
    }
}

// 전역 인스턴스 생성
const pposhopAuth = new StandaloneAuth();

// 페이지 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 뽀샵 독립형 인증 시스템 활성화');
    
    // 데모 계정 자동 로드 (안전한 호출)
    try {
        if (typeof loadDemoAccounts === 'function') {
            loadDemoAccounts();
        }
    } catch (error) {
        // 오류 발생 시 조용히 처리 (프로덕션 환경 대응)
    }
    
    // 현재 사용자 정보 표시
    const stats = pposhopAuth.getStats();
    console.log('👤 현재 로그인 상태:', stats.current_user || '로그아웃');
});

// 전역 노출
window.pposhopAuth = pposhopAuth;

console.log('✅ 뽀샵 독립형 인증 시스템 로드 완료!');
console.log('💡 사용법: pposhopAuth.login(email, password)');
console.log('📊 통계: pposhopAuth.getStats()');

// 즉시 테스트 가능한 함수
window.testPposhopAuth = function() {
    console.log('🧪 뽀샵 인증 시스템 테스트 시작...');
    
    // 테스트 로그인
    pposhopAuth.login('customer@pposhop.com', 'demo123').then(result => {
        if (result.success) {
            console.log('✅ 테스트 로그인 성공');
            console.log('👤 로그인 사용자:', result.user.name);
            
            // 통계 출력
            pposhopAuth.getStats();
        } else {
            console.log('❌ 테스트 로그인 실패:', result.error);
        }
    });
};