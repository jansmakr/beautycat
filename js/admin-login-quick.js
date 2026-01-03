// 🚀 관리자 즉시 로그인 스크립트
// 사용법: 브라우저 Console에서 복사 & 붙여넣기

console.log('🔐 관리자 권한 설정 중...');

localStorage.setItem('adminAccess', 'true');
localStorage.setItem('isLoggedIn', 'true');
localStorage.setItem('user_type', 'admin');
localStorage.setItem('user_email', 'admin@beautycat.kr');
localStorage.setItem('user_name', '시스템 관리자');
localStorage.setItem('user_id', 'admin_001');
localStorage.setItem('session_token', 'admin_' + Date.now());

console.log('✅ 관리자 권한 설정 완료!');
console.log('📧 이메일: admin@beautycat.kr');
console.log('👤 이름: 시스템 관리자');
console.log('🔄 3초 후 자동 새로고침...');

setTimeout(() => {
    console.log('🔄 페이지 새로고침 중...');
    location.reload();
}, 3000);
