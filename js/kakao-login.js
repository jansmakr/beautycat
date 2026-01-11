/**
 * BeautyCat - 카카오 소셜 로그인 모듈
 * @version 1.0.0
 * @date 2025-11-30
 * @description 카카오 로그인 연동 및 사용자 정보 처리
 */

// ================================
// ⚙️ 카카오 설정
// ================================
const KAKAO_CONFIG = {
    JAVASCRIPT_KEY: '99ef9d9c5749328463929a91d7c4fb8a', // 카카오 Developers에서 발급받은 JavaScript 키
    LOGIN_TYPE: 'kakao',
    // Redirect URI는 현재 페이지를 기본으로 사용 (로그인/회원가입 모두 지원)
    getRedirectUri: function() {
        const currentPage = window.location.pathname.split('/').pop() || 'login.html';
        const baseUrl = window.location.origin;
        
        // register.html에서 호출시 register.html로, 그 외는 login.html로
        if (currentPage === 'register.html') {
            return `${baseUrl}/register.html`;
        }
        return `${baseUrl}/login.html`;
    }
};

// ================================
// 🔧 카카오 SDK 초기화
// ================================
function initKakaoSDK() {
    if (typeof Kakao === 'undefined') {
        console.error('❌ [Kakao] SDK가 로드되지 않았습니다');
        return false;
    }

    // 이미 초기화되어 있는 경우 재초기화
    if (Kakao.isInitialized()) {
        console.log('✅ [Kakao] SDK 이미 초기화됨');
        return true;
    }

    // SDK 초기화
    try {
        Kakao.init(KAKAO_CONFIG.JAVASCRIPT_KEY);
        console.log('✅ [Kakao] SDK 초기화 완료:', Kakao.isInitialized());
        return true;
    } catch (error) {
        console.error('❌ [Kakao] SDK 초기화 실패:', error);
        return false;
    }
}

// ================================
// 🎯 카카오 로그인 시작 (Redirect 방식)
// ================================
function startKakaoLogin() {
    console.log('🚀 [Kakao] 로그인 시작');

    // SDK 초기화 확인
    if (!Kakao.isInitialized()) {
        if (!initKakaoSDK()) {
            alert('카카오 로그인 초기화에 실패했습니다.\n잠시 후 다시 시도해주세요.');
            return;
        }
    }

    // 현재 페이지에 맞는 Redirect URI 설정
    const redirectUri = KAKAO_CONFIG.getRedirectUri();
    console.log('🔗 [Kakao] Redirect URI:', redirectUri);
    
    // 페이지 리다이렉트 방식으로 로그인 (쓰드파티 쿠키 문제 해결)
    Kakao.Auth.authorize({
        redirectUri: redirectUri,
        state: 'kakao_login_' + Date.now() // CSRF 방지
    });
}

// ================================
// 👤 카카오 사용자 정보 요청
// ================================
function requestKakaoUserInfo(accessToken) {
    console.log('📊 [Kakao] 사용자 정보 요청 중...');

    Kakao.API.request({
        url: '/v2/user/me',
        success: function(response) {
            console.log('✅ [Kakao] 사용자 정보 수신:', response);
            
            // 사용자 정보 추출
            const userInfo = {
                kakao_id: response.id,
                email: response.kakao_account?.email || null,
                name: response.kakao_account?.profile?.nickname || '카카오 사용자',
                profile_image: response.kakao_account?.profile?.profile_image_url || null,
                login_type: 'kakao',
                is_verified: 1, // 카카오 계정 = 본인인증 완료
                created_at: new Date().toISOString()
            };

            // 이메일 필수 확인
            if (!userInfo.email) {
                console.warn('⚠️ [Kakao] 이메일 정보 없음');
                alert('이메일 제공 동의가 필요합니다.\n카카오 로그인 설정을 확인해주세요.');
                return;
            }

            console.log('📦 [Kakao] 처리할 사용자 정보:', userInfo);

            // BeautyCat 회원가입/로그인 처리
            processKakaoLogin(userInfo);
        },
        fail: function(error) {
            console.error('❌ [Kakao] 사용자 정보 요청 실패:', error);
            alert('사용자 정보를 가져오는데 실패했습니다.\n잠시 후 다시 시도해주세요.');
        }
    });
}

