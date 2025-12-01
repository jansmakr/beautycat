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
    JAVASCRIPT_KEY: 'eea3e60bafe7ebb16dde366f33c5f279', // 카카오 Developers에서 발급받은 JavaScript 키
    REDIRECT_URI: 'https://beautycat.kr/login.html',
    LOGIN_TYPE: 'kakao'
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
// 🎯 카카오 로그인 시작
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

    // 카카오 로그인 팝업 열기
    Kakao.Auth.login({
        success: function(authObj) {
            console.log('✅ [Kakao] 인증 성공:', authObj);
            
            // 액세스 토큰 저장
            const accessToken = authObj.access_token;
            
            // 사용자 정보 요청
            requestKakaoUserInfo(accessToken);
        },
        fail: function(err) {
            console.error('❌ [Kakao] 인증 실패:', err);
            
            if (err.error === 'access_denied') {
                console.log('ℹ️ [Kakao] 사용자가 로그인을 취소했습니다');
            } else {
                alert('카카오 로그인에 실패했습니다.\n잠시 후 다시 시도해주세요.');
            }
        }
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

        // API 호출 - 이메일로 사용자 검색
        const response = await fetch(`/tables/users?search=${encodeURIComponent(email)}&limit=1`);
        
        if (!response.ok) {
            console.log('ℹ️ [Kakao] 기존 회원 없음 (API 오류 또는 신규 회원)');
            return null;
        }

        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            // 이메일 정확히 일치하는지 확인
            const user = result.data.find(u => u.email === email);
            return user || null;
        }

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

        // users 테이블에 저장
        const response = await fetch('/tables/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userInfo.email,
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

        // 로그인 정보 업데이트 (마지막 로그인 시간, 프로필 이미지 등)
        if (user.id) {
            await fetch(`/tables/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    profile_image: kakaoInfo.profile_image,
                    last_login_at: new Date().toISOString()
                })
            });
        }

        // 세션 저장 (localStorage)
        localStorage.setItem('user', JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name || kakaoInfo.name,
            login_type: 'kakao',
            profile_image: kakaoInfo.profile_image,
            is_verified: user.is_verified || kakaoInfo.is_verified,
            user_type: user.user_type || 'customer'
        }));

        console.log('✅ [Kakao] 로그인 완료');

        // 성공 메시지
        alert(`환영합니다, ${kakaoInfo.name}님! 🎉\n카카오 로그인이 완료되었습니다.`);

        // 대시보드로 이동 (사용자 타입에 따라 분기)
        const userType = user.user_type || 'customer';
        if (userType === 'shop_owner') {
            window.location.href = '/shop-dashboard.html';
        } else {
            window.location.href = '/customer-dashboard.html';
        }

    } catch (error) {
        console.error('❌ [Kakao] 로그인 처리 실패:', error);
        throw error;
    }
}

// ================================
// 🚀 페이지 로드 시 자동 실행
// ================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 [Kakao] 로그인 모듈 로드됨');
    
    // SDK 초기화
    initKakaoSDK();

    // 카카오 로그인 버튼 이벤트 연결
    const kakaoLoginBtn = document.getElementById('kakao-login-btn');
    if (kakaoLoginBtn) {
        kakaoLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            startKakaoLogin();
        });
        console.log('✅ [Kakao] 로그인 버튼 이벤트 연결됨');
    }
});

// ================================
// 🌐 전역 함수 노출 (HTML onclick에서 사용 가능)
// ================================
window.startKakaoLogin = startKakaoLogin;
