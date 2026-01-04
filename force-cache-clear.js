/**
 * 강제 캐시 클리어 및 즉시 재로드
 * v2.8.13.6.133
 */

(async function forceCacheClear() {
    console.log('🔄 강제 캐시 클리어 시작...');
    
    // 1. 로컬스토리지 백업
    const adminAccess = localStorage.getItem('adminAccess');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userType = localStorage.getItem('user_type');
    const userEmail = localStorage.getItem('user_email');
    const userName = localStorage.getItem('user_name');
    const userId = localStorage.getItem('user_id');
    const sessionToken = localStorage.getItem('session_token');
    
    console.log('💾 세션 백업 완료');
    
    // 2. Service Worker 제거
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
            await registration.unregister();
            console.log('✅ Service Worker 제거:', registration.scope);
        }
    }
    
    // 3. 모든 캐시 삭제
    if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
            await caches.delete(cacheName);
            console.log('✅ 캐시 삭제:', cacheName);
        }
    }
    
    // 4. 세션 복원
    if (adminAccess) localStorage.setItem('adminAccess', adminAccess);
    if (isLoggedIn) localStorage.setItem('isLoggedIn', isLoggedIn);
    if (userType) localStorage.setItem('user_type', userType);
    if (userEmail) localStorage.setItem('user_email', userEmail);
    if (userName) localStorage.setItem('user_name', userName);
    if (userId) localStorage.setItem('user_id', userId);
    if (sessionToken) localStorage.setItem('session_token', sessionToken);
    
    console.log('💾 세션 복원 완료');
    console.log('🎉 캐시 클리어 완료! 2초 후 페이지를 강제 새로고침합니다...');
    
    // 5. 강제 새로고침 (캐시 무시)
    setTimeout(() => {
        window.location.href = window.location.pathname + '?v=' + Date.now();
    }, 2000);
})();
