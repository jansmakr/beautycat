// 관리자 초기 계정 생성 스크립트
// 사용법: 브라우저 콘솔에서 실행

(async function createAdminAccount() {
    console.log('🔐 관리자 계정 생성 시작...');
    
    // 1. 기존 관리자 계정 확인
    try {
        const response = await fetch('/tables/users?search=admin@beautycat.kr&limit=1');
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            console.log('✅ 기존 관리자 계정 발견:', data.data[0]);
            console.log('📧 이메일:', data.data[0].email);
            console.log('🔑 비밀번호: beautycat2025');
            
            // 로컬스토리지에 관리자 권한 설정
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user_type', 'admin');
            localStorage.setItem('user_id', data.data[0].id);
            localStorage.setItem('user_email', data.data[0].email);
            localStorage.setItem('user_name', data.data[0].name);
            localStorage.setItem('adminAccess', 'true');
            localStorage.setItem('session_token', 'admin_' + Date.now());
            
            console.log('✅ 관리자 권한 설정 완료!');
            console.log('👉 페이지를 새로고침하세요.');
            return;
        }
    } catch (error) {
        console.log('ℹ️ 기존 계정 조회 실패 (정상, 신규 생성)');
    }
    
    // 2. 신규 관리자 계정 생성
    console.log('📝 신규 관리자 계정 생성 중...');
    
    const adminData = {
        email: 'admin@beautycat.kr',
        password: 'beautycat2025',
        name: '시스템 관리자',
        user_type: 'admin',
        phone: '010-0000-0000',
        created_at: Date.now(),
        is_active: true,
        verified: true
    };
    
    try {
        const createResponse = await fetch('/tables/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adminData)
        });
        
        if (createResponse.ok) {
            const createdUser = await createResponse.json();
            console.log('✅ 관리자 계정 생성 완료!');
            console.log('📧 이메일:', adminData.email);
            console.log('🔑 비밀번호:', adminData.password);
            console.log('👤 ID:', createdUser.id);
            
            // 로컬스토리지에 관리자 권한 설정
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user_type', 'admin');
            localStorage.setItem('user_id', createdUser.id);
            localStorage.setItem('user_email', createdUser.email);
            localStorage.setItem('user_name', createdUser.name);
            localStorage.setItem('adminAccess', 'true');
            localStorage.setItem('session_token', 'admin_' + Date.now());
            
            console.log('✅ 관리자 권한 설정 완료!');
            console.log('👉 페이지를 새로고침하세요.');
            
        } else {
            const errorText = await createResponse.text();
            console.error('❌ 계정 생성 실패:', errorText);
        }
        
    } catch (error) {
        console.error('❌ 오류:', error);
    }
})();
