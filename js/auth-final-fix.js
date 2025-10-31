// BeautyCat Auth - 최종 수정 버전 (v2024.10.29-final)
console.log('🔧 Auth.js 최종 수정 버전 로드됨');

// 전역 변수
let currentUser = null;
let sessionToken = null;
let emailCheckResult = false;

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 최종 Auth 초기화');
    initializeAuthApp();
    checkExistingSession();
});

// API Base URL (강제 설정)
const FORCE_API_BASE = 'https://beautycat-api.jansmakr.workers.dev/api';

function getApiBaseUrl() {
    console.log('🔗 강제 API URL 사용:', FORCE_API_BASE);
    return FORCE_API_BASE;
}

// 캐시 버스팅 fetch
async function safeFetch(url, options = {}) {
    const timestamp = Date.now();
    const separator = url.includes('?') ? '&' : '?';
    const cacheBustUrl = `${url}${separator}_cb=${timestamp}`;
    
    console.log('📡 요청:', cacheBustUrl);
    
    const response = await fetch(cacheBustUrl, {
        ...options,
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    
    console.log('📥 응답:', response.status, response.statusText);
    return response;
}

// 로그인 처리
async function processLogin(loginData) {
    try {
        console.log('🔐 로그인 시도:', { email: loginData.email, user_type: loginData.user_type });
        
        const apiUrl = `${FORCE_API_BASE}/tables/users`;
        const response = await safeFetch(`${apiUrl}?limit=100`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API 응답 오류:', response.status, errorText.substring(0, 200));
            throw new Error(`API 연결 실패 (${response.status})`);
        }
        
        const userData = await response.json();
        console.log('✅ 사용자 데이터:', userData.data?.length || 0, '명');
        
        const user = userData.data?.find(u => 
            u.email === loginData.email && 
            u.user_type === loginData.user_type &&
            u.is_active !== false
        );
        
        if (!user) {
            console.log('❌ 사용자 없음');
            return {
                success: false,
                message: '등록되지 않은 이메일이거나 사용자 유형이 다릅니다.'
            };
        }
        
        console.log('👤 사용자 발견:', user.name);
        
        if (user.password !== loginData.password) {
            console.log('❌ 비밀번호 불일치');
            return {
                success: false,
                message: '비밀번호가 일치하지 않습니다.'
            };
        }
        
        console.log('✅ 로그인 성공!');
        
        // 세션 저장
        const token = 'session_' + Math.random().toString(36).substr(2, 9);
        const session = {
            user: user,
            token: token,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('beautycat_session', JSON.stringify(session));
        sessionStorage.setItem('beautycat_token', token);
        currentUser = user;
        sessionToken = token;
        
        return {
            success: true,
            user: user,
            token: token,
            message: `${user.name}님, 환영합니다!`
        };
        
    } catch (error) {
        console.error('💥 로그인 오류:', error);
        return {
            success: false,
            message: error.message || '로그인 중 오류가 발생했습니다.'
        };
    }
}

// 로그인 폼 처리
async function handleLogin(e) {
    e.preventDefault();
    console.log('📋 로그인 폼 제출');
    
    const loginBtn = e.target.querySelector('button[type="submit"]');
    const originalText = loginBtn.innerHTML;
    
    // 로딩 상태
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>로그인 중...';
    }
    
    try {
        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email') || '',
            password: formData.get('password') || '',
            user_type: document.querySelector('input[name="userType"]:checked')?.value || ''
        };
        
        // 유효성 검사
        if (!loginData.email || !loginData.password || !loginData.user_type) {
            throw new Error('모든 필드를 입력해주세요.');
        }
        
        const result = await processLogin(loginData);
        
        if (result.success) {
            console.log('🎉 로그인 성공, 리다이렉트 중...');
            
            // 알림 표시
            if (window.showCustomAlert) {
                window.showCustomAlert(result.message);
            } else {
                alert(result.message);
            }
            
            // 리다이렉트
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
        console.error('💥 폼 처리 오류:', error);
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

// 세션 확인
function checkExistingSession() {
    try {
        const session = localStorage.getItem('beautycat_session');
        if (session) {
            const data = JSON.parse(session);
            currentUser = data.user;
            sessionToken = data.token;
            console.log('🔍 기존 세션 복구:', data.user?.name);
        }
    } catch (error) {
        console.log('⚠️ 세션 확인 오류:', error.message);
    }
}

// Auth 앱 초기화
function initializeAuthApp() {
    console.log('🎯 Auth 앱 초기화');
    
    // 로그인 폼 이벤트
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('📝 로그인 폼 연결됨');
    }
    
    // 사용자 타입 선택 이벤트 (기존 코드 유지)
    const userTypeInputs = document.querySelectorAll('input[name="userType"]');
    userTypeInputs.forEach(input => {
        input.addEventListener('change', updateUserTypeDisplay);
    });
    
    // 페이지별 초기화
    const pathname = window.location.pathname;
    if (pathname.includes('login.html')) {
        initializeLoginPage();
    }
}

// 사용자 타입 표시 업데이트 (기존 함수 유지)
function updateUserTypeDisplay() {
    const selectedType = document.querySelector('input[name="userType"]:checked')?.value;
    const selectedLabel = document.getElementById('selected-user-type');
    
    if (selectedLabel && selectedType) {
        const typeNames = {
            customer: '일반 고객',
            shop: '피부관리실',
            admin: '관리자'
        };
        
        selectedLabel.textContent = typeNames[selectedType] || selectedType;
    }
}

// 로그인 페이지 초기화 (기존 함수 유지)
function initializeLoginPage() {
    console.log('🎯 로그인 페이지 초기화');
    
    // 기본 사용자 타입 선택
    const defaultUserType = document.querySelector('input[name="userType"][value="customer"]');
    if (defaultUserType) {
        defaultUserType.checked = true;
        updateUserTypeDisplay();
    }
}

// 디버깅 함수
window.debugBeautyCatLogin = async function() {
    try {
        console.log('🧪 BeautyCat 로그인 디버그 시작');
        const response = await safeFetch(`${FORCE_API_BASE}/tables/users?limit=5`);
        const data = await response.json();
        console.log('✅ API 테스트 성공:', data);
        return data;
    } catch (error) {
        console.error('❌ API 테스트 실패:', error);
        return error;
    }
};

console.log('🚀 BeautyCat Auth 최종 버전 로드 완료 - debugBeautyCatLogin() 사용 가능');