// 캐시 버스팅이 적용된 auth.js 수정 버전
// 버전: 2024-10-29-v2

console.log('🔧 Auth.js 캐시 버스팅 버전 로드됨 - v2');

// 강제 API URL 설정 (캐시 우회)
const FORCED_API_BASE = 'https://beautycat-api.jansmakr.workers.dev/api';

// 전역 변수
let currentUser = null;
let sessionToken = null;
let emailCheckResult = false;

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 캐시 버스팅 Auth 초기화 시작');
    initializeAuthApp();
    checkExistingSession();
});

// API Base URL 헬퍼 함수 (강제 설정)
function getApiBaseUrl() {
    const configUrl = window.BEAUTYCAT_CONFIG?.API_BASE_URL;
    const finalUrl = configUrl || FORCED_API_BASE;
    console.log('🔗 API URL 확정:', finalUrl);
    return finalUrl;
}

// 캐시 버스팅 fetch 함수
async function cacheBustingFetch(url, options = {}) {
    const timestamp = Date.now();
    const separator = url.includes('?') ? '&' : '?';
    const bustingUrl = `${url}${separator}_cb=${timestamp}`;
    
    console.log('📡 캐시 버스팅 요청:', bustingUrl);
    
    const response = await fetch(bustingUrl, {
        ...options,
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            ...options.headers
        }
    });
    
    console.log('📥 응답 상태:', response.status, response.statusText);
    return response;
}

// 로그인 처리 함수 (수정됨)
async function processLogin(loginData) {
    try {
        console.log('🔐 로그인 시도:', { email: loginData.email, user_type: loginData.user_type });
        
        // 강제 API URL 사용
        const apiUrl = `${FORCED_API_BASE}/tables/users`;
        console.log('🌐 사용할 API URL:', apiUrl);
        
        // 캐시 버스팅으로 사용자 데이터 요청
        const response = await cacheBustingFetch(`${apiUrl}?limit=100`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API 에러 응답:', response.status, errorText);
            throw new Error(`API 오류 (${response.status}): 사용자 데이터를 불러올 수 없습니다.`);
        }
        
        const userData = await response.json();
        console.log('✅ 사용자 데이터 로드 성공:', userData.data?.length || 0, '명');
        
        // 사용자 검색
        const user = userData.data?.find(u => 
            u.email === loginData.email && 
            u.user_type === loginData.user_type &&
            u.is_active !== false
        );
        
        if (user) {
            console.log('👤 사용자 발견:', user.name, user.user_type);
            
            // 비밀번호 확인
            if (user.password === loginData.password) {
                console.log('✅ 로그인 성공!');
                
                // 세션 토큰 생성
                const sessionToken = generateSessionToken();
                
                // 세션 저장
                saveSession({
                    user: user,
                    token: sessionToken,
                    loginTime: new Date().toISOString()
                });
                
                return {
                    success: true,
                    user: user,
                    token: sessionToken,
                    message: `${user.name}님, 환영합니다!`
                };
            } else {
                console.log('❌ 비밀번호 불일치');
                return {
                    success: false,
                    message: '비밀번호가 일치하지 않습니다.'
                };
            }
        } else {
            console.log('❌ 사용자 없음:', loginData.email, loginData.user_type);
            return {
                success: false,
                message: '등록되지 않은 이메일이거나 사용자 유형이 다릅니다.'
            };
        }
        
    } catch (error) {
        console.error('💥 로그인 처리 오류:', error);
        return {
            success: false,
            message: error.message || '로그인 중 오류가 발생했습니다.'
        };
    }
}

// 세션 토큰 생성
function generateSessionToken() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// 세션 저장
function saveSession(sessionData) {
    try {
        localStorage.setItem('beautycat_session', JSON.stringify(sessionData));
        sessionStorage.setItem('beautycat_token', sessionData.token);
        currentUser = sessionData.user;
        sessionToken = sessionData.token;
        console.log('💾 세션 저장 완료');
    } catch (error) {
        console.error('💥 세션 저장 실패:', error);
    }
}

// 기존 세션 확인
function checkExistingSession() {
    try {
        const savedSession = localStorage.getItem('beautycat_session');
        if (savedSession) {
            const session = JSON.parse(savedSession);
            console.log('🔍 기존 세션 발견:', session.user?.name);
            currentUser = session.user;
            sessionToken = session.token;
        }
    } catch (error) {
        console.error('💥 세션 확인 오류:', error);
    }
}

// 로그인 폼 이벤트 처리
async function handleLogin(e) {
    e.preventDefault();
    console.log('📋 로그인 폼 제출됨');
    
    const loginBtn = e.target.querySelector('button[type="submit"]');
    const originalText = loginBtn.innerHTML;
    
    // 버튼 상태 변경
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>로그인 중...';
    }
    
    try {
        // 폼 데이터 수집
        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email') || '',
            password: formData.get('password') || '',
            user_type: document.querySelector('input[name="userType"]:checked')?.value || '',
            remember_me: false
        };
        
        console.log('📊 로그인 데이터:', { 
            email: loginData.email, 
            user_type: loginData.user_type 
        });
        
        // 유효성 검증
        if (!loginData.email || !loginData.password || !loginData.user_type) {
            throw new Error('모든 필드를 입력해주세요.');
        }
        
        // 로그인 처리
        const result = await processLogin(loginData);
        
        if (result.success) {
            console.log('🎉 로그인 성공! 리다이렉트 중...');
            
            // 성공 메시지
            if (window.showCustomAlert) {
                window.showCustomAlert(result.message);
            } else {
                alert(result.message);
            }
            
            // 사용자 타입별 리다이렉트
            setTimeout(() => {
                if (result.user.user_type === 'customer') {
                    window.location.href = 'customer-dashboard.html';
                } else if (result.user.user_type === 'shop') {
                    window.location.href = 'shop-dashboard.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1500);
            
        } else {
            console.log('❌ 로그인 실패:', result.message);
            if (window.showCustomAlert) {
                window.showCustomAlert(result.message);
            } else {
                alert(result.message);
            }
        }
        
    } catch (error) {
        console.error('💥 로그인 에러:', error);
        const message = error.message || '로그인 중 오류가 발생했습니다.';
        if (window.showCustomAlert) {
            window.showCustomAlert(message);
        } else {
            alert(message);
        }
    } finally {
        // 버튼 복구
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = originalText;
        }
    }
}

// 인증 앱 초기화
function initializeAuthApp() {
    console.log('🎯 Auth 앱 초기화');
    
    // 로그인 폼 이벤트 리스너
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('📝 로그인 폼 이벤트 리스너 등록됨');
    }
}

// API 테스트 함수 (디버깅용)
window.testLoginAPI = async function() {
    try {
        console.log('🧪 API 테스트 시작');
        const response = await cacheBustingFetch(`${FORCED_API_BASE}/tables/users?limit=5`);
        const data = await response.json();
        console.log('✅ API 테스트 성공:', data);
        return data;
    } catch (error) {
        console.error('❌ API 테스트 실패:', error);
        return error;
    }
};

console.log('🚀 캐시 버스팅 Auth.js 로드 완료 - testLoginAPI() 함수 사용 가능');