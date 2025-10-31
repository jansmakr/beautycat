// 브라우저 캐시 완전 초기화 스크립트
// 뽀샵 가성비 인증 시스템 오류 해결용

(function() {
    'use strict';
    
    console.log('🧹 뽀샵 브라우저 캐시 초기화 시작...');
    
    // 1. Service Worker 완전 제거
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            registrations.forEach(function(registration) {
                console.log('🗑️ Service Worker 제거:', registration.scope);
                registration.unregister();
            });
        });
    }
    
    // 2. 모든 캐시 스토리지 삭제
    if ('caches' in window) {
        caches.keys().then(function(names) {
            names.forEach(function(name) {
                console.log('🗑️ 캐시 삭제:', name);
                caches.delete(name);
            });
        });
    }
    
    // 3. 로컬/세션 스토리지 정리 (선택적)
    const confirmClear = confirm('로컬 스토리지도 초기화하시겠습니까?\n(인증 기록이 삭제됩니다)');
    
    if (confirmClear) {
        localStorage.clear();
        sessionStorage.clear();
        console.log('🗑️ 로컬/세션 스토리지 초기화 완료');
    }
    
    // 4. IndexedDB 정리
    if ('indexedDB' in window) {
        // 일반적인 DB 이름들 삭제 시도
        const dbNames = ['workbox-expiration', 'workbox-runtime', 'workbox-precache'];
        
        dbNames.forEach(function(dbName) {
            const deleteReq = indexedDB.deleteDatabase(dbName);
            deleteReq.onsuccess = function() {
                console.log('🗑️ IndexedDB 삭제:', dbName);
            };
            deleteReq.onerror = function() {
                console.log('⚠️ IndexedDB 삭제 실패:', dbName);
            };
        });
    }
    
    // 5. 성공 메시지 및 새로고침 안내
    setTimeout(function() {
        console.log('✅ 브라우저 캐시 초기화 완료!');
        
        const shouldReload = confirm(
            '🎉 캐시 초기화가 완료되었습니다!\n\n' +
            '변경사항을 적용하려면 페이지를 새로고침해야 합니다.\n' +
            '지금 새로고침하시겠습니까?'
        );
        
        if (shouldReload) {
            // 강제 새로고침 (캐시 무시)
            window.location.reload(true);
        }
    }, 2000);
    
})();

// 자동 실행 방지용 함수 (수동 호출 시에만 실행)
function resetPposhopCache() {
    const script = document.createElement('script');
    script.textContent = resetBrowserCache.toString() + '; resetBrowserCache();';
    document.head.appendChild(script);
}

console.log('🧹 뽀샵 캐시 초기화 스크립트 로드 완료');
console.log('💡 수동 실행: resetPposhopCache()');

// 콘솔에서 사용할 수 있도록 전역 함수 등록
window.resetPposhopCache = resetPposhopCache;