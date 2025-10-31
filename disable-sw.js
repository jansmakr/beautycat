// Service Worker 완전 비활성화 스크립트
// 기존 Service Worker를 안전하게 제거하고 비활성화

(function() {
    'use strict';
    
    console.log('🔧 Service Worker 정리 시작...');
    
    // 기존 Service Worker 등록 해제
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                console.log('🗑️ Service Worker 등록 해제:', registration.scope);
                registration.unregister();
            }
        }).catch(function(error) {
            console.log('Service Worker 등록 해제 실패:', error);
        });
        
        // 활성 Service Worker 제거
        navigator.serviceWorker.ready.then(function(registration) {
            if (registration.active) {
                console.log('🔄 활성 Service Worker 제거 중...');
                registration.active.postMessage({action: 'skipWaiting'});
            }
        });
    }
    
    // 캐시 스토리지 정리
    if ('caches' in window) {
        caches.keys().then(function(names) {
            names.forEach(function(name) {
                console.log('🗑️ 캐시 삭제:', name);
                caches.delete(name);
            });
        });
    }
    
    console.log('✅ Service Worker 정리 완료');
})();