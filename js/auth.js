// 전역 변수
let currentUser = null;
let sessionToken = null;
let emailCheckResult = false;

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthApp();
    checkExistingSession();
});

// 인증 앱 초기화
function initializeAuthApp() {
    setupAuthEventListeners();
    
    // 프로덕션 환경 체크
    const isProduction = location.hostname === 'beautycat.kr' || 
                        location.hostname === 'www.beautycat.kr' ||
                        location.hostname.includes('beautycat.pages.dev');
    
    if (!isProduction) {
        // 개발 환경에서만 데모 계정 로드
        loadDemoAccounts();
    } else {
        console.log('🏭 프로덕션 환경 감지: 데모 계정 로드 건너뛰기');
    }
    
    // 페이지별 초기화
    const pathname = window.location.pathname;
    if (pathname.includes('login.html')) {
        initializeLoginPage();
    } else if (pathname.includes('register.html')) {
        initializeRegisterPage();
    }
}

// 인증 관련 이벤트 리스너 설정
function setupAuthEventListeners() {
    // 로그인 폼
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // 회원가입 폼
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // 사용자 타입 선택 (로그인 페이지)
    const userTypeRadios = document.querySelectorAll('input[name="userType"]');
    userTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleUserTypeChange);
    });

    // 사용자 타입 선택 (회원가입 페이지)
    const registerUserTypeRadios = document.querySelectorAll('input[name="userType"]');
    registerUserTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleRegisterUserTypeChange);
    });

    // 비밀번호 확인
    const passwordConfirm = document.getElementById('confirmPassword');
    if (passwordConfirm) {
        passwordConfirm.addEventListener('input', checkPasswordMatch);
    }

    // 전체 약관 동의는 register.html에서 처리됨
}

// 로그인 페이지 초기화
function initializeLoginPage() {
    // 데모 계정 정보 표시
    setTimeout(() => {
        const demoInfo = document.getElementById('demo-info');
        if (demoInfo) {
            demoInfo.classList.remove('hidden');
        }
    }, 2000);
}

// 회원가입 페이지 초기화
function initializeRegisterPage() {
    // 기본적으로 고객 가입 선택
    handleRegisterUserTypeChange();
}

// 기존 세션 확인
async function checkExistingSession() {
    try {
        // v2.8.13.6.73: 대시보드 페이지에서는 세션 체크 건너뛰기
        const pathname = window.location.pathname;
        if (pathname.includes('admin-dashboard.html') || 
            pathname.includes('shop-dashboard.html') || 
            pathname.includes('customer-dashboard.html')) {
            console.log('📋 대시보드 페이지 - 세션 체크 건너뛰기');
            return;
        }
        
        const token = localStorage.getItem('session_token');
        const userType = localStorage.getItem('user_type');
        
        if (token && userType) {
            // 세션 유효성 검증
            const isValid = await validateSession(token);
            if (isValid) {
                sessionToken = token;
                // 사용자 정보 로드
                const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
                currentUser = userData;
                
                // ===== v2.8.13: 로그인 상태 표시 업데이트 =====
                updateLoginStatusDisplay();
                
                // 이미 로그인된 상태에서 로그인/회원가입 페이지 접근 시 대시보드로 리다이렉트
                if (pathname.includes('login.html') || pathname.includes('register.html')) {
                    redirectToDashboard(userType);
                }
            } else {
                // 무효한 세션 정리
                clearSession();
                // 로그인 상태 표시 업데이트
                updateLoginStatusDisplay();
            }
        } else {
            // 로그인 상태 표시 업데이트
            updateLoginStatusDisplay();
        }
    } catch (error) {
        console.error('세션 확인 오류:', error);
        clearSession();
        updateLoginStatusDisplay();
    }
}

