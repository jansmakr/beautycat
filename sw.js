const CACHE_NAME = 'beautycat-v2.0.2';
const urlsToCache = [
  '/',
  './',
  'index.html',
  'login.html',
  'register.html',
  'chat.html',
  'customer-dashboard.html',
  'shop-dashboard.html',
  'contact-inquiry.html',
  'js/main.js',
  'js/auth.js',
  'js/regional-matching.js',
  'js/config.js',
  'js/logger.js',
  'js/customer-dashboard.js',
  'js/shop-dashboard.js',
  'manifest.json',
  'icons/icon-48x48.png',
  'icons/icon-72x72.png',
  'icons/icon-96x96.png',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// 설치 이벤트
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  // 즉시 활성화
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // 각 URL을 개별적으로 캐시하여 실패한 것들을 건너뛸 수 있도록 함
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(error => {
              console.warn(`Failed to cache ${url}:`, error.message);
              return null; // 실패한 것은 무시하고 계속 진행
            })
          )
        );
      })
      .then(results => {
        const successful = results.filter(result => result.status === 'fulfilled').length;
        const failed = results.filter(result => result.status === 'rejected').length;
        console.log(`Cached ${successful} resources successfully, ${failed} failed`);
      })
      .catch(error => {
        console.error('Failed to open cache:', error);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  // 모든 클라이언트를 즉시 제어
  event.waitUntil(
    Promise.all([
      // 기존 캐시 정리
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 모든 클라이언트를 즉시 제어
      self.clients.claim()
    ])
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  // API 요청은 항상 네트워크 우선
  if (event.request.url.includes('/tables/') || 
      event.request.url.includes('api') ||
      event.request.method !== 'GET') {
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          console.error('Network request failed:', error);
          // 오프라인 상태에서 기본 응답 반환
          if (event.request.url.includes('/tables/')) {
            return new Response(JSON.stringify({
              error: 'Offline mode',
              message: '현재 오프라인 상태입니다. 네트워크 연결을 확인해주세요.'
            }), {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' }
            });
          }
        })
    );
    return;
  }

  // 정적 리소스는 캐시 우선, 네트워크 폴백
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 캐시에서 반환
        if (response) {
          return response;
        }
        
        // 루트 경로 요청인 경우 index.html로 대체 시도
        if (event.request.url.endsWith('/') || event.request.url === self.location.origin + '/') {
          return caches.match('/index.html') || caches.match('./index.html');
        }
        
        // 캐시에 없으면 네트워크에서 가져오기
        return fetch(event.request)
          .then(response => {
            // 응답이 없거나 네트워크 에러인 경우
            if (!response) {
              throw new Error('No response received');
            }
            
            // 유효한 응답인지 확인 (2xx, 3xx 상태 코드)
            if (response.status >= 200 && response.status < 400 && response.type === 'basic') {
              // 응답을 복제해서 캐시에 저장
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  // URL이 유효한지 확인 후 캐시에 저장
                  if (event.request.url.indexOf('http') === 0) {
                    cache.put(event.request, responseToCache);
                  }
                })
                .catch(cacheError => {
                  // 캐시 저장 실패는 조용히 무시
                });
            }

            return response;
          })
          .catch(error => {
            // 개발 모드에서만 에러 로그 출력
            if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
              console.warn('SW Fetch failed (dev mode):', error.message);
            }
            
            // HTML 요청에 대한 오프라인 폴백
            if (event.request.destination === 'document') {
              return caches.match('/index.html') || 
                     caches.match('/') || 
                     caches.match('./index.html') ||
                     caches.match('./');
            }
            
            // 이미지 요청 실패 시 기본 이미지 반환
            if (event.request.destination === 'image') {
              return new Response('', {
                status: 200,
                statusText: 'OK'
              });
            }
            
            // 기타 리소스는 빈 응답 반환 (에러 숨김)
            return new Response('', {
              status: 200,
              statusText: 'OK'
            });
          });
      })
  );
});

// 백그라운드 동기화 (향후 구현)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // 오프라인에서 저장된 데이터 동기화 로직
  }
});

// 푸시 알림 (향후 구현)
self.addEventListener('push', event => {
  const options = {
    body: '새로운 견적이 도착했습니다!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('beautycat 알림', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    // 앱 열기
    event.waitUntil(
      clients.openWindow('/customer-dashboard.html')
    );
  } else if (event.action === 'close') {
    // 알림만 닫기
    console.log('Notification closed');
  } else {
    // 기본 동작: 앱 열기
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 오류 처리
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

// 메시지 처리 (클라이언트와 통신)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({version: CACHE_NAME});
  }
});