// BeautyCat 최소 Service Worker - workbox 완전 제거
const CACHE_NAME = 'beautycat-minimal-v1.0.0';

// Service Worker 설치 - 캐싱 없음
self.addEventListener('install', event => {
  console.log('🔧 Service Worker 설치 중 (최소 모드)');
  self.skipWaiting();
});

// Service Worker 활성화 - 기존 캐시 정리
self.addEventListener('activate', event => {
  console.log('✅ Service Worker 활성화 (최소 모드)');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('🗑️ 기존 캐시 삭제:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('🔄 클라이언트 즉시 제어 시작');
      return self.clients.claim();
    })
  );
});

// fetch 이벤트 완전 제거 - 모든 요청을 브라우저가 직접 처리
// workbox 관련 오류 완전 차단

// 메시지 이벤트 처리 (선택적)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🐱 BeautyCat Service Worker (최소 모드) 로딩 완료');