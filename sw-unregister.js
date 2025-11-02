/**
 * BeautyCat Service Worker 완전 제거
 * 
 * 모든 Service Worker를 즉시 제거하고 캐시를 삭제합니다.
 * 이 파일은 HTML의 가장 최상단에서 로드되어야 합니다.
 */

(function() {
    'use strict';
    
    console.log('🔧 Service Worker 제거 시작...');
    
    // Service Worker가 지원되는지 확인
    if ('serviceWorker' in navigator) {
        
        // 1. 모든 Service Worker 등록 해제
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            if (registrations.length === 0) {
                console.log('ℹ️ 등록된 Service Worker가 없습니다');
                return;
            }
            
            console.log(`📋 ${registrations.length}개의 Service Worker 발견`);
            
            registrations.forEach(function(registration, index) {
                console.log(`🗑️ Service Worker #${index + 1} 제거 중:`, registration.scope);
                registration.unregister().then(function(success) {
                    if (success) {
                        console.log(`✅ Service Worker #${index + 1} 제거 완료`);
                    } else {
                        console.warn(`⚠️ Service Worker #${index + 1} 제거 실패`);
                    }
                });
            });
            
            console.log('✅ 모든 Service Worker 제거 요청 완료');
        }).catch(function(error) {
            console.error('❌ Service Worker 제거 오류:', error);
        });
        
        // 2. Service Worker 캐시 삭제
        if ('caches' in window) {
            caches.keys().then(function(cacheNames) {
                if (cacheNames.length === 0) {
                    console.log('ℹ️ 삭제할 캐시가 없습니다');
                    return;
                }
                
                console.log(`📦 ${cacheNames.length}개의 캐시 발견`);
                
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        console.log(`🗑️ 캐시 삭제 중: ${cacheName}`);
                        return caches.delete(cacheName).then(function(success) {
                            if (success) {
                                console.log(`✅ 캐시 삭제 완료: ${cacheName}`);
                            }
                        });
                    })
                );
            }).then(function() {
                console.log('✅ 모든 캐시 삭제 완료');
            }).catch(function(error) {
                console.error('❌ 캐시 삭제 오류:', error);
            });
        }
        
    } else {
        console.log('ℹ️ Service Worker가 지원되지 않는 브라우저입니다');
    }
    
    // 3. 페이지 로드 완료 후 상태 확인
    window.addEventListener('load', function() {
        setTimeout(function() {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    if (registrations.length === 0) {
                        console.log('🎉 Service Worker 제거 검증 완료: 등록된 SW 없음');
                    } else {
                        console.warn('⚠️ 아직 ' + registrations.length + '개의 SW가 남아있습니다');
                        console.warn('💡 페이지를 새로고침(Ctrl+Shift+R)하세요');
                    }
                });
            }
        }, 1000);
    });
    
    console.log('🔧 Service Worker 제거 스크립트 초기화 완료');
    
})();