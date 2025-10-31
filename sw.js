// BeautyCat Service Worker - 완전 비활성화 버전
// 이 Service Worker는 아무것도 하지 않습니다 (Workbox 충돌 방지)

console.log('🐱 BeautyCat Service Worker - 비활성화 모드');

// 설치 시 즉시 활성화
self.addEventListener('install', event => {
  console.log('🔧 Service Worker 설치 - 비활성화 모드');
  self.skipWaiting();
});

// 활성화 시 기존 캐시 정리
self.addEventListener('activate', event => {
  console.log('✅ Service Worker 활성화 - 모든 캐시 정리');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      // 모든 캐시 삭제 (Workbox 포함)
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('🗑️ 캐시 삭제:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('🧹 모든 캐시 정리 완료');
      return self.clients.claim();
    })
  );
});

// Fetch 이벤트는 완전히 무시 (브라우저 기본 동작만 사용)
self.addEventListener('fetch', event => {
  // 아무것도 하지 않음 - 브라우저가 모든 요청을 직접 처리
  return;
});

console.log('✅ Service Worker 로드 완료 - 완전 비활성화 모드');