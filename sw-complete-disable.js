// 🚨 Service Worker 완전 비활성화
// 리다이렉트 오류 완전 해결을 위한 최소한의 Service Worker

console.log('🚨 Service Worker 완전 비활성화 모드');

// 즉시 스킵하여 활성화
self.addEventListener('install', event => {
  console.log('SW: 설치 (즉시 스킵)');
  self.skipWaiting();
});

// 즉시 클라이언트 제어
self.addEventListener('activate', event => {
  console.log('SW: 활성화 (즉시 클라이언트 제어)');
  event.waitUntil(
    Promise.all([
      // 모든 기존 캐시 삭제
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }),
      self.clients.claim()
    ])
  );
});

// 🚨 중요: fetch 이벤트를 아예 처리하지 않음
// 이렇게 하면 브라우저가 모든 네트워크 요청을 직접 처리하여 
// 리다이렉트 오류가 발생하지 않습니다.

// fetch 이벤트 리스너를 등록하지 않음으로써 
// Service Worker의 네트워크 개입을 완전히 차단

console.log('🎉 Service Worker 완전 비활성화 완료 - 모든 요청을 브라우저가 직접 처리');