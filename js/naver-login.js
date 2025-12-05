/**
 * BeautyCat 네이버 로그인 연동
 * v1.0 - 2025-11-30
 */

// ✅ 네이버 개발자센터에서 발급받은 Client ID
const NAVER_CLIENT_ID = 'JxfIwF7HGn5QM6rVAM68';
const NAVER_CALLBACK_URL = window.location.origin + '/login.html';

console.log('🔐 네이버 로그인 모듈 로드 완료');

/**
 * 네이버 로그인 초기화
 */
function initNaverLogin() {
    console.log('🔐 네이버 로그인 초기화 시작');
    console.log('📍 Callback URL:', NAVER_CALLBACK_URL);
    
    // 네이버 SDK가 로드되지 않은 경우
    if (typeof naver === 'undefined') {
        console.error('❌ 네이버 SDK가 로드되지 않았습니다');
        return;
    }
    
    const naverLogin = new naver.LoginWithNaverId({
        clientId: NAVER_CLIENT_ID,
        callbackUrl: NAVER_CALLBACK_URL,
        isPopup: false, // false: 리다이렉트 방식 (권장)
        loginButton: {
            color: "green",
            type: 3,
            height: 50
        },
        callbackHandle: true
    });
    
    // 초기화
    naverLogin.init();
    console.log('✅ 네이버 로그인 SDK 초기화 완료');
    
    // 콜백 처리 (로그인 후 돌아왔을 때)
    naverLogin.getLoginStatus(function(status) {
        console.log('🔍 네이버 로그인 상태 확인:', status);
        
        if (status) {
            // 로그인 성공
            const email = naverLogin.user.getEmail();
            const name = naverLogin.user.getName();
            const profileImage = naverLogin.user.getProfileImage();
            const id = naverLogin.user.getId();
            
            console.log('✅ 네이버 로그인 성공:', {
                email, name, id
            });
            
            // BeautyCat 회원 등록/로그인 처리
            handleNaverLoginSuccess({
                id: id,
                email: email,
                name: name,
                profile_image: profileImage,
                login_type: 'naver'
            });
        }
    });
    
    // 전역 변수로 등록 (디버깅용)
    window.naverLogin = naverLogin;
}

/**
 * 네이버 로그인 성공 처리
 */
async function handleNaverLoginSuccess(userData) {
    try {
        console.log('📤 네이버 로그인 사용자 정보:', userData);
        
        // 로딩 표시
        if (typeof showNotification === 'function') {
            showNotification('로그인 처리 중...', 'info');
        }
        
        // 1. 기존 회원 확인
        const existingUser = await checkUserExists(userData.email);
        
        if (existingUser) {
            // 기존 회원 → 로그인
            console.log('✅ 기존 회원 로그인');
            loginUser(existingUser);
        } else {
            // 신규 회원 → 회원가입
            console.log('🆕 신규 회원가입 진행');
            await registerNaverUser(userData);
        }
        
    } catch (error) {
        console.error('❌ 네이버 로그인 처리 실패:', error);
        alert('로그인 처리 중 오류가 발생했습니다.\n다시 시도해주세요.');
    }
}

/**
 * 기존 회원 확인
 */
async function checkUserExists(email) {
    try {
        console.log('🔍 기존 회원 확인:', email);
        
        const response = await fetch(`tables/users?limit=1&search=${encodeURIComponent(email)}`);
        
        if (!response.ok) {
            console.log('⚠️ 회원 조회 API 에러:', response.status);
            return null;
        }
        
        const data = await response.json();
        console.log('📥 회원 조회 결과:', data);
        
        if (data.data && data.data.length > 0) {
            return data.data[0];
        }
        
        return null;
    } catch (error) {
        console.error('❌ 회원 조회 실패:', error);
        return null;
    }
}

/**
 * 네이버 회원 등록
 */
async function registerNaverUser(userData) {
    try {
        console.log('🆕 네이버 회원 등록 시작:', userData);
        
        const newUser = {
            email: userData.email,
            name: userData.name,
            user_type: 'customer',
            login_type: 'naver',
            naver_id: userData.id,
            profile_image: userData.profile_image || '',
            phone: '', // 추후 입력받기
            is_verified: 1, // 네이버 인증 완료
            created_at: new Date().toISOString()
        };
        
        console.log('📤 회원가입 데이터:', newUser);
        
        const response = await fetch('tables/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ 회원가입 API 에러:', response.status, errorText);
            throw new Error('회원가입 실패');
        }
        
        const result = await response.json();
        console.log('✅ 네이버 회원가입 완료:', result);
        
        // 로그인 처리
        loginUser(result);
        
    } catch (error) {
        console.error('❌ 네이버 회원가입 실패:', error);
        throw error;
    }
}