// 세션 유효성 검증
async function validateSession(token) {
    try {
        // 실제로는 서버에서 세션 토큰 검증
        // 여기서는 localStorage의 만료 시간 확인
        const expiresAt = localStorage.getItem('session_expires');
        if (!expiresAt || new Date() > new Date(expiresAt)) {
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
}

// 사용자 타입 변경 처리 (로그인)
function handleUserTypeChange() {
    const selectedType = document.querySelector('input[name="userType"]:checked').value;
    
    // UI 업데이트
    document.querySelectorAll('label[id$="-option"]').forEach(label => {
        const radio = label.querySelector('input[type="radio"]');
        const icon = label.querySelector('.fa-check-circle');
        
        if (radio.value === selectedType) {
            label.classList.add('border-pink-300', 'bg-pink-50');
            label.classList.remove('border-gray-200');
            icon.classList.remove('hidden');
        } else {
            label.classList.remove('border-pink-300', 'bg-pink-50', 'border-purple-300', 'bg-purple-50', 'border-blue-300', 'bg-blue-50');
            label.classList.add('border-gray-200');
            icon.classList.add('hidden');
        }
    });
    
    // 선택된 타입에 따른 색상 적용
    const selectedLabel = document.querySelector(`#${selectedType}-option`);
    if (selectedLabel) {
        const colorMap = {
            'customer': ['border-pink-300', 'bg-pink-50'],
            'shop': ['border-purple-300', 'bg-purple-50'],
            'admin': ['border-blue-300', 'bg-blue-50']
        };
        selectedLabel.classList.add(...colorMap[selectedType]);
    }
}

// 사용자 타입 변경 처리 (회원가입)
function handleRegisterUserTypeChange() {
    const selectedType = document.querySelector('input[name="userType"]:checked')?.value || 'customer';
    const shopInfo = document.getElementById('shop-additional-info');
    
    // UI 업데이트
    document.querySelectorAll('label[id^="register-"]').forEach(label => {
        const radio = label.querySelector('input[type="radio"]');
        const icon = label.querySelector('.fa-check-circle');
        
        if (radio && radio.value === selectedType) {
            label.classList.add('border-pink-300', 'bg-pink-50');
            label.classList.remove('border-gray-200');
            if (icon) icon.classList.remove('hidden');
        } else {
            label.classList.remove('border-pink-300', 'bg-pink-50', 'border-purple-300', 'bg-purple-50');
            label.classList.add('border-gray-200');
            if (icon) icon.classList.add('hidden');
        }
    });
    
    // 선택된 타입에 따른 색상 적용
    const selectedLabel = document.querySelector(`#register-${selectedType}-option`);
    if (selectedLabel) {
        const colorMap = {
            'customer': ['border-pink-300', 'bg-pink-50'],
            'shop': ['border-purple-300', 'bg-purple-50']
        };
        if (colorMap[selectedType]) {
            selectedLabel.classList.add(...colorMap[selectedType]);
        }
    }
    
    // 피부관리실 추가 정보 표시/숨김
    if (shopInfo) {
        if (selectedType === 'shop') {
            shopInfo.classList.remove('hidden');
            // 필수 항목으로 변경
            document.getElementById('shop_name').setAttribute('required', 'required');
        } else {
            shopInfo.classList.add('hidden');
            // 필수 항목 제거
            const shopNameInput = document.getElementById('shop_name');
            if (shopNameInput) shopNameInput.removeAttribute('required');
        }
    }
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();
    
    const loginBtn = e.target.querySelector('button[type="submit"]');
    const originalText = loginBtn.innerHTML;
    
    // 버튼 상태 변경
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.classList.add('opacity-75', 'cursor-not-allowed');
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>로그인 중...';
    }
    
    // 로딩 오버레이 표시
    const loadingOverlay = document.getElementById('login-loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    console.log('🔐 로그인 처리 중...');
    
    // 시작 시간 기록 (최소 표시 시간 보장용)
    const startTime = Date.now();
    
    try {
        // 폼 데이터 수집
        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email') || '',
            password: formData.get('password') || '',
            user_type: document.querySelector('input[name="userType"]:checked')?.value || '',
            remember_me: false
        };
        
        // 유효성 검증
        if (!validateLoginData(loginData)) {
            return;
        }
        
        // 로그인 처리
        const result = await processLogin(loginData);
        
        // 최소 표시 시간 보장 (1초)
        const elapsedTime = Date.now() - startTime;
        const minDisplayTime = 1000; // 1초
        if (elapsedTime < minDisplayTime) {
            await new Promise(resolve => setTimeout(resolve, minDisplayTime - elapsedTime));
        }
        
        if (result.success) {
            // 세션 저장 (이미 processLogin에서 저장됨)
            // saveSession(result.user, result.token, loginData.remember_me);
            
            // 성공 메시지
            const message = result.message || `${result.user.name}님, 환영합니다!`;
            showNotification(message, 'success');
            
            // 사용자 정보를 localStorage에 저장 (호환성을 위해 두 키 모두 사용)
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            localStorage.setItem('user_data', JSON.stringify(result.user));
            localStorage.setItem('authToken', result.token);
            
            // user_type 별도 저장 (goToDashboard 함수에서 사용)
            if (result.user.user_type) {
                localStorage.setItem('user_type', result.user.user_type);
                console.log('✅ user_type 저장:', result.user.user_type);
            }
            
            console.log('로그인 성공, 리다이렉트:', result.user.user_type);
            
            // 대시보드로 리다이렉트
            setTimeout(() => {
                redirectToDashboard(result.user.user_type);
            }, 1500);
        } else {
            showNotification(result.message || '로그인에 실패했습니다.', 'error');
        }
        
    } catch (error) {
        console.error('로그인 오류:', error);
        showNotification('로그인 중 오류가 발생했습니다.', 'error');
    } finally {
        // 로딩 오버레이 숨김
        const loadingOverlay = document.getElementById('login-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        // 버튼 상태 복원
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            loginBtn.innerHTML = originalText;
        }
    }
}

// 로그인 데이터 유효성 검증
function validateLoginData(data) {
    if (!data.email || !data.email.trim()) {
        showNotification('이메일을 입력해주세요.', 'error');
        return false;
    }
    
    if (!data.password || !data.password.trim()) {
        showNotification('비밀번호를 입력해주세요.', 'error');
        return false;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('올바른 이메일 형식으로 입력해주세요.', 'error');
        return false;
    }
    
    return true;
}

// 로그인 처리 (실제 인증)
async function processLogin(loginData) {
    try {
        console.log('로그인 시도:', { email: loginData.email, user_type: loginData.user_type });
        
        // 보안 매니저로 로그인 시도 제한 확인 (개발 모드에서는 비활성화)
        // if (window.securityManager) {
        //     try {
        //         window.securityManager.checkLoginAttempts(loginData.email);
        //     } catch (lockoutError) {
        //         return {
        //             success: false,
        //             message: lockoutError.message
        //         };
        //     }
        // }
        
        // 데모 계정 확인 (우선순위)
        const demoAccounts = getDemoAccounts();
        const demoUser = demoAccounts.find(account => 
            account.email === loginData.email && 
            account.password === loginData.password &&
            account.user_type === loginData.user_type
        );
        
        if (demoUser) {
            console.log('데모 계정으로 로그인:', demoUser.name);
            
            // 보안 세션 생성
            if (window.securityManager) {
                await window.securityManager.createSession(demoUser);
                window.securityManager.clearLoginAttempts(loginData.email);
            }
            
            const sessionToken = generateSessionToken();
            
            // 기존 세션 저장 (호환성)
            saveSession({
                user: demoUser,
                token: sessionToken,
                loginTime: new Date().toISOString()
            });
            
            return {
                success: true,
                user: demoUser,
                token: sessionToken,
                message: `${demoUser.name}님, 환영합니다! (데모 계정)`
            };
        }
        
        // 실제 사용자 계정 확인 (이메일로 직접 검색)
        const response = await fetch(`tables/users?search=${encodeURIComponent(loginData.email)}&limit=100`);
        
        if (!response.ok) {
            throw new Error('사용자 데이터를 불러올 수 없습니다.');
        }
        
        const userData = await response.json();
        console.log('🔍 이메일 검색 결과:', userData.data?.length || 0, '명');
        console.log('📧 검색한 이메일:', loginData.email);
        console.log('📊 검색 결과:', userData.data);
        
        // 먼저 이메일만으로 찾기
        const userByEmail = userData.data?.find(u => u.email === loginData.email);
        console.log('📧 이메일로 찾은 사용자:', userByEmail);
        
        if (userByEmail) {
            console.log('✅ 사용자 정보:', {
                email: userByEmail.email,
                user_type: userByEmail.user_type,
                status: userByEmail.status,
                is_active: userByEmail.is_active
            });
            console.log('🔍 입력한 user_type:', loginData.user_type);
        }
        
        const user = userData.data?.find(u => 
            u.email === loginData.email && 
            u.user_type === loginData.user_type &&
            u.status !== 'inactive' && // status 체크
            u.is_active !== false // is_active도 체크 (오래된 데이터 호환)
        );
        
        if (user) {
            console.log('사용자 찾음:', user.name, user.user_type);
            
            // 비밀번호 확인 (보안 강화)
            let passwordValid = false;
            
            // 비밀번호에 salt가 포함되어 있는지 확인 (hash:salt 형식)
            if (window.securityManager && user.password && user.password.includes(':')) {
                // 해시된 비밀번호 검증
                const [storedHash, storedSalt] = user.password.split(':');
                const hashedInput = await window.securityManager.hashPassword(loginData.password, storedSalt);
                passwordValid = (hashedInput.hash === storedHash);
                console.log('🔐 해시 비밀번호 검증:', passwordValid);
            } else {
                // 평문 비밀번호 검증 (보안 취약)
                passwordValid = (user.password === loginData.password);
                console.log('🔓 평문 비밀번호 검증:', passwordValid);
            }
            
            if (passwordValid) {
                // 로그인 성공 - 보안 세션 생성
                if (window.securityManager) {
                    await window.securityManager.createSession(user);
                    window.securityManager.clearLoginAttempts(loginData.email);
                }
                
                const sessionToken = generateSessionToken();
                
                // last_login 필드가 스키마에 없으므로 업데이트 생략
                // 필요시 status를 'active'로 업데이트할 수 있음
                
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
                console.log('비밀번호 불일치');
                
                // 로그인 실패 기록 (개발 모드에서는 비활성화)
                // if (window.securityManager) {
                //     window.securityManager.recordFailedLogin(loginData.email);
                // }
                
                return {
                    success: false,
                    message: '비밀번호가 올바르지 않습니다.'
                };
            }
        } else {
            console.log('사용자를 찾을 수 없음');
            
            // 로그인 실패 기록 (개발 모드에서는 비활성화)
            // if (window.securityManager) {
            //     window.securityManager.recordFailedLogin(loginData.email);
            // }
            
            return {
                success: false,
                message: '해당 이메일로 등록된 계정이 없거나 사용자 유형이 일치하지 않습니다.'
            };
        }
        
    } catch (error) {
        console.error('로그인 처리 오류:', error);
        return {
            success: false,
            message: '로그인 처리 중 오류가 발생했습니다: ' + error.message
        };
    }
}

// 회원가입 처리
async function handleRegister(e) {
    e.preventDefault();
    
    const registerBtn = e.target.querySelector('button[type="submit"]');
    const originalText = registerBtn ? registerBtn.innerHTML : '회원가입';
    
    // 버튼 상태 변경
    if (registerBtn) {
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>가입 중...';
    }
    
    try {
        // 폼 데이터 수집
        const formData = new FormData(e.target);
        const registerData = {
            name: formData.get('name') || '',
            phone: formData.get('phone') || '',
            email: formData.get('email') || '',
            password: formData.get('password') || '',
            password_confirm: formData.get('confirmPassword') || '',
            user_type: document.querySelector('input[name="userType"]:checked')?.value || 'customer',
            shop_name: formData.get('shop_name') || '',
            business_number: formData.get('business_number') || '',
            business_license_number: formData.get('business_license_number') || '',
            naver_cafe_id: formData.get('naver_cafe_id') || '',
            shop_state: formData.get('shop_state') || '',
            shop_district: formData.get('shop_district') || '',
            shop_address: formData.get('shop_address') || '',
            terms_service: formData.get('terms_service') === 'on',
            terms_privacy: formData.get('terms_privacy') === 'on',
            terms_marketing: formData.get('terms_marketing') === 'on'
        };
        
        // 유효성 검증
        if (!validateRegisterData(registerData)) {
            return;
        }
        
        // 레벨 1 기본인증 확인 옵션 제공
        const shouldUseLevel1Auth = await askForLevel1Auth(registerData);
        
        let authResult = null;
        if (shouldUseLevel1Auth) {
            // 레벨 1 기본인증 실행 (40원)
            authResult = await startLevel1AuthForRegistration(registerData);
            if (!authResult.success) {
                showNotification('인증에 실패했습니다: ' + authResult.message, 'error');
                return;
            }
            registerData.auth_level = 1;
            registerData.auth_data = authResult;
        }
        
        // 회원가입 처리
        const result = await processRegister(registerData);
        
        if (result.success) {
            // 업체 가입 시 추가 안내 메시지
            if (registerData.user_type === 'shop') {
                showNotification(
                    `🎉 회원가입이 완료되었습니다!<br>
                    📧 <strong>서류 제출 필수:</strong> utuber@kakao.com으로 사업자등록증과 영업신고증을 제출해주세요.<br>
                    👥 <strong>카페 활동 확인:</strong> 네이버 피.창.성 카페에서 활동 이력을 확인합니다.<br>
                    ✅ 서류 확인 및 카페 회원 인증 완료 후 업체 승인됩니다.`, 
                    'success', 
                    10000  // 10초간 표시
                );
            } else {
                showNotification('회원가입이 완료되었습니다! 자동 로그인 중...', 'success');
            }
            
            // 회원가입 후 자동 로그인 처리
            setTimeout(() => {
                // 세션 저장 (saveSession 함수 사용)
                const sessionToken = generateSessionToken();
                saveSession(result.user, sessionToken, false); // 기본 24시간 세션
                
                // 추가 호환성 저장 (기존 코드와 호환)
                localStorage.setItem('user', JSON.stringify(result.user));
                
                // 대시보드로 리다이렉트 (redirectIntent 확인)
                redirectToDashboard(result.user.user_type);
            }, registerData.user_type === 'shop' ? 8000 : 1500);  // 업체는 8초, 고객은 1.5초 후 이동
        } else {
            showNotification(result.message || '회원가입에 실패했습니다.', 'error');
        }
        
    } catch (error) {
        console.error('회원가입 오류:', error);
        showNotification('회원가입 중 오류가 발생했습니다.', 'error');
    } finally {
        // 버튼 상태 복원
        if (registerBtn) {
            registerBtn.disabled = false;
            registerBtn.innerHTML = originalText;
        }
    }
}

// 회원가입 데이터 유효성 검증
function validateRegisterData(data) {
    // 필수 필드 검증
    if (!data.name || !data.name.trim()) {
        showNotification('이름을 입력해주세요.', 'error');
        return false;
    }
    
    if (!data.phone || !data.phone.trim()) {
        showNotification('전화번호를 입력해주세요.', 'error');
        return false;
    }
    
    if (!data.email || !data.email.trim()) {
        showNotification('이메일을 입력해주세요.', 'error');
        return false;
    }
    
    if (!emailCheckResult) {
        showNotification('이메일 중복 확인을 해주세요.', 'error');
        return false;
    }
    
    if (!data.password) {
        showNotification('비밀번호를 입력해주세요.', 'error');
        return false;
    }
    
    if (data.password !== data.password_confirm) {
        showNotification('비밀번호가 일치하지 않습니다.', 'error');
        return false;
    }
    
    // 비밀번호 강도 검증
    if (data.password.length < 8) {
        showNotification('비밀번호는 8자리 이상이어야 합니다.', 'error');
        return false;
    }
    
    // 피부관리실 추가 정보 검증
    if (data.user_type === 'shop') {
        if (!data.shop_name.trim()) {
            showNotification('피부관리실명을 입력해주세요.', 'error');
            return false;
        }
        
        if (!data.shop_state) {
            showNotification('업체 위치의 시/도를 선택해주세요.', 'error');
            return false;
        }
        
        if (!data.shop_district) {
            showNotification('업체 위치의 구/군을 선택해주세요.', 'error');
            return false;
        }
        
        if (!data.shop_address.trim()) {
            showNotification('업체의 상세 주소를 입력해주세요.', 'error');
            return false;
        }
        
        if (!data.business_number || !data.business_number.trim()) {
            showNotification('사업자등록번호를 입력해주세요.', 'error');
            return false;
        }
        
        // 사업자등록번호 형식 검증 (000-00-00000)
        const businessNumberPattern = /^\d{3}-\d{2}-\d{5}$/;
        if (!businessNumberPattern.test(data.business_number)) {
            showNotification('사업자등록번호 형식이 올바르지 않습니다. (예: 123-45-67890)', 'error');
            return false;
        }
        
        if (!data.business_license_number || !data.business_license_number.trim()) {
            showNotification('영업신고증 번호를 입력해주세요.', 'error');
            return false;
        }
        
        // 영업신고증 번호 기본 검증
        if (data.business_license_number.length < 5) {
            showNotification('영업신고증 번호를 정확히 입력해주세요.', 'error');
            return false;
        }
        
        // 네이버 카페 아이디 검증
        if (!data.naver_cafe_id || !data.naver_cafe_id.trim()) {
            showNotification('네이버 카페 아이디를 입력해주세요.', 'error');
            return false;
        }
        
        // 네이버 아이디 형식 기본 검증 (영문, 숫자, 4-20자)
        const naverIdPattern = /^[a-zA-Z0-9]{4,20}$/;
        if (!naverIdPattern.test(data.naver_cafe_id)) {
            showNotification('네이버 아이디는 영문, 숫자 조합으로 4-20자여야 합니다.', 'error');
            return false;
        }
    }
    
    // 약관 동의 검증
    if (!data.terms_service) {
        showNotification('서비스 이용약관에 동의해주세요.', 'error');
        return false;
    }
    
    if (!data.terms_privacy) {
        showNotification('개인정보 수집 및 이용에 동의해주세요.', 'error');
        return false;
    }
    
    return true;
}

// 회원가입 처리
async function processRegister(registerData) {
    try {
        console.log('📝 회원가입 프로세스 시작');
        console.log('📧 입력 데이터:', registerData);
        
        // 이메일 중복 확인 (다시 한 번)
        console.log('🔍 이메일 중복 확인 중...');
        const emailExists = await checkEmailExists(registerData.email);
        if (emailExists) {
            console.warn('⚠️ 이메일 중복:', registerData.email);
            return {
                success: false,
                message: '이미 사용 중인 이메일입니다.'
            };
        }
        console.log('✅ 이메일 중복 없음');
        
        // 사용자 데이터 생성
        let userData;
        
        // 비밀번호 강도 검증 (비활성화됨 - 개발 편의성)
        if (window.securityManager) {
            console.log('✅ Security Manager 로드됨');
            console.log('🔒 비밀번호 강도 검증 중...');
            
            try {
                const passwordCheck = window.securityManager.validatePasswordStrength(registerData.password);
                console.log('📊 비밀번호 강도:', passwordCheck);
                
                // 강도 검증 건너뛰기 (보안보다 편의성 우선)
                console.log('✅ 비밀번호 강도 검증 건너뛰기 (개발 모드)');
            } catch (strengthError) {
                console.error('⚠️ 비밀번호 강도 검증 오류:', strengthError);
                // 강도 검증 실패해도 계속 진행
            }
            
            // 비밀번호 해시화
            console.log('🔐 비밀번호 해시화 중...');
            try {
                const hashedPassword = await window.securityManager.hashPassword(registerData.password);
                console.log('✅ 비밀번호 해시화 완료:', {
                    hashLength: hashedPassword.hash.length,
                    saltLength: hashedPassword.salt.length
                });
                
                // 사용자 데이터 생성 (보안 강화 - 해시 포함)
                // Salt를 비밀번호 해시에 포함 (password_salt 필드가 스키마에 없으므로)
                userData = {
                    email: registerData.email,
                    password: hashedPassword.hash + ':' + hashedPassword.salt, // hash:salt 형식
                    name: registerData.name,
                    phone: registerData.phone,
                    user_type: registerData.user_type,
                    state: registerData.shop_state || '',
                    district: registerData.shop_district || '',
                    detail_address: registerData.shop_address || '',
                    status: 'active', // is_active 대신 status 사용
                    is_verified: false,
                    shop_id: '',
                    // 카페 정보 (업체인 경우)
                    cafe_platform: registerData.naver_cafe_id ? 'naver' : null,
                    cafe_id: registerData.naver_cafe_id || null
                };
            } catch (hashError) {
                console.error('❌ 비밀번호 해시화 실패:', hashError);
                throw new Error('비밀번호 해시화 중 오류가 발생했습니다: ' + hashError.message);
            }
        } else {
            // 보안 매니저가 없는 경우 기본 처리 (평문 비밀번호)
            console.warn('⚠️ 보안 매니저 없음 - 비밀번호 평문 저장됨');
            userData = {
                email: registerData.email,
                password: registerData.password, // 평문 저장 (보안 취약)
                name: registerData.name,
                phone: registerData.phone,
                user_type: registerData.user_type,
                state: registerData.shop_state || '',
                district: registerData.shop_district || '',
                detail_address: registerData.shop_address || '',
                status: 'active', // is_active 대신 status 사용
                is_verified: false,
                shop_id: '',
                // 카페 정보 (업체인 경우)
                cafe_platform: registerData.naver_cafe_id ? 'naver' : null,
                cafe_id: registerData.naver_cafe_id || null
            };
        }
        
        // 사용자 생성
        console.log('👤 사용자 생성 시도:', userData);
        const response = await fetch('tables/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        console.log('📡 API 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API 오류 응답:', errorText);
            throw new Error(`사용자 생성 실패: ${response.status} ${errorText}`);
        }
        
        const newUser = await response.json();
        console.log('✅ 사용자 생성 성공:', newUser);
        
        // 피부관리실인 경우 추가 처리
        if (registerData.user_type === 'shop') {
            // 피부관리실 정보 생성 (스키마에 맞게)
            const shopData = {
                name: registerData.shop_name || registerData.name + '의 샵', // shop_name -> name
                owner_name: registerData.name,
                phone: registerData.phone,
                email: registerData.email,
                state: registerData.shop_state,
                district: registerData.shop_district,
                address: registerData.shop_address,
                services: [], // specialties -> services
                description: '', // rich_text 필드
                status: 'pending' // is_active -> status (승인 대기)
            };
            
            console.log('🏪 피부관리실 생성 시도:', shopData);
            const shopResponse = await fetch('tables/skincare_shops', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(shopData)
            });
            
            console.log('📡 샵 API 응답 상태:', shopResponse.status, shopResponse.statusText);
            
            if (shopResponse.ok) {
                const newShop = await shopResponse.json();
                console.log('✅ 피부관리실 생성 성공:', newShop);
                
                // 사용자에 피부관리실 ID 연결
                console.log('🔗 사용자-샵 연결 시도:', newUser.id, '→', newShop.id);
                const linkResponse = await fetch(`/tables/users/${newUser.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        shop_id: newShop.id
                    })
                });
                
                if (linkResponse.ok) {
                    console.log('✅ 사용자-샵 연결 성공');
                    
                    // 🔍 공공데이터 자동 매칭 시도
                    try {
                        console.log('🔍 공공데이터 자동 매칭 시작...');
                        if (typeof autoMatchPublicDataShop === 'function') {
                            const matchResult = await autoMatchPublicDataShop({
                                id: newShop.id,
                                shop_name: shopData.name,
                                state: shopData.state,
                                district: shopData.district,
                                address: shopData.address,
                                shop_phone: shopData.phone,
                                user_id: newUser.id
                            });
                            
                            if (matchResult.matched) {
                                console.log('✅ 공공데이터 자동 매칭 성공:', matchResult);
                            } else {
                                console.log('ℹ️ 공공데이터 매칭 실패:', matchResult.reason);
                            }
                        } else {
                            console.warn('⚠️ 자동 매칭 함수 없음 (auto-matching.js 로드 필요)');
                        }
                    } catch (matchError) {
                        console.error('❌ 자동 매칭 오류:', matchError);
                        // 매칭 실패해도 회원가입은 진행
                    }
                } else {
                    const linkError = await linkResponse.text();
                    console.error('❌ 사용자-샵 연결 실패:', linkError);
                }
            } else {
                const shopError = await shopResponse.text();
                console.error('❌ 피부관리실 생성 실패:', shopError);
            }
        }
        
        return {
            success: true,
            user: newUser
        };
        
    } catch (error) {
        console.error('회원가입 처리 오류:', error);
        console.error('오류 상세:', error.message);
        console.error('오류 스택:', error.stack);
        return {
            success: false,
            message: `회원가입 처리 중 오류가 발생했습니다: ${error.message}`
        };
    }
}

// 이메일 중복 확인
async function checkEmailDuplicate() {
    const emailInput = document.getElementById('email');
    const resultDiv = document.getElementById('email-check-result');
    
    const email = emailInput.value.trim();
    
    if (!email) {
        showNotification('이메일을 입력해주세요.', 'error');
        return;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('올바른 이메일 형식으로 입력해주세요.', 'error');
        return;
    }
    
    try {
        const exists = await checkEmailExists(email);
        
        if (exists) {
            resultDiv.textContent = '이미 사용 중인 이메일입니다.';
            resultDiv.className = 'mt-1 text-sm text-red-600';
            emailCheckResult = false;
        } else {
            resultDiv.textContent = '사용 가능한 이메일입니다.';
            resultDiv.className = 'mt-1 text-sm text-green-600';
            emailCheckResult = true;
        }
        
        resultDiv.classList.remove('hidden');
        
    } catch (error) {
        console.error('이메일 확인 오류:', error);
        showNotification('이메일 확인 중 오류가 발생했습니다.', 'error');
    }
}

// 이메일 존재 여부 확인
async function checkEmailExists(email) {
    try {
        // 데모 계정 확인
        const demoAccounts = getDemoAccounts();
        const demoExists = demoAccounts.some(account => account.email === email);
        
        if (demoExists) {
            console.log('📧 데모 계정 중복:', email);
            return true;
        }
        
        // 실제 사용자 확인
        const response = await fetch(`tables/users?search=${encodeURIComponent(email)}`);
        
        if (!response.ok) {
            console.warn('⚠️ 사용자 조회 실패, 중복 없음으로 처리');
            return false;
        }
        
        const userData = await response.json();
        
        // userData.data가 배열인지 확인
        if (!userData.data || !Array.isArray(userData.data)) {
            console.warn('⚠️ 사용자 데이터 형식 오류, 중복 없음으로 처리');
            return false;
        }
        
        const exists = userData.data.some(user => user.email === email);
        console.log(`📧 이메일 중복 확인: ${email} → ${exists ? '중복' : '사용 가능'}`);
        return exists;
        
    } catch (error) {
        console.error('❌ 이메일 존재 확인 오류:', error);
        return false; // 오류 시 중복 없음으로 처리 (회원가입 허용)
    }
}

// 비밀번호 일치 확인
function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('confirmPassword').value;
    const resultDiv = document.getElementById('password-match-result');
    
    if (passwordConfirm && resultDiv) {
        if (password === passwordConfirm) {
            resultDiv.textContent = '비밀번호가 일치합니다.';
            resultDiv.className = 'mt-1 text-sm text-green-600';
        } else {
            resultDiv.textContent = '비밀번호가 일치하지 않습니다.';
            resultDiv.className = 'mt-1 text-sm text-red-600';
        }
        resultDiv.classList.remove('hidden');
    } else if (resultDiv) {
        resultDiv.classList.add('hidden');
    }
}

// 전체 약관 동의 처리는 register.html에서 처리됨

// 비밀번호 표시/숨김 토글
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.className = 'fas fa-eye';
    } else {
        passwordInput.type = 'password';
        passwordIcon.className = 'fas fa-eye-slash';
    }
}

// 회원가입 비밀번호 표시/숨김 토글
function toggleRegisterPassword() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('passwordToggle');
    
    if (passwordInput && passwordIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordIcon.className = 'fas fa-eye';
        } else {
            passwordInput.type = 'password';
            passwordIcon.className = 'fas fa-eye-slash';
        }
    }
}

// 세션 저장
function saveSession(user, token, rememberMe) {
    currentUser = user;
    sessionToken = token;
    
    localStorage.setItem('session_token', token);
    localStorage.setItem('user_type', user.user_type);
    localStorage.setItem('user_data', JSON.stringify(user));
    
    // Remember Me 기능
    const expirationTime = rememberMe 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30일
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간
    
    localStorage.setItem('session_expires', expirationTime.toISOString());
}

// 세션 정리
function clearSession() {
    currentUser = null;
    sessionToken = null;
    
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_data');
    localStorage.removeItem('session_expires');
}

// 로그아웃
function logout() {
    clearSession();
    showNotification('로그아웃되었습니다.', 'info');
    window.location.href = 'index.html';
}

// 대시보드로 리다이렉트
function redirectToDashboard(userType) {
    // ===== v2.8.13: 로그인 플로우 개선 =====
    
    // 1. 사용자 의도 확인 (견적상담/전화상담 버튼 클릭)
    const userIntent = JSON.parse(localStorage.getItem('user_intent') || '{}');
    const redirectIntent = localStorage.getItem('redirectIntent'); // 기존 호환성
    const returnUrl = sessionStorage.getItem('return_url'); // 이전 페이지
    
    // 2. 로그인 성공 팝업 표시
    showLoginSuccessPopup();
    
    // 3. 우선순위: user_intent > redirectIntent > return_url > 기본 대시보드
    if (userIntent.action && userType === 'customer') {
        // v2.8.13 신규: 상세한 의도 처리
        localStorage.removeItem('user_intent');
        
        if (userIntent.action === 'consultation') {
            // 견적 신청으로 이동 후 해당 섹션으로 스크롤
            window.location.href = 'index.html#consultation-form';
        } else if (userIntent.action === 'phone') {
            // 전화 상담으로 이동
            window.location.href = 'index.html#representative-shop';
        } else {
            // 기타 액션
            window.location.href = userIntent.redirect || 'customer-dashboard.html';
        }
        return;
    }
    
    if (redirectIntent && userType === 'customer') {
        // 기존 로직 유지 (호환성)
        localStorage.removeItem('redirectIntent');
        
        if (redirectIntent === 'consultation') {
            window.location.href = 'index.html?action=consultation#consultation-form';
        } else if (redirectIntent === 'phone') {
            window.location.href = 'index.html?action=phone#representative-shop';
        } else {
            window.location.href = 'customer-dashboard.html';
        }
        return;
    }
    
    if (returnUrl) {
        // 이전 페이지로 복귀
        sessionStorage.removeItem('return_url');
        window.location.href = returnUrl;
        return;
    }
    
    // 4. 기본 대시보드로 이동
    const redirectMap = {
        'customer': 'customer-dashboard.html',
        'shop': 'shop-dashboard.html',
        'admin': 'admin-dashboard.html'
    };
    
    const targetPage = redirectMap[userType] || 'index.html';
    window.location.href = targetPage;
}

// ===== v2.8.13: 로그인 성공 팝업 =====
function showLoginSuccessPopup() {
    const user = getCurrentUser();
    if (!user) return;
    
    // 팝업 생성
    const popup = document.createElement('div');
    popup.className = 'login-success-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <i class="fas fa-check-circle text-green-500 text-4xl mb-2"></i>
            <h3 class="text-lg font-bold mb-1">로그인 완료!</h3>
            <p class="text-sm text-gray-600">${user.name}님, 환영합니다</p>
        </div>
    `;
    
    // 스타일 추가
    if (!document.getElementById('login-success-styles')) {
        const style = document.createElement('style');
        style.id = 'login-success-styles';
        style.textContent = `
            .login-success-popup {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                animation: slideInRight 0.3s ease-out;
            }
            .login-success-popup .popup-content {
                background: white;
                padding: 20px 30px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                text-align: center;
                border: 2px solid #10b981;
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @media (max-width: 768px) {
                .login-success-popup {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(popup);
    
    // 1.5초 후 제거
    setTimeout(() => {
        popup.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => popup.remove(), 300);
    }, 1500);
}

// 세션 토큰 생성
function generateSessionToken() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// 데모 계정 데이터
function getDemoAccounts() {
    return [
        {
            id: 'demo_customer_1',
            email: 'demo@customer.com',
            password: 'customer123',
            name: '데모 고객',
            phone: '010-1111-1111',
            user_type: 'customer',
            state: '서울특별시',
            district: '강남구',
            detail_address: '데모 주소',
            status: 'active',
            is_verified: false,
            shop_id: '',
            cafe_platform: null,
            cafe_id: null
        },
        {
            id: 'test_customer_1',
            email: 'test@test.com',
            password: 'test123',
            name: '테스트 고객',
            phone: '010-1234-5678',
            user_type: 'customer',
            state: '서울특별시',
            district: '강남구',
            detail_address: '테스트 주소',
            status: 'active',
            is_verified: true,
            shop_id: '',
            cafe_platform: null,
            cafe_id: null
        },
        {
            id: 'demo_shop_1',
            email: 'demo@shop.com',
            password: 'shop123',
            name: '데모 업체',
            phone: '010-2222-2222',
            user_type: 'shop',
            state: '서울특별시',
            district: '강남구',
            detail_address: '데모 주소',
            status: 'active',
            is_verified: false,
            shop_id: 'shop_001',
            cafe_platform: null,
            cafe_id: null
        },
        {
            id: 'test_shop_1',
            email: 'shop@test.com',
            password: 'test123',
            name: '테스트 비유티샵',
            phone: '010-2345-6789',
            user_type: 'shop',
            state: '서울특별시',
            district: '강남구',
            detail_address: '테스트 업체 주소',
            status: 'active',
            is_verified: true,
            shop_id: 'shop_002',
            cafe_platform: null,
            cafe_id: null
        },
        {
            id: 'demo_admin_1',
            email: 'admin@demo.com',
            password: 'admin123',
            name: '데모 관리자',
            phone: '010-0000-0000',
            user_type: 'admin',
            state: '',
            district: '',
            detail_address: '',
            status: 'active',
            is_verified: true,
            shop_id: '',
            cafe_platform: null,
            cafe_id: null
        },
        {
            id: 'test_admin_1',
            email: 'admin@test.com',
            password: 'test123',
            name: '테스트 관리자',
            phone: '010-9999-9999',
            user_type: 'admin',
            state: '',
            district: '',
            detail_address: '',
            status: 'active',
            is_verified: true,
            shop_id: '',
            cafe_platform: null,
            cafe_id: null
        }
    ];
}

// 데모 계정 로드 (개발용)
async function loadDemoAccounts() {
    try {
        // 개발 환경이 아니면 데모 데이터 로드 건너뛰기
        const isProduction = location.hostname === 'beautycat.kr' || 
                           location.hostname === 'www.beautycat.kr' ||
                           location.hostname.includes('beautycat.pages.dev');
        
        if (isProduction) {
            console.log('🏭 프로덕션 환경: 데모 계정 로드 건너뛰기');
            return;
        }
        
        // 기존 사용자 확인 (안전한 API 방식)
        let usersData;
        try {
            const response = await fetch('tables/users?limit=100');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            usersData = await response.json();
        } catch (error) {
            console.warn('⚠️ 사용자 테이블 접근 실패. 데모 계정 로드를 건너뜁니다.', error.message);
            return;
        }
        
        // 데이터가 유효하지 않은 경우 처리
        if (!usersData || !Array.isArray(usersData.data)) {
            console.warn('사용자 데이터 형식이 올바르지 않습니다. 데모 계정 로드를 건너뜁니다.');
            return;
        }
        
        // 데모 계정이 이미 존재하는지 확인
        const demoExists = usersData.data.some(user => user.email && user.email.includes('@demo.com'));
        
        if (!demoExists) {
            // 데모 계정 생성
            const demoAccounts = getDemoAccounts();
            
            for (const account of demoAccounts) {
                await fetch('tables/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(account)
                });
            }
            
            console.log('데모 계정이 생성되었습니다.');
        }
        
        // 데모 업체 정보도 생성
        await loadDemoShops();
        
    } catch (error) {
        // 프로덕션에서는 데모 계정 없이도 정상 작동해야 함
        // 개발 환경에서만 디버깅용으로 출력
        if (!isProduction && window.location.hostname === 'localhost') {
            console.warn('⚠️ 데모 계정 로드 오류 (무시됨):', error.message);
        }
    }
}

// 데모 업체 정보 로드 (지역 정보 포함)
async function loadDemoShops() {
    try {
        // 프로덕션 환경에서는 데모 샵 로드 건너뛰기
        const isProduction = location.hostname === 'beautycat.kr' ||
                           location.hostname === 'www.beautycat.kr' ||
                           location.hostname.includes('beautycat.pages.dev');
        
        if (isProduction) {
            console.log('🏭 프로덕션 환경 감지: 데모 샵 로드 건너뛰기');
            return;
        }
        
        const existingShops = await fetch('tables/skincare_shops');
        const shopsData = await existingShops.json();
        
        // 데모 업체가 이미 존재하는지 확인
        const demoShopExists = shopsData.data.some(shop => 
            shop.email === 'demo@shop.com' || 
            (shop.shop_name && shop.shop_name.includes('데모'))
        );
        
        if (!demoShopExists) {
            // D1 스키마에 맞춘 데모 업체 데이터
            const demoShops = [
                {
                    id: 'demo_shop_seoul_geumcheon',
                    name: '데모 피부관리실 (금천구점)',
                    owner_name: '데모 사장님',
                    email: 'demo@shop.com',
                    phone: '02-1234-5678',
                    address: '서울특별시 금천구 가산동 123-45 데모빌딩 2층',
                    state: '서울특별시',
                    district: '금천구',
                    services: JSON.stringify(['여드름관리', '미백관리', '모공관리']),
                    description: '금천구 지역 전문 피부관리실입니다.',
                    business_number: '123-45-67890',
                    business_license: null,
                    status: 'active',
                    representative_treatments: JSON.stringify(['여드름관리', '미백관리']),
                    price_range: '50000-150000',
                    operating_hours: JSON.stringify({
                        weekday: '10:00-21:00',
                        weekend: '10:00-19:00'
                    })
                },
                {
                    id: 'demo_shop_seoul_gangnam',
                    name: '데모 피부관리실 (강남구점)',
                    owner_name: '데모 원장님',
                    email: 'demo2@shop.com',
                    phone: '02-2345-6789',
                    address: '서울특별시 강남구 역삼동 456-78 강남타워 5층',
                    state: '서울특별시',
                    district: '강남구',
                    services: JSON.stringify(['안티에이징', '리프팅', '화이트닝']),
                    description: '강남구 최고급 피부관리실입니다.',
                    business_number: '234-56-78901',
                    business_license: null,
                    status: 'active',
                    representative_treatments: JSON.stringify(['안티에이징', '리프팅']),
                    price_range: '100000-300000',
                    operating_hours: JSON.stringify({
                        weekday: '09:00-22:00',
                        weekend: '09:00-20:00'
                    })
                }
            ];
            
            for (const shop of demoShops) {
                await fetch('tables/skincare_shops', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(shop)
                });
            }
            
            console.log('✅ 데모 업체 정보가 생성되었습니다 (지역 정보 포함)');
        }
        
    } catch (error) {
        console.error('데모 업체 로드 오류:', error);
    }
}

// 알림 메시지 표시
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-transform duration-300 translate-x-full`;
    
    const bgColor = type === 'success' ? 'bg-green-100' : 
                   type === 'error' ? 'bg-red-100' : 
                   type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100';
    
    const borderColor = type === 'success' ? 'border-green-400' : 
                       type === 'error' ? 'border-red-400' : 
                       type === 'warning' ? 'border-yellow-400' : 'border-blue-400';
    
    const iconColor = type === 'success' ? '#22c55e' : 
                     type === 'error' ? '#ef4444' : 
                     type === 'warning' ? '#f59e0b' : '#3b82f6';
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    notification.className += ` ${bgColor} border-2 ${borderColor}`;
    
    // 인라인 스타일로 명시적으로 설정 (important 사용)
    notification.style.cssText = `
        color: #1f2937 !important;
        font-weight: 500;
        font-size: 14px;
    `;
    
    notification.innerHTML = `
        <div class="flex items-start">
            <i class="fas ${icon} mr-3 mt-1" style="color: ${iconColor} !important; font-size: 20px;"></i>
            <div class="flex-1" style="color: #1f2937 !important; font-weight: 500; line-height: 1.5;">${message}</div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-3 hover:opacity-70" style="color: #6b7280 !important;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 애니메이션으로 표시
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // 자동 제거
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

// 데모 계정 정보 토글
function toggleDemoInfo() {
    const demoInfo = document.getElementById('demo-info');
    demoInfo.classList.toggle('hidden');
}

// 데모 계정 자동 입력
function fillDemoAccount(type) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // 사용자 타입 선택
    const userTypeRadios = document.querySelectorAll('input[name="user_type"]');
    userTypeRadios.forEach(radio => {
        if (radio.value === type) {
            radio.checked = true;
            // 라디오 버튼 UI 업데이트 트리거
            radio.dispatchEvent(new Event('change'));
        }
    });
    
    // 계정 정보 입력
    const demoAccounts = {
        'customer': { email: 'demo@customer.com', password: 'customer123' },
        'shop': { email: 'demo@shop.com', password: 'shop123' },
        'admin': { email: 'admin@demo.com', password: 'admin123' }
    };
    
    const account = demoAccounts[type];
    if (account) {
        emailInput.value = account.email;
        passwordInput.value = account.password;
        
        // 성공 메시지
        const typeNames = { 'customer': '고객', 'shop': '업체', 'admin': '관리자' };
        showNotification(`${typeNames[type]} 데모 계정이 입력되었습니다!`, 'info');
    }
}

// 사용자 타입 선택 UI 업데이트 (데모 계정에서 호출)
function updateUserTypeSelection(selectedLabel) {
    // 모든 라벨 초기화
    document.querySelectorAll('label[id$="-option"]').forEach(label => {
        const icon = label.querySelector('.fa-check-circle');
        label.classList.remove('border-pink-300', 'bg-pink-50', 'border-purple-300', 'bg-purple-50', 'border-blue-300', 'bg-blue-50');
        label.classList.add('border-gray-200');
        if (icon) icon.classList.add('hidden');
    });
    
    // 선택된 라벨 활성화
    const radio = selectedLabel.querySelector('input[type="radio"]');
    const icon = selectedLabel.querySelector('.fa-check-circle');
    
    const colorMap = {
        'customer': ['border-pink-300', 'bg-pink-50'],
        'shop': ['border-purple-300', 'bg-purple-50'],
        'admin': ['border-blue-300', 'bg-blue-50']
    };
    
    selectedLabel.classList.remove('border-gray-200');
    selectedLabel.classList.add(...colorMap[radio.value]);
    if (icon) icon.classList.remove('hidden');
}

// 현재 로그인한 사용자 가져오기
function getCurrentUser() {
    try {
        // 여러 키를 확인하여 호환성 보장
        let userData = localStorage.getItem('currentUser') || 
                      localStorage.getItem('user_data') ||
                      sessionStorage.getItem('currentUser');
        
        if (userData) {
            const user = JSON.parse(userData);
            
            // 관리자 권한 보정 (데모 계정 등)
            if (user.user_type === 'admin' && (!user.permissions || user.permissions.length === 0)) {
                user.permissions = ['all'];
                console.log('🔧 관리자 권한 자동 보정:', user.email);
            }
            
            return user;
        }
        
        return null;
    } catch (error) {
        console.error('사용자 데이터 파싱 오류:', error);
        return null;
    }
}

// 로그인 상태 확인
function isLoggedIn() {
    return !!getCurrentUser();
}

// 특정 권한 확인
function hasPermission(permission) {
    const user = getCurrentUser();
    if (!user) return false;
    
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
}

// ======= 전역 함수 노출 (register.html 등에서 사용) =======
window.processRegister = processRegister;
window.processLogin = processLogin;
window.showNotification = showNotification;

// 디버깅 함수 (콘솔에서 테스트 가능)
window.testRegister = async function() {
    const testData = {
        email: 'test_debug@test.com',
        password: 'Test1234!',
        name: '테스트사용자',
        phone: '01012345678',
        user_type: 'customer',
        shop_state: '서울특별시',
        shop_district: '강남구',
        shop_address: '테스트 주소 123',
        terms_service: true,
        terms_privacy: true
    };
    
    console.log('🧪 테스트 회원가입 시작:', testData);
    const result = await processRegister(testData);
    console.log('🧪 테스트 결과:', result);
    return result;
};

console.log('✅ auth.js 로드 완료');
console.log('🔧 디버깅: window.testRegister() 호출로 테스트 가능');

// ======= 레벨 1 기본인증 통합 함수들 =======

// 레벨 1 기본인증 사용 여부 확인
async function askForLevel1Auth(registerData) {
    return new Promise((resolve) => {
        // 레벨 1 인증 옵션 모달 표시
        const modalHTML = `
            <div id="level1AuthOptionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div class="text-center mb-6">
                        <div class="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <i class="fas fa-shield-alt text-blue-600 text-xl"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">회원가입 인증 선택</h3>
                        <p class="text-sm text-gray-600">더 안전한 계정을 위해 레벨 1 기본인증을 추천드립니다</p>
                    </div>
                    
                    <div class="space-y-4 mb-6">
                        <div class="border border-gray-200 rounded-lg p-4">
                            <h4 class="font-medium text-gray-900 mb-2">📧 레벨 1 기본인증 (추천)</h4>
                            <div class="text-sm text-gray-600 mb-2">
                                • 이메일 인증 (5원) + SMS 인증 (35원)<br>
                                • 총 비용: 40원<br>
                                • 계정 보안성 향상<br>
                                • 빠른 인증 (5분 이내)
                            </div>
                            <div class="text-xs text-blue-600">💰 기존 300원 인증 대비 87% 절약</div>
                        </div>
                        
                        <div class="border border-gray-200 rounded-lg p-4">
                            <h4 class="font-medium text-gray-900 mb-2">🔓 기본 회원가입</h4>
                            <div class="text-sm text-gray-600">
                                • 무료<br>
                                • 즉시 가입 완료<br>
                                • 기본 보안 수준
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex space-x-3">
                        <button onclick="selectAuthOption(true)" 
                                class="flex-1 bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 font-medium">
                            레벨 1 인증 사용 (40원)
                        </button>
                        <button onclick="selectAuthOption(false)" 
                                class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-md hover:bg-gray-200 font-medium">
                            기본 가입
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 전역 콜백 함수 설정
        window.selectAuthOption = (useLevel1) => {
            document.getElementById('level1AuthOptionModal').remove();
            delete window.selectAuthOption;
            resolve(useLevel1);
        };
    });
}

// 회원가입용 레벨 1 기본인증 시작
async function startLevel1AuthForRegistration(registerData) {
    try {
        console.log('🚀 회원가입용 레벨 1 기본인증 시작');
        
        // main.js의 level1Auth 인스턴스 사용
        if (typeof level1Auth === 'undefined') {
            throw new Error('레벨 1 인증 시스템을 찾을 수 없습니다.');
        }
        
        const authData = {
            email: registerData.email,
            phone: registerData.phone,
            user_id: 'new_user_' + Date.now() // 임시 사용자 ID
        };
        
        // 레벨 1 기본인증 시작
        const result = await level1Auth.startBasicAuth(authData);
        
        if (result.success) {
            // 인증 완료를 기다림 (Promise로 처리)
            return await waitForAuthCompletion();
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        console.error('회원가입 인증 오류:', error);
        return { success: false, message: error.message };
    }
}

// 인증 완료 대기
function waitForAuthCompletion() {
    return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
            // 인증 완료 확인
            const authResult = localStorage.getItem('level1_auth_result');
            if (authResult) {
                clearInterval(checkInterval);
                const parsedResult = JSON.parse(authResult);
                
                // 인증 데이터 정리
                localStorage.removeItem('level1_auth_result');
                
                resolve({
                    success: true,
                    data: parsedResult,
                    message: '레벨 1 기본인증이 완료되었습니다.'
                });
            }
        }, 1000);
        
        // 10분 타임아웃
        setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('인증 시간이 초과되었습니다.'));
        }, 600000);
    });
}

