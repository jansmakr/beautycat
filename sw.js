// BeautyCat Service Worker - API 오버라이드 완전 지원 버전
const CACHE_NAME = 'beautycat-v2.3.1';

console.log('🐱 BeautyCat Service Worker 시작 - API 오버라이드 우선 모드');

// Service Worker 설치
self.addEventListener('install', event => {
  console.log('🔧 Service Worker 설치 중...');
  self.skipWaiting(); // 즉시 활성화
});

// Service Worker 활성화
self.addEventListener('activate', event => {
  console.log('✅ Service Worker 활성화됨');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ 구 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch 이벤트 - API 요청은 완전히 건드리지 않음
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // 🚨 중요: /tables/ 또는 /api/ 경로는 절대 처리하지 않음
  // event.respondWith()를 호출하지 않으면 브라우저가 직접 fetch 실행
  // 이를 통해 window.fetch 오버라이드가 정상 작동
  if (request.url.includes('/tables/') || request.url.includes('/api/')) {
    // 아무것도 하지 않음 - 브라우저가 직접 처리
    // window.fetch 오버라이드가 작동하여 Workers API로 변환됨
    return;
  }
  
  // 메인 도메인 및 네비게이션 요청도 처리하지 않음
  if (
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '' ||
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    url.origin !== self.location.origin ||
    request.method !== 'GET' ||
    url.hostname !== self.location.hostname
  ) {
    return; // 브라우저가 직접 처리
  }
  
  // 오직 안전한 정적 리소스만 캐싱
  const isSafeStaticResource = (
    request.destination === 'script' || 
    request.destination === 'style' || 
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.ico')
  );
  
  if (!isSafeStaticResource) {
    return; // 처리하지 않는 리소스는 브라우저가 직접 처리
  }
  
  // 정적 리소스만 캐시 전략 적용
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request.clone(), {
          method: 'GET',
          mode: 'cors',
          credentials: 'same-origin',
          redirect: 'follow',
          cache: 'default'
        }).then(response => {
          // 성공적인 응답만 캐시
          if (response && response.status === 200 && response.type !== 'opaque') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            }).catch(err => {
              console.warn('캐시 저장 실패:', err.message);
            });
          }
          return response;
        }).catch(error => {
          console.warn('네트워크 요청 실패:', url.pathname, error.message);
          
          // 오프라인 대체 응답
          if (request.destination === 'image') {
            return new Response('', { status: 404, statusText: 'Image not found' });
          }
          if (request.destination === 'script') {
            return new Response('// Offline', { 
              status: 200,
              headers: { 'Content-Type': 'text/javascript' }
            });
          }
          if (request.destination === 'style') {
            return new Response('/* Offline */', { 
              status: 200,
              headers: { 'Content-Type': 'text/css' }
            });
          }
          return new Response('Resource unavailable', { status: 503 });
        });
      })
      .catch(error => {
        console.error('캐시 조회 실패:', error.message);
        return new Response('Cache error', { status: 500 });
      })
  );
});

// 메시지 처리
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('🎉 BeautyCat Service Worker 로드 완료 - API 오버라이드 우선 모드');
