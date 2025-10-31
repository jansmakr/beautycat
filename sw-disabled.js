// 🚫 Service Worker 완전 비활성화 - 포워딩 리다이렉트 오류 해결
// 이 파일은 리다이렉트 문제를 완전히 우회합니다.

console.log('🚫 Service Worker 비활성화됨 - 포워딩 환경 최적화');

self.addEventListener('install', event => {
  console.log('SW: 비활성화된 서비스워커 설치 중...');
  // 즉시 활성화
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('SW: 비활성화된 서비스워커 활성화 중...');
  
  // 모든 클라이언트 제어
  self.clients.claim();
  
  // 기존 캐시 모두 삭제 (포워딩 충돌 방지)
  event.waitUntil(
    Promise.all([
      // 모든 캐시 삭제
      caches.keys().then(cacheNames => {
        console.log('SW: 캐시 삭제 중:', cacheNames);
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('SW: 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      
      // 클라이언트에게 새로고침 신호
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_DISABLED',
            message: 'Service Worker가 비활성화되었습니다. 포워딩 환경에 최적화됨.'
          });
        });
      })
    ])
  );
});

// 🚨 중요: fetch 이벤트 리스너를 완전히 제거
// 어떤 네트워크 요청도 가로채지 않음 - 모든 것을 브라우저가 직접 처리
// 포워딩된 요청이 Service Worker에 의해 차단되지 않도록 함

console.log('✅ Service Worker 비활성화 완료 - 모든 네트워크 요청이 브라우저로 직접 전달됩니다.');