/**
 * 로그인 처리
 */
function loginUser(user) {
    console.log('🔐 로그인 처리 시작:', user.email);
    
    // localStorage에 사용자 정보 저장
    const userInfo = {
        id: user.id,
        email: user.email,
        name: user.name,
        user_type: user.user_type || 'customer',
        login_type: user.login_type || 'naver',
        profile_image: user.profile_image || ''
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userInfo));
    console.log('✅ localStorage 저장 완료');
    
    // 알림 표시
    if (typeof showNotification === 'function') {
        showNotification(`${user.name}님, 환영합니다! 🎉`, 'success');
    } else {
        alert(`${user.name}님, 환영합니다!`);
    }
    
    // 사용자 의도 확인 (견적상담/전화상담 버튼 클릭)
    const redirectIntent = localStorage.getItem('redirectIntent');
    const userType = user.user_type || 'customer';
    
    // 페이지 이동 (사용자 타입별)
    setTimeout(() => {
        if (redirectIntent && userType === 'customer') {
            // 의도 정보 삭제
            localStorage.removeItem('redirectIntent');
            
            // index.html로 리다이렉트하고 해당 섹션 표시
            if (redirectIntent === 'consultation') {
                console.log('🎯 [Naver] 견적상담으로 리다이렉트');
                window.location.href = 'index.html?action=consultation';
                return;
            } else if (redirectIntent === 'phone') {
                console.log('🎯 [Naver] 전화상담으로 리다이렉트');
                window.location.href = 'index.html?action=phone';
                return;
            }
        }
        
        // 기본 대시보드 이동
        if (userType === 'customer') {
            console.log('📍 고객 대시보드로 이동');
            window.location.href = 'customer-dashboard.html';
        } else if (userType === 'business') {
            console.log('📍 업체 대시보드로 이동');
            window.location.href = 'shop-dashboard.html';
        } else if (userType === 'admin') {
            console.log('📍 관리자 대시보드로 이동');
            window.location.href = 'admin-dashboard.html';
        } else {
            console.log('📍 메인 페이지로 이동');
            window.location.href = 'index.html';
        }
    }, 1500);
}

/**
 * 커스텀 네이버 로그인 버튼 클릭 처리
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM 로드 완료 - 네이버 로그인 버튼 설정');
    
    const naverBtn = document.getElementById('naverLoginBtn');
    
    if (naverBtn) {
        naverBtn.addEventListener('click', function() {
            console.log('🖱️ 네이버 로그인 버튼 클릭');
            
            // Client ID 확인
            if (NAVER_CLIENT_ID === 'YOUR_CLIENT_ID_HERE') {
                alert('⚠️ 네이버 Client ID가 설정되지 않았습니다.\n\njs/naver-login.js 파일에서 NAVER_CLIENT_ID를 네이버 개발자센터에서 발급받은 값으로 교체해주세요.');
                console.error('❌ NAVER_CLIENT_ID가 설정되지 않음');
                return;
            }
            
            // 숨겨진 네이버 로그인 위젯의 버튼 클릭
            const naverLoginBtn = document.querySelector('#naverIdLogin a');
            if (naverLoginBtn) {
                naverLoginBtn.click();
            } else {
                console.error('❌ 네이버 로그인 위젯 버튼을 찾을 수 없습니다');
                console.log('💡 네이버 SDK가 제대로 로드되었는지 확인하세요');
            }
        });
        
        console.log('✅ 네이버 로그인 버튼 이벤트 등록 완료');
    } else {
        console.log('⚠️ 네이버 로그인 버튼(#naverLoginBtn)을 찾을 수 없습니다');
    }
    
    // 네이버 로그인 초기화
    if (typeof naver !== 'undefined') {
        initNaverLogin();
    } else {
        console.error('❌ 네이버 SDK가 로드되지 않았습니다');
        console.log('💡 login.html에 다음 스크립트가 있는지 확인하세요:');
        console.log('<script src="https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js"></script>');
    }
});

// 전역 함수로 등록 (디버깅용)
window.initNaverLogin = initNaverLogin;
window.handleNaverLoginSuccess = handleNaverLoginSuccess;

console.log('✅ 네이버 로그인 모듈 설정 완료');