// 로그인용 레벨 1 기본인증 (선택사항)
async function offerLevel1AuthForLogin(loginData) {
    try {
        const user = await getUserByEmail(loginData.email);
        if (!user || user.auth_level >= 1) {
            return null; // 이미 인증된 사용자이거나 존재하지 않는 경우
        }
        
        // 레벨 1 인증 업그레이드 제안
        const shouldUpgrade = await askForAuthUpgrade();
        
        if (shouldUpgrade) {
            const authData = {
                email: user.email,
                phone: user.phone,
                user_id: user.id
            };
            
            const result = await level1Auth.startBasicAuth(authData);
            if (result.success) {
                const authResult = await waitForAuthCompletion();
                
                // 사용자 정보 업데이트
                await updateUserAuthLevel(user.id, authResult.data);
                
                return authResult;
            }
        }
        
        return null;
        
    } catch (error) {
        console.error('로그인 인증 업그레이드 오류:', error);
        return null;
    }
}

// 인증 업그레이드 제안
function askForAuthUpgrade() {
    return new Promise((resolve) => {
        const modalHTML = `
            <div id="authUpgradeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div class="text-center mb-4">
                        <div class="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <i class="fas fa-level-up-alt text-yellow-600 text-xl"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">계정 보안 업그레이드</h3>
                        <p class="text-sm text-gray-600">레벨 1 기본인증으로 계정을 더 안전하게 보호하시겠습니까?</p>
                        <p class="text-xs text-blue-600 mt-2">비용: 40원 (이메일 5원 + SMS 35원)</p>
                    </div>
                    
                    <div class="flex space-x-3">
                        <button onclick="selectUpgrade(true)" 
                                class="flex-1 bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600">
                            업그레이드
                        </button>
                        <button onclick="selectUpgrade(false)" 
                                class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400">
                            나중에
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        window.selectUpgrade = (upgrade) => {
            document.getElementById('authUpgradeModal').remove();
            delete window.selectUpgrade;
            resolve(upgrade);
        };
    });
}

// 사용자 인증 레벨 업데이트
async function updateUserAuthLevel(userId, authData) {
    try {
        const response = await fetch(`tables/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                auth_level: authData.auth_level,
                auth_type: authData.auth_type,
                verified_email: authData.verified_email,
                verified_phone: authData.verified_phone,
                auth_time: authData.auth_time
            })
        });
        
        if (response.ok) {
            console.log('✅ 사용자 인증 레벨 업데이트 완료');
        }
        
    } catch (error) {
        console.error('사용자 인증 레벨 업데이트 실패:', error);
    }
}

