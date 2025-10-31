// 디버깅용 Auth 테스트 스크립트
console.log('🧪 디버깅 Auth 스크립트 로드됨');

// API 테스트 함수
window.debugAuthAPI = async function() {
    try {
        console.log('🔍 API 디버깅 시작...');
        
        // 1. Config 확인
        console.log('⚙️ Config 확인:', window.BEAUTYCAT_CONFIG);
        
        // 2. API URL 생성
        const baseUrl = window.BEAUTYCAT_CONFIG?.API_BASE_URL || 'https://beautycat-api.jansmakr.workers.dev/api';
        const timestamp = Date.now();
        const testUrl = `${baseUrl}/tables/users?limit=5&_cb=${timestamp}`;
        
        console.log('🌐 테스트 URL:', testUrl);
        
        // 3. API 요청
        const response = await fetch(testUrl, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        console.log('📥 응답 상태:', response.status, response.statusText);
        console.log('📋 응답 헤더:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ 에러 응답:', errorText);
            return { error: true, status: response.status, message: errorText };
        }
        
        const data = await response.json();
        console.log('✅ 성공 응답:', data);
        
        return { success: true, data: data };
        
    } catch (error) {
        console.error('💥 API 테스트 실패:', error);
        return { error: true, message: error.message };
    }
};

// 로그인 테스트 함수
window.debugLogin = async function(email = 'jansmakr@gmail.com', password = 'password123', userType = 'customer') {
    try {
        console.log('🔐 로그인 테스트 시작:', { email, userType });
        
        // API에서 사용자 데이터 가져오기
        const apiResult = await debugAuthAPI();
        
        if (apiResult.error) {
            console.error('❌ API 연결 실패, 로그인 불가');
            return apiResult;
        }
        
        // 사용자 찾기
        const user = apiResult.data.data?.find(u => 
            u.email === email && 
            u.user_type === userType &&
            u.is_active !== false
        );
        
        if (!user) {
            console.log('❌ 사용자 없음:', email, userType);
            return { error: true, message: '사용자를 찾을 수 없습니다.' };
        }
        
        console.log('👤 사용자 발견:', user);
        
        // 비밀번호 확인
        if (user.password === password) {
            console.log('✅ 로그인 성공!');
            return { success: true, user: user };
        } else {
            console.log('❌ 비밀번호 불일치');
            return { error: true, message: '비밀번호가 일치하지 않습니다.' };
        }
        
    } catch (error) {
        console.error('💥 로그인 테스트 실패:', error);
        return { error: true, message: error.message };
    }
};

console.log(`
🚀 디버깅 함수 사용 가능:
- debugAuthAPI(): API 연결 테스트
- debugLogin(): 로그인 테스트
- debugLogin('다른이메일@test.com', 'password', 'shop'): 커스텀 로그인 테스트
`);