// ================================
// 💾 BeautyCat 회원가입/로그인 처리
// ================================
async function processKakaoLogin(userInfo) {
    console.log('🔄 [Kakao] BeautyCat 로그인 처리 시작');

    try {
        // 1. 기존 회원 확인 (이메일 기준)
        const existingUser = await checkExistingUser(userInfo.email);

        if (existingUser) {
            // 기존 회원 - 로그인 처리
            console.log('✅ [Kakao] 기존 회원 로그인:', existingUser);
            await loginUser(existingUser, userInfo);
        } else {
            // 신규 회원 - 회원가입 처리
            console.log('✨ [Kakao] 신규 회원 가입 시작');
            await registerUser(userInfo);
        }
    } catch (error) {
        console.error('❌ [Kakao] 로그인 처리 실패:', error);
        alert('로그인 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    }
}

// ================================
// 🔍 기존 회원 확인
// ================================
async function checkExistingUser(email) {
    try {
        console.log('🔍 [Kakao] 기존 회원 확인:', email);

        // 방법 1: 전체 사용자 조회 후 필터링 (정확한 매칭)
        const response = await fetch(`tables/users?limit=1000`);
        
        if (!response.ok) {
            console.log('ℹ️ [Kakao] 기존 회원 없음 (API 오류 또는 신규 회원)');
            return null;
        }

        const result = await response.json();
        console.log('📊 [Kakao] 전체 사용자 조회 완료:', result.total, '명');
        
        if (result.data && result.data.length > 0) {
            // 이메일 정확히 일치하는지 확인 (대소문자 무시)
            const user = result.data.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
            if (user) {
                console.log('✅ [Kakao] 기존 회원 발견:', user.email);
                return user;
            } else {
                console.log(`ℹ️ [Kakao] ${result.data.length}명 중 정확히 일치하는 이메일 없음`);
            }
        }

        console.log('ℹ️ [Kakao] 기존 회원 없음 (신규 회원)');
        return null;
    } catch (error) {
        console.error('❌ [Kakao] 기존 회원 확인 실패:', error);
        return null;
    }
}

// ================================
// ✨ 신규 회원 가입
// ================================
async function registerUser(userInfo) {
    try {
        console.log('📝 [Kakao] 신규 회원 가입 중...', userInfo);

        // 소셜 로그인용 임시 비밀번호 생성 (사용되지 않음)
        const tempPassword = 'KAKAO_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        // users 테이블에 저장
        const response = await fetch('tables/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userInfo.email,
                password: tempPassword, // 소셜 로그인용 임시 비밀번호
                name: userInfo.name,
                login_type: userInfo.login_type,
                kakao_id: String(userInfo.kakao_id),
                profile_image: userInfo.profile_image,
                is_verified: userInfo.is_verified,
                created_at: userInfo.created_at,
                user_type: 'customer' // 기본값: 고객
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [Kakao] 회원가입 실패:', errorText);
            
            // UNIQUE 제약 위반 시 기존 사용자로 로그인 시도
            if (errorText.includes('UNIQUE constraint failed') || errorText.includes('users.email')) {
                console.log('ℹ️ [Kakao] 이미 가입된 이메일입니다. 기존 사용자로 로그인 시도...');
                const existingUser = await checkExistingUser(userInfo.email);
                if (existingUser) {
                    console.log('✅ [Kakao] 기존 사용자 발견, 로그인 진행:', existingUser);
                    await loginUser(existingUser, userInfo);
                    return;
                }
            }
            
            throw new Error('회원가입 실패');
        }

        const newUser = await response.json();
        console.log('✅ [Kakao] 회원가입 성공:', newUser);

        // 로그인 처리
        await loginUser(newUser, userInfo);

    } catch (error) {
        console.error('❌ [Kakao] 회원가입 처리 실패:', error);
        throw error;
    }
}

// ================================
// 🔐 로그인 처리
// ================================
async function loginUser(user, kakaoInfo) {
    try {
        console.log('🔐 [Kakao] 로그인 처리:', user.email);

        // 로그인 정보 업데이트 (카카오 ID, 마지막 로그인 시간, 프로필 이미지 등)
        if (user.id) {
            // PATCH 대신 PUT 사용 (CORS 이슈 해결)
            const updateData = {
                ...user, // 기존 사용자 정보 포함
                login_type: 'kakao', // 카카오 로그인으로 전환
                kakao_id: String(kakaoInfo.kakao_id), // 카카오 ID 저장
                profile_image: kakaoInfo.profile_image || user.profile_image,
                last_login_at: new Date().toISOString()
            };
            
            console.log('🔄 [Kakao] 사용자 정보 업데이트:', { email: user.email, kakao_id: updateData.kakao_id });
            
            await fetch(`/tables/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
        }

        // 세션 저장 (localStorage)
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name || kakaoInfo.name,
            login_type: 'kakao',
            profile_image: kakaoInfo.profile_image,
            is_verified: user.is_verified || kakaoInfo.is_verified,
            user_type: user.user_type || 'customer'
        };
        
        // 세션 토큰 생성
        const sessionToken = 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        
        // 세션 정보 저장 (24시간 유효)
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('user_data', JSON.stringify(userData));
        localStorage.setItem('session_token', sessionToken);
        localStorage.setItem('user_type', userData.user_type);
        
        // 세션 만료 시간 설정 (24시간)
        const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
        localStorage.setItem('session_expires', expirationTime.toISOString());

        console.log('✅ [Kakao] 로그인 완료');

        // 성공 메시지
        alert(`환영합니다, ${kakaoInfo.name}님! 🎉\n카카오 로그인이 완료되었습니다.`);

        // 사용자 의도 확인 (견적상담/전화상담 버튼 클릭)
        const redirectIntent = localStorage.getItem('redirectIntent');
        const userType = user.user_type || 'customer';
        
        if (redirectIntent && userType === 'customer') {
            // 의도 정보 삭제
            localStorage.removeItem('redirectIntent');
            
            // index.html로 리다이렉트하고 해당 섹션 표시
            if (redirectIntent === 'consultation') {
                console.log('🎯 [Kakao] 견적상담으로 리다이렉트');
                window.location.href = '/index.html?action=consultation';
                return;
            } else if (redirectIntent === 'phone') {
                console.log('🎯 [Kakao] 전화상담으로 리다이렉트');
                window.location.href = '/index.html?action=phone';
                return;
            }
        }
        
        // 기본 대시보드 이동 (사용자 타입에 따라 분기)
        if (userType === 'shop' || userType === 'shop_owner') {
            window.location.href = '/shop-dashboard.html';
        } else if (userType === 'admin') {
            window.location.href = '/admin-dashboard.html';
        } else {
            window.location.href = '/customer-dashboard.html';
        }

    } catch (error) {
        console.error('❌ [Kakao] 로그인 처리 실패:', error);
        throw error;
    }
}

// ================================
// 🔄 카카오 로그인 콜백 처리
// ================================
function handleKakaoCallback() {
    console.log('🔄 [Kakao] 콜백 처리 시작');
    
    // URL에서 인증 코드 추출
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    if (error) {
        console.error('❌ [Kakao] 인증 오류:', error);
        alert('카카오 로그인에 실패했습니다.\n다시 시도해주세요.');
        // URL 정리
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }
    
    if (code) {
        console.log('✅ [Kakao] 인증 코드 수신:', code.substring(0, 10) + '...');
        
        // 토큰 요청
        Kakao.Auth.setAccessToken(null); // 기존 토큰 제거
        
        // 현재 페이지의 Redirect URI 사용
        const redirectUri = KAKAO_CONFIG.getRedirectUri();
        console.log('🔗 [Kakao] 토큰 요청 Redirect URI:', redirectUri);
        
        // 인증 코드로 액세스 토큰 요청
        fetch(`https://kauth.kakao.com/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: KAKAO_CONFIG.JAVASCRIPT_KEY,
                redirect_uri: redirectUri,
                code: code
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.access_token) {
                console.log('✅ [Kakao] 액세스 토큰 획득');
                Kakao.Auth.setAccessToken(data.access_token);
                
                // 사용자 정보 요청
                requestKakaoUserInfo(data.access_token);
                
                // URL 정리
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                throw new Error('토큰 획득 실패');
            }
        })
        .catch(error => {
            console.error('❌ [Kakao] 토큰 요청 실패:', error);
            alert('카카오 로그인 처리 중 오류가 발생했습니다.');
            window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
}

// ================================
// 🚀 페이지 로드 시 자동 실행
// ================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 [Kakao] 로그인 모듈 로드됨');
    
    // SDK 초기화
    initKakaoSDK();
    
    // 카카오 콜백 처리 (URL에 code 파라미터가 있는 경우)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code')) {
        handleKakaoCallback();
        return; // 콜백 처리 중에는 버튼 이벤트 연결 안 함
    }

    // 카카오 로그인 버튼 이벤트 연결
    const kakaoLoginBtn = document.getElementById('kakao-login-btn');
    if (kakaoLoginBtn) {
        kakaoLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            startKakaoLogin();
        });
        console.log('✅ [Kakao] 로그인 버튼 이벤트 연결됨');
    }
    
    // 회원가입 페이지의 카카오 버튼
    const kakaoRegisterBtn = document.getElementById('kakao-register-btn');
    if (kakaoRegisterBtn) {
        kakaoRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            startKakaoLogin();
        });
        console.log('✅ [Kakao] 회원가입 버튼 이벤트 연결됨');
    }
});

// ================================
// 🌐 전역 함수 노출 (HTML onclick에서 사용 가능)
// ================================
window.startKakaoLogin = startKakaoLogin;