// 이메일로 사용자 조회
async function getUserByEmail(email) {
    try {
        const response = await fetch(`tables/users?search=${encodeURIComponent(email)}`);
        const data = await response.json();
        
        const user = data.data.find(u => u.email === email);
        return user || null;
        
    } catch (error) {
        console.error('사용자 조회 오류:', error);
        return null;
    }
}

// ===== v2.8.13: 로그인 상태 표시 업데이트 함수 =====
function updateLoginStatusDisplay() {
    const user = getCurrentUser();
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loggedInMenu = document.getElementById('loggedInMenu');
    
    if (user && user.email) {
        // 로그인 상태
        if (loginBtn) loginBtn.classList.add('hidden');
        if (registerBtn) registerBtn.classList.add('hidden');
        if (loggedInMenu) {
            loggedInMenu.classList.remove('hidden');
            loggedInMenu.classList.add('flex');
        }
        
        // 사용자 이름 표시 (있는 경우)
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.textContent = user.name || '회원';
        }
        
        // 상단 로그인 상태 배지 추가 (없으면 생성)
        addLoginStatusBadge(user);
        
    } else {
        // 비로그인 상태
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (registerBtn) registerBtn.classList.remove('hidden');
        if (loggedInMenu) {
            loggedInMenu.classList.add('hidden');
            loggedInMenu.classList.remove('flex');
        }
        
        // 로그인 상태 배지 제거
        removeLoginStatusBadge();
    }
}

// 로그인 상태 배지 추가
function addLoginStatusBadge(user) {
    // 기존 배지 제거
    removeLoginStatusBadge();
    
    const header = document.querySelector('.simple-header');
    if (!header) return;
    
    const badge = document.createElement('div');
    badge.id = 'login-status-badge';
    badge.className = 'login-status-badge';
    badge.innerHTML = `
        <i class="fas fa-circle text-green-500"></i>
        <span class="hidden sm:inline">${user.name || '회원'}님</span>
    `;
    
    // 스타일 추가
    if (!document.getElementById('login-status-badge-styles')) {
        const style = document.createElement('style');
        style.id = 'login-status-badge-styles';
        style.textContent = `
            .login-status-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.375rem 0.75rem;
                background: linear-gradient(135deg, #10b98120, #10b98110);
                border-radius: 1.5rem;
                font-size: 0.875rem;
                font-weight: 600;
                color: #059669;
                border: 1px solid #10b98140;
                position: fixed;
                top: 1rem;
                left: 1rem;
                z-index: 1001;
                animation: fadeIn 0.3s ease-out;
            }
            .login-status-badge i {
                font-size: 0.5rem;
                animation: pulse 2s infinite;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            @media (max-width: 640px) {
                .login-status-badge {
                    top: 0.5rem;
                    left: 0.5rem;
                    padding: 0.25rem 0.5rem;
                    font-size: 0.75rem;
                }
                .login-status-badge span {
                    max-width: 60px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(badge);
}

// 로그인 상태 배지 제거
function removeLoginStatusBadge() {
    const badge = document.getElementById('login-status-badge');
    if (badge) badge.remove();
}

// 전역 함수들
window.togglePassword = togglePassword;
window.toggleRegisterPassword = toggleRegisterPassword;
window.checkEmailDuplicate = checkEmailDuplicate;
window.logout = logout;
window.toggleDemoInfo = toggleDemoInfo;
window.fillDemoAccount = fillDemoAccount;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
window.hasPermission = hasPermission;
window.updateLoginStatusDisplay = updateLoginStatusDisplay; // v2.8.13 